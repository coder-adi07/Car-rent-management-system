const mongoose = require('mongoose');
const Customer = require('../models/Customer');

/**
 * @desc    Get logged in customer's own profile
 * @route   GET /api/customers/me
 * @access  Private (Customer only)
 */
const getCustomerMe = async (req, res, next) => {
  try {
    const customer = await Customer.findOne({ user: req.user._id }).populate('user');

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'কাস্টমার প্রোফাইল পাওয়া যায়নি।',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'কাস্টমার প্রোফাইল সফলভাবে পাওয়া গেছে।',
      data: { customer },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all customers (Admin only, with pagination & search)
 * @route   GET /api/customers
 * @access  Private (Admin)
 */
const getAllCustomers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const { status, search } = req.query;

    const query = {};

    if (status && ['active', 'inactive', 'suspended'].includes(status)) {
      query.status = status;
    }

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { fullName: searchRegex },
        { email: searchRegex },
        { phone: searchRegex },
      ];
    }

    const total = await Customer.countDocuments(query);
    const totalPages = Math.ceil(total / limit) || 1;

    const customers = await Customer.find(query)
      .populate('user')
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: 'কাস্টমারদের তালিকা সফলভাবে পাওয়া গেছে।',
      data: {
        customers,
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
 * @desc    Get single customer details by ID (Admin only)
 * @route   GET /api/customers/:id
 * @access  Private (Admin)
 */
const getCustomerById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'অবৈধ কাস্টমার আইডি প্রদান করা হয়েছে।',
      });
    }

    const customer = await Customer.findById(id).populate('user');

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'কাস্টমার তথ্য পাওয়া যায়নি।',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'কাস্টমার বিবরণ সফলভাবে পাওয়া গেছে।',
      data: { customer },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCustomerMe,
  getAllCustomers,
  getCustomerById,
};
