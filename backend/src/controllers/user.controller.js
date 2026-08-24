const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

/**
 * @desc    Get current logged in user's profile
 * @route   GET /api/users/profile
 * @access  Private
 */
const getProfile = async (req, res, next) => {
  try {
    return res.status(200).json({
      success: true,
      message: 'প্রোফাইল তথ্য সফলভাবে সংগৃহীত হয়েছে।',
      data: { user: req.user },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update current logged in user's profile
 * @route   PUT /api/users/profile
 * @access  Private
 */
const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, profileImage } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'ইউজার অ্যাকাউন্ট পাওয়া যায়নি।',
      });
    }

    if (name && name.trim()) {
      user.name = name.trim();
    }

    if (profileImage !== undefined) {
      user.profileImage = profileImage;
    }

    if (phone && phone.trim() && phone.trim() !== user.phone) {
      const existingPhone = await User.findOne({ phone: phone.trim() });
      if (existingPhone && existingPhone._id.toString() !== user._id.toString()) {
        return res.status(400).json({
          success: false,
          message: 'এই ফোন নম্বরটি অন্য একটি অ্যাকাউন্টে ব্যবহৃত হচ্ছে।',
        });
      }
      user.phone = phone.trim();
    }

    await user.save();

    const safeUser = await User.findById(user._id);

    return res.status(200).json({
      success: true,
      message: 'প্রোফাইল তথ্য সফলভাবে আপডেট করা হয়েছে।',
      data: { user: safeUser },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Change current logged in user's password
 * @route   PUT /api/users/change-password
 * @access  Private
 */
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'বর্তমান পাসওয়ার্ড এবং নতুন পাসওয়ার্ড প্রদান করা আবশ্যক।',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'নতুন পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।',
      });
    }

    // Explicitly select password field to compare
    const user = await User.findById(req.user._id).select('+password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'ইউজার অ্যাকাউন্ট পাওয়া যায়নি।',
      });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'বর্তমান পাসওয়ার্ডটি সঠিক নয়।',
      });
    }

    // Hash new password using project convention (salt rounds: 12)
    user.password = await bcrypt.hash(newPassword, 12);
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে।',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all users (Admin only, with pagination & search)
 * @route   GET /api/users
 * @access  Private (Admin)
 */
const getAllUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const { role, isActive, search } = req.query;

    const query = {};

    if (role && ['admin', 'driver', 'customer'].includes(role)) {
      query.role = role;
    }

    if (isActive !== undefined) {
      query.isActive = isActive === 'true' || isActive === true;
    }

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { phone: searchRegex },
      ];
    }

    const total = await User.countDocuments(query);
    const totalPages = Math.ceil(total / limit) || 1;

    const users = await User.find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: 'ব্যবহারকারীদের তালিকা সফলভাবে পাওয়া গেছে।',
      data: {
        users,
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
 * @desc    Get single user details by ID (Admin only)
 * @route   GET /api/users/:id
 * @access  Private (Admin)
 */
const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'অবৈধ ইউজার আইডি প্রদান করা হয়েছে।',
      });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'ইউজার পাওয়া যায়নি।',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'ইউজার বিবরণ সফলভাবে পাওয়া গেছে।',
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Activate/deactivate a user (Admin only)
 * @route   PATCH /api/users/:id/status
 * @access  Private (Admin)
 */
const updateUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'অবৈধ ইউজার আইডি প্রদান করা হয়েছে।',
      });
    }

    if (typeof isActive !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'isActive এর মান বুলিয়ান (true/false) হওয়া আবশ্যক।',
      });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'ইউজার পাওয়া যায়নি।',
      });
    }

    // Prevent deactivating the last active admin
    if (!isActive && user.role === 'admin') {
      const activeAdmins = await User.countDocuments({ role: 'admin', isActive: true });
      if (activeAdmins <= 1) {
        return res.status(400).json({
          success: false,
          message: 'সিস্টেমে অন্তত একজন সক্রিয় অ্যাডমিন থাকা আবশ্যক। এই অ্যাকাউন্টটি নিষ্ক্রিয় করা যাবে না।',
        });
      }
    }

    user.isActive = isActive;
    await user.save();

    const updatedUser = await User.findById(user._id);

    return res.status(200).json({
      success: true,
      message: `ইউজার স্ট্যাটাস সফলভাবে ${isActive ? 'সক্রিয়' : 'নিষ্ক্রিয়'} করা হয়েছে।`,
      data: { user: updatedUser },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update user role (Admin only)
 * @route   PATCH /api/users/:id/role
 * @access  Private (Admin)
 */
const updateUserRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'অবৈধ ইউজার আইডি প্রদান করা হয়েছে।',
      });
    }

    const allowedRoles = ['admin', 'driver', 'customer'];
    if (!role || !allowedRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'অবৈধ রোল প্রদান করা হয়েছে। রোল অবশ্যই admin, driver, অথবা customer হতে হবে।',
      });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'ইউজার পাওয়া যায়নি।',
      });
    }

    // Prevent demoting the last active admin
    if (user.role === 'admin' && role !== 'admin') {
      const activeAdmins = await User.countDocuments({ role: 'admin', isActive: true });
      if (activeAdmins <= 1) {
        return res.status(400).json({
          success: false,
          message: 'সিস্টেমে অন্তত একজন সক্রিয় অ্যাডমিন থাকা আবশ্যক। এই অ্যাডমিনের রোল পরিবর্তন করা যাবে না।',
        });
      }
    }

    user.role = role;
    await user.save();

    const updatedUser = await User.findById(user._id);

    return res.status(200).json({
      success: true,
      message: 'ইউজার রোল সফলভাবে আপডেট করা হয়েছে।',
      data: { user: updatedUser },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  changePassword,
  getAllUsers,
  getUserById,
  updateUserStatus,
  updateUserRole,
};
