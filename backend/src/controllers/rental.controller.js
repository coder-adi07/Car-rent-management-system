const mongoose = require('mongoose');
const Rental = require('../models/Rental');
const Booking = require('../models/Booking');
const Customer = require('../models/Customer');
const Driver = require('../models/Driver');
const Car = require('../models/Car');

/**
 * Helper to generate unique rental ID (e.g. RNT-2026-0076)
 */
const generateRentalId = async () => {
  const year = new Date().getFullYear();
  const count = await Rental.countDocuments();
  const sequence = String(count + 1).padStart(4, '0');
  const candidateId = `RNT-${year}-${sequence}`;

  const exists = await Rental.findOne({ rentalId: candidateId });
  if (exists) {
    const timestamp = Date.now().toString().slice(-4);
    return `RNT-${year}-${timestamp}`;
  }
  return candidateId;
};

/**
 * @desc    Get rentals (Admin: all, Customer: own, Driver: assigned)
 * @route   GET /api/rentals
 * @access  Private
 */
const getAllRentals = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const { status, search } = req.query;

    const query = {};

    if (status && ['scheduled', 'active', 'completed', 'overdue', 'cancelled'].includes(status)) {
      query.status = status;
    }

    if (req.user.role === 'customer') {
      const customer = await Customer.findOne({ user: req.user._id });
      if (!customer) {
        return res.status(200).json({
          success: true,
          message: 'কোনো রেন্টাল তথ্য পাওয়া যায়নি।',
          data: { rentals: [], pagination: { page: 1, limit, total: 0, totalPages: 1 } },
        });
      }
      query.customer = customer._id;
    } else if (req.user.role === 'driver') {
      const driver = await Driver.findOne({ user: req.user._id });
      if (!driver) {
        return res.status(200).json({
          success: true,
          message: 'কোনো রেন্টাল তথ্য পাওয়া যায়নি।',
          data: { rentals: [], pagination: { page: 1, limit, total: 0, totalPages: 1 } },
        });
      }
      query.driver = driver._id;
    }

    if (search && search.trim()) {
      query.rentalId = new RegExp(search.trim(), 'i');
    }

    const total = await Rental.countDocuments(query);
    const totalPages = Math.ceil(total / limit) || 1;

    const rentals = await Rental.find(query)
      .populate('booking')
      .populate('customer')
      .populate('car')
      .populate('driver')
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: 'রেন্টাল চুক্তি তালিকা সফলভাবে পাওয়া গেছে।',
      data: {
        rentals,
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
 * @desc    Get single rental details by ID
 * @route   GET /api/rentals/:id
 * @access  Private
 */
const getRentalById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'অবৈধ রেন্টাল আইডি প্রদান করা হয়েছে।',
      });
    }

    const rental = await Rental.findById(id)
      .populate('booking')
      .populate({ path: 'customer', populate: { path: 'user' } })
      .populate('car')
      .populate({ path: 'driver', populate: { path: 'user' } });

    if (!rental) {
      return res.status(404).json({
        success: false,
        message: 'রেন্টাল চুক্তি পাওয়া যায়নি।',
      });
    }

    // Role-based authorization check
    if (req.user.role === 'customer') {
      const customer = await Customer.findOne({ user: req.user._id });
      if (!customer || rental.customer._id.toString() !== customer._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'আপনার এই রেন্টাল তথ্য দেখার অনুমতি নেই।',
        });
      }
    } else if (req.user.role === 'driver') {
      const driver = await Driver.findOne({ user: req.user._id });
      if (!driver || !rental.driver || rental.driver._id.toString() !== driver._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'আপনার এই রেন্টাল তথ্য দেখার অনুমতি নেই।',
        });
      }
    }

    return res.status(200).json({
      success: true,
      message: 'রেন্টাল চুক্তি বিবরণ সফলভাবে পাওয়া গেছে।',
      data: { rental },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new rental contract from an eligible booking (Admin only)
 * @route   POST /api/rentals
 * @access  Private (Admin)
 */
const createRental = async (req, res, next) => {
  try {
    const { bookingId, booking: bookingParam, startMileage, startFuelLevel, notes } = req.body;
    const targetBookingId = bookingId || bookingParam;

    if (!targetBookingId || !mongoose.Types.ObjectId.isValid(targetBookingId)) {
      return res.status(400).json({
        success: false,
        message: 'সঠিক বুকিং আইডি প্রদান করুন।',
      });
    }

    const booking = await Booking.findById(targetBookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'রেন্টাল তৈরির জন্য নির্ধারিত বুকিংটি পাওয়া যায়নি।',
      });
    }

    // Prevent duplicate rental for the same booking
    const existingRental = await Rental.findOne({ booking: booking._id });
    if (existingRental) {
      return res.status(400).json({
        success: false,
        message: 'এই বুকিংয়ের জন্য ইতোমধ্যে রেন্টাল চুক্তি তৈরি করা হয়েছে।',
      });
    }

    const rentalId = await generateRentalId();
    const rentalAmount = booking.totalAmount;
    const additionalCharges = 0;
    const discount = 0;
    const finalAmount = rentalAmount;

    const rental = await Rental.create({
      rentalId,
      booking: booking._id,
      customer: booking.customer,
      car: booking.car,
      driver: booking.driver || null,
      startDate: booking.startDate,
      expectedReturnDate: booking.endDate,
      actualReturnDate: null,
      startMileage: startMileage ? Number(startMileage) : 45000,
      endMileage: null,
      startFuelLevel: startFuelLevel !== undefined ? Number(startFuelLevel) : 100,
      endFuelLevel: null,
      rentalAmount,
      additionalCharges,
      discount,
      finalAmount,
      status: 'active',
      damageReport: null,
      notes: notes ? notes.trim() : 'গাড়ি হস্তান্তরিত করা হয়েছে এবং রেন্টাল শুরু হয়েছে।',
    });

    // Update Car status to rented
    await Car.updateOne({ _id: booking.car }, { status: 'rented' });

    const populatedRental = await Rental.findById(rental._id)
      .populate('booking')
      .populate('customer')
      .populate('car')
      .populate('driver');

    return res.status(201).json({
      success: true,
      message: 'রেন্টাল চুক্তি সফলভাবে তৈরি করা হয়েছে।',
      data: { rental: populatedRental },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update rental status (Admin only)
 * @route   PATCH /api/rentals/:id/status
 * @access  Private (Admin)
 */
const updateRentalStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'অবৈধ রেন্টাল আইডি প্রদান করা হয়েছে।',
      });
    }

    const validStatuses = ['scheduled', 'active', 'completed', 'overdue', 'cancelled'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'অবৈধ স্ট্যাটাস প্রদান করা হয়েছে।',
      });
    }

    const rental = await Rental.findById(id);
    if (!rental) {
      return res.status(404).json({
        success: false,
        message: 'রেন্টাল চুক্তি পাওয়া যায়নি।',
      });
    }

    rental.status = status;
    await rental.save();

    const updatedRental = await Rental.findById(rental._id)
      .populate('booking')
      .populate('customer')
      .populate('car')
      .populate('driver');

    return res.status(200).json({
      success: true,
      message: 'রেন্টাল স্ট্যাটাস সফলভাবে পরিবর্তন করা হয়েছে।',
      data: { rental: updatedRental },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Process vehicle return for rental completion (Admin only)
 * @route   PATCH /api/rentals/:id/return
 * @access  Private (Admin)
 */
const returnRental = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      actualReturnDate,
      endMileage,
      endFuelLevel,
      additionalCharges,
      discount,
      damageReport,
      notes,
    } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'অবৈধ রেন্টাল আইডি প্রদান করা হয়েছে।',
      });
    }

    const rental = await Rental.findById(id);
    if (!rental) {
      return res.status(404).json({
        success: false,
        message: 'রেন্টাল চুক্তি পাওয়া যায়নি।',
      });
    }

    if (rental.status === 'completed' || rental.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'এই রেন্টাল চুক্তিটি ইতোমধ্যে সম্পন্ন অথবা বাতিল করা হয়েছে।',
      });
    }

    rental.actualReturnDate = actualReturnDate ? new Date(actualReturnDate) : new Date();
    rental.endMileage = endMileage ? Number(endMileage) : (rental.startMileage + 150);
    rental.endFuelLevel = endFuelLevel !== undefined ? Number(endFuelLevel) : 100;
    rental.additionalCharges = additionalCharges ? Number(additionalCharges) : 0;
    rental.discount = discount ? Number(discount) : 0;
    rental.finalAmount = rental.rentalAmount + rental.additionalCharges - rental.discount;
    if (damageReport) rental.damageReport = damageReport.trim();
    if (notes) rental.notes = notes.trim();
    rental.status = 'completed';

    await rental.save();

    // Release car back to available state and update odometer
    await Car.updateOne(
      { _id: rental.car },
      {
        status: 'available',
        currentMileage: rental.endMileage,
      }
    );

    const completedRental = await Rental.findById(rental._id)
      .populate('booking')
      .populate('customer')
      .populate('car')
      .populate('driver');

    return res.status(200).json({
      success: true,
      message: 'গাড়ি সপর্দ গ্রহণ এবং রেন্টাল সম্পন্ন করা হয়েছে।',
      data: { rental: completedRental },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllRentals,
  getRentalById,
  createRental,
  updateRentalStatus,
  returnRental,
};
