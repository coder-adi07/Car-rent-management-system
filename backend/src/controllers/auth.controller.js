const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Customer = require('../models/Customer');
const Driver = require('../models/Driver');
const Notification = require('../models/Notification');
const generateToken = require('../utils/generateToken');

/**
 * @desc    Register a new user (Customer or Driver)
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = async (req, res, next) => {
  try {
    const { name, email, phone, password, role: requestedRole, licenseNumber } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'নাম, ইমেইল এবং পাসওয়ার্ড প্রদান করা আবশ্যক।',
      });
    }

    // Determine target role (customer or driver)
    const role = requestedRole === 'driver' ? 'driver' : 'customer';

    // Validate license number if registering as driver
    if (role === 'driver' && licenseNumber && licenseNumber.trim()) {
      const existingLicense = await Driver.findOne({ licenseNumber: licenseNumber.trim() });
      if (existingLicense) {
        return res.status(400).json({
          success: false,
          message: 'এই ড্রাইভিং লাইসেন্স নম্বরটি ইতিপূর্বে ব্যবহার করা হয়েছে।',
        });
      }
    }

    // Validate email format
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'সঠিক ইমেইল ঠিকানা প্রদান করুন।',
      });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।',
      });
    }

    // Check duplicate email
    const existingEmail = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: 'এই ইমেইল দিয়ে ইতিপূর্বে অ্যাকাউন্ট খোলা হয়েছে।',
      });
    }

    // Check duplicate phone if provided
    if (phone && phone.trim()) {
      const existingPhone = await User.findOne({ phone: phone.trim() });
      if (existingPhone) {
        return res.status(400).json({
          success: false,
          message: 'এই ফোন নম্বরটি ইতিপূর্বে ব্যবহার করা হয়েছে।',
        });
      }
    }

    // Hash password with bcryptjs (salt rounds: 12)
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create User record
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone ? phone.trim() : null,
      password: hashedPassword,
      role,
      isActive: true,
    });

    // Create corresponding Customer or Driver document
    if (role === 'driver') {
      const drvLicense = licenseNumber && licenseNumber.trim() ? licenseNumber.trim() : `LIC-${Date.now().toString().slice(-6)}`;
      const drvExpiry = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000 * 3);
      await Driver.create({
        user: user._id,
        fullName: user.name,
        phone: user.phone || 'N/A',
        email: user.email,
        licenseNumber: drvLicense,
        licenseExpiryDate: drvExpiry,
        status: 'pending',
        isVerified: false,
      });

      // Send System Notification to all Admins for driver verification
      const admins = await User.find({ role: 'admin' });
      for (const admin of admins) {
        await Notification.create({
          recipient: admin._id,
          type: 'system',
          title: '👨‍✈️ নতুন ড্রাইভার রেজিস্ট্রেশন অ্যালার্ট',
          message: `নতুন ড্রাইভার "${user.name}" (${user.phone || user.email}) প্ল্যাটফর্মে আবেদন করেছেন। ড্রাইভার তালিকায় গিয়ে ভেরিফাই ও স্ট্যাটাস সক্রিয় করুন।`,
        });
      }
    } else {
      await Customer.create({
        user: user._id,
        fullName: user.name,
        phone: user.phone || 'N/A',
        email: user.email,
        status: 'active',
      });
    }

    // Generate JWT token
    const token = generateToken(user);

    // Prepare response data without sensitive password fields
    const userData = {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      profileImage: user.profileImage,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    return res.status(201).json({
      success: true,
      message: 'নিবন্ধন সফলভাবে সম্পন্ন হয়েছে।',
      data: { user: userData },
      token,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Authenticate user & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'ইমেইল এবং পাসওয়ার্ড প্রদান করা আবশ্যক।',
      });
    }

    // Find user by email and explicitly select password
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'অবৈধ ইমেইল অথবা পাসওয়ার্ড।',
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'আপনার অ্যাকাউন্টটি নিষ্ক্রিয় রয়েছে। অনুগ্রহ করে অ্যাডমিনের সাথে যোগাযোগ করুন।',
      });
    }

    // Verify password using bcryptjs
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'অবৈধ ইমেইল অথবা পাসওয়ার্ড।',
      });
    }

    // Update lastLogin date
    user.lastLogin = new Date();
    await user.save();

    // Check & populate profileImage if missing on User model
    let userProfileImage = user.profileImage;
    if (!userProfileImage) {
      if (user.role === 'driver') {
        const driver = await Driver.findOne({ user: user._id });
        if (driver && driver.profileImage) {
          userProfileImage = driver.profileImage;
          await User.findByIdAndUpdate(user._id, { profileImage: driver.profileImage });
        }
      } else if (user.role === 'customer') {
        const customer = await Customer.findOne({ user: user._id });
        if (customer && customer.profileImage) {
          userProfileImage = customer.profileImage;
          await User.findByIdAndUpdate(user._id, { profileImage: customer.profileImage });
        }
      }
    }

    // Generate JWT token
    const token = generateToken(user);

    // Prepare response user object
    const userData = {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      profileImage: userProfileImage,
      isActive: user.isActive,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    return res.status(200).json({
      success: true,
      message: 'লগইন সফল হয়েছে।',
      data: { user: userData },
      token,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get authenticated current user details
 * @route   GET /api/auth/me
 * @access  Private (Protected by protect middleware)
 */
const getMe = async (req, res, next) => {
  try {
    const userObj = req.user.toObject ? req.user.toObject() : { ...req.user };
    if (!userObj.profileImage) {
      if (userObj.role === 'driver') {
        const driver = await Driver.findOne({ user: userObj._id });
        if (driver && driver.profileImage) {
          userObj.profileImage = driver.profileImage;
          await User.findByIdAndUpdate(userObj._id, { profileImage: driver.profileImage });
        }
      } else if (userObj.role === 'customer') {
        const customer = await Customer.findOne({ user: userObj._id });
        if (customer && customer.profileImage) {
          userObj.profileImage = customer.profileImage;
          await User.findByIdAndUpdate(userObj._id, { profileImage: customer.profileImage });
        }
      }
    }

    return res.status(200).json({
      success: true,
      message: 'ইউজার তথ্য সফলভাবে সংগৃহীত হয়েছে।',
      data: { user: userObj },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Logout user / clear token on client
 * @route   POST /api/auth/logout
 * @access  Public
 */
const logout = async (req, res, next) => {
  try {
    return res.status(200).json({
      success: true,
      message: 'সফলভাবে লগআউট করা হয়েছে। দয়া করে ক্লায়েন্ট থেকে টোকেনটি মুছে ফেলুন।',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
  logout,
};
