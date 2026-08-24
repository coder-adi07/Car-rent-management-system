const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Driver = require('../models/Driver');
const User = require('../models/User');

/**
 * @desc    Get logged in driver's own profile
 * @route   GET /api/drivers/me
 * @access  Private (Driver only)
 */
const getDriverMe = async (req, res, next) => {
  try {
    const driver = await Driver.findOne({ user: req.user._id })
      .populate('user')
      .populate('assignedCar');

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: 'ড্রাইভার প্রোফাইল পাওয়া যায়নি।',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'ড্রাইভার প্রোফাইল সফলভাবে পাওয়া গেছে।',
      data: { driver },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update logged in driver's own profile
 * @route   PUT /api/drivers/me
 * @access  Private (Driver only)
 */
const updateDriverMe = async (req, res, next) => {
  try {
    const driver = await Driver.findOne({ user: req.user._id });
    if (!driver) {
      return res.status(404).json({
        success: false,
        message: 'ড্রাইভার প্রোফাইল পাওয়া যায়নি।',
      });
    }

    const {
      fullName,
      phone,
      email,
      profileImage,
      dateOfBirth,
      address,
      licenseNumber,
      licenseExpiryDate,
      experienceYears,
      emergencyContact,
    } = req.body;

    const user = await User.findById(req.user._id);

    if (fullName && fullName.trim()) {
      driver.fullName = fullName.trim();
      if (user) {
        user.name = fullName.trim();
      }
    }

    if (phone && phone.trim()) driver.phone = phone.trim();
    if (email && email.trim()) driver.email = email.trim();

    if (profileImage !== undefined) {
      driver.profileImage = profileImage;
      if (user) {
        user.profileImage = profileImage;
      }
    }

    if (user) {
      await user.save();
    }

    if (dateOfBirth) driver.dateOfBirth = dateOfBirth;
    if (address) driver.address = address;
    if (licenseNumber && licenseNumber.trim()) driver.licenseNumber = licenseNumber.trim();
    if (licenseExpiryDate) driver.licenseExpiryDate = licenseExpiryDate;
    if (experienceYears !== undefined) driver.experienceYears = Number(experienceYears);
    if (emergencyContact) driver.emergencyContact = emergencyContact;

    await driver.save();

    const updatedDriver = await Driver.findById(driver._id)
      .populate('user')
      .populate('assignedCar');

    return res.status(200).json({
      success: true,
      message: 'আপনার ড্রাইভার প্রোফাইল সফলভাবে আপডেট করা হয়েছে।',
      data: { driver: updatedDriver },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all drivers (Admin only, with pagination & filters)
 * @route   GET /api/drivers
 * @access  Private (Admin)
 */
const getAllDrivers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const { status, search, city } = req.query;

    const query = {};

    if (status && ['pending', 'available', 'busy', 'inactive', 'suspended'].includes(status)) {
      query.status = status;
    }

    if (city && city.trim()) {
      query['address.city'] = new RegExp(city.trim(), 'i');
    }

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { fullName: searchRegex },
        { phone: searchRegex },
        { licenseNumber: searchRegex },
      ];
    }

    const total = await Driver.countDocuments(query);
    const totalPages = Math.ceil(total / limit) || 1;

    const drivers = await Driver.find(query)
      .populate('user')
      .populate('assignedCar')
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: 'ড্রাইভারদের তালিকা সফলভাবে পাওয়া গেছে।',
      data: {
        drivers,
        pagination: {
          page,
          limit,
          total,
          totalPages,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single driver details by ID (Admin only)
 * @route   GET /api/drivers/:id
 * @access  Private (Admin)
 */
const getDriverById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'অবৈধ ড্রাইভার আইডি প্রদান করা হয়েছে।',
      });
    }

    const driver = await Driver.findById(id)
      .populate('user')
      .populate('assignedCar');

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: 'ড্রাইভার তথ্য পাওয়া যায়নি।',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'ড্রাইভার বিবরণ সফলভাবে পাওয়া গেছে।',
      data: { driver },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Admin: Add a new driver directly
 * @route   POST /api/drivers
 * @access  Private (Admin only)
 */
const createDriverByAdmin = async (req, res, next) => {
  try {
    const {
      name,
      email,
      phone,
      password,
      licenseNumber,
      licenseExpiryDate,
      experienceYears,
      profileImage,
      address,
    } = req.body;

    if (!name || !email || !password || !licenseNumber) {
      return res.status(400).json({
        success: false,
        message: 'নাম, ইমেইল, পাসওয়ার্ড এবং লাইসেন্স নম্বর প্রদান করা আবশ্যক।',
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'এই ইমেইল দিয়ে ইতিপূর্বে অ্যাকাউন্ট বিদ্যমান।',
      });
    }

    const existingLicense = await Driver.findOne({ licenseNumber: licenseNumber.trim() });
    if (existingLicense) {
      return res.status(400).json({
        success: false,
        message: 'এই ড্রাইভিং লাইসেন্স নম্বরটি ইতিপূর্বে ব্যবহৃত হয়েছে।',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone ? phone.trim() : null,
      password: hashedPassword,
      role: 'driver',
      profileImage: profileImage || null,
      isActive: true,
    });

    const driver = await Driver.create({
      user: user._id,
      fullName: user.name,
      phone: user.phone || 'N/A',
      email: user.email,
      licenseNumber: licenseNumber.trim(),
      licenseExpiryDate: licenseExpiryDate ? new Date(licenseExpiryDate) : new Date(Date.now() + 86400000 * 365 * 3),
      experienceYears: Number(experienceYears) || 0,
      profileImage: profileImage || null,
      address: address || null,
      status: 'available',
      isVerified: true,
    });

    const populatedDriver = await Driver.findById(driver._id).populate('user');

    return res.status(201).json({
      success: true,
      message: 'নতুন ড্রাইভার সফলভাবে যোগ করা হয়েছে।',
      data: { driver: populatedDriver },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Admin: Verify/Approve driver profile
 * @route   PATCH /api/drivers/:id/verify
 * @access  Private (Admin only)
 */
const verifyDriverByAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isVerified, status } = req.body;

    const driver = await Driver.findById(id);
    if (!driver) {
      return res.status(404).json({
        success: false,
        message: 'ড্রাইভার পাওয়া যায়নি।',
      });
    }

    if (isVerified !== undefined) driver.isVerified = isVerified;
    if (status) driver.status = status;
    if (isVerified && (driver.status === 'pending' || driver.status === 'inactive')) {
      driver.status = 'available';
    }

    await driver.save();
    const updated = await Driver.findById(id).populate('user');

    return res.status(200).json({
      success: true,
      message: `ড্রাইভার "${driver.fullName}" এর ভেরিফিকেশন ও স্ট্যাটাস আপডেট হয়েছে।`,
      data: { driver: updated },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDriverMe,
  updateDriverMe,
  getAllDrivers,
  getDriverById,
  createDriverByAdmin,
  verifyDriverByAdmin,
};
