const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Customer = require('../models/Customer');
const Car = require('../models/Car');
const Driver = require('../models/Driver');
const Rental = require('../models/Rental');
const Notification = require('../models/Notification');
const User = require('../models/User');

/**
 * Helper to send notification to all Admins
 */
const notifyAdminsAboutTrip = async ({ title, message, bookingId }) => {
  try {
    const admins = await User.find({ role: 'admin' });
    for (const admin of admins) {
      await Notification.create({
        recipient: admin._id,
        type: 'booking',
        title,
        message,
        relatedBooking: bookingId || null,
      });
    }
  } catch (err) {
    console.error('Error sending admin trip notification:', err);
  }
};

/**
 * Helper to generate unique booking ID (e.g. BK-2026-0101)
 */
const generateBookingId = async () => {
  const year = new Date().getFullYear();
  const count = await Booking.countDocuments();
  const sequence = String(count + 1).padStart(4, '0');
  const candidateId = `BK-${year}-${sequence}`;

  const exists = await Booking.findOne({ bookingId: candidateId });
  if (exists) {
    const timestamp = Date.now().toString().slice(-4);
    return `BK-${year}-${timestamp}`;
  }
  return candidateId;
};

/**
 * @desc    Create a new booking (Customer only)
 * @route   POST /api/bookings
 * @access  Private (Customer)
 */
const createBooking = async (req, res, next) => {
  try {
    const customer = await Customer.findOne({ user: req.user._id });
    if (!customer) {
      return res.status(400).json({
        success: false,
        message: 'বুকিং সম্পন্ন করতে কাস্টমার প্রোফাইল থাকা আবশ্যক।',
      });
    }

    const {
      carId,
      car: carParam,
      pickupLocation,
      dropoffLocation,
      startDate,
      endDate,
      driverRequired,
      specialRequest,
    } = req.body;

    const targetCarId = carId || carParam;
    if (!targetCarId || !mongoose.Types.ObjectId.isValid(targetCarId)) {
      return res.status(400).json({
        success: false,
        message: 'সঠিক গাড়ি আইডি প্রদান করুন।',
      });
    }

    const car = await Car.findById(targetCarId);
    if (!car) {
      return res.status(404).json({
        success: false,
        message: 'বুকিংয়ের জন্য নির্বাচিত গাড়িটি পাওয়া যায়নি।',
      });
    }

    if (!pickupLocation || !dropoffLocation || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'পিকআপ, ড্রপঅফ লোকেশন এবং ভ্রমণের তারিখসমূহ প্রদান করা আবশ্যক।',
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) {
      return res.status(400).json({
        success: false,
        message: 'সমাপ্তির তারিখ অবশ্যই শুরুর তারিখের পর বা সমান হতে হবে।',
      });
    }

    // Rental duration in days (minimum 1)
    const diffTime = Math.abs(end - start);
    const rentalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
    const dailyRate = car.dailyRentalPrice || 3500;
    const totalAmount = rentalDays * dailyRate;

    // Availability check for overlapping active bookings/rentals for this car
    const overlappingBooking = await Booking.findOne({
      car: car._id,
      status: { $in: ['pending', 'confirmed'] },
      startDate: { $lte: end },
      endDate: { $gte: start },
    });

    if (overlappingBooking) {
      return res.status(400).json({
        success: false,
        message: 'নির্ধারিত সময়সীমার জন্য গাড়িটি ইতোমধ্যে বুকিং করা রয়েছে। অনুগ্রহ করে অন্য তারিখ নির্বাচন করুন।',
      });
    }

    const bookingId = await generateBookingId();

    const booking = await Booking.create({
      bookingId,
      customer: customer._id,
      car: car._id,
      driver: null,
      pickupLocation,
      dropoffLocation,
      startDate: start,
      endDate: end,
      rentalDays,
      dailyRate,
      totalAmount,
      driverRequired: driverRequired !== false,
      specialRequest: specialRequest ? specialRequest.trim() : null,
      status: 'pending',
    });

    const populatedBooking = await Booking.findById(booking._id)
      .populate('customer')
      .populate('car');

    const pickupText = pickupLocation.address || pickupLocation.city || 'নট স্পেসিফাইড';
    const dropoffText = dropoffLocation.address || dropoffLocation.city || 'নট স্পেসিফাইড';

    // Notify Admins
    await notifyAdminsAboutTrip({
      title: `🚗 নতুন রাইড বুকিং তৈরি (${bookingId})`,
      message: `কাস্টমার "${customer.fullName}" গাড়ি "${car.name}" বুক করেছেন। যাত্রাপথ: "${pickupText}" ➔ "${dropoffText}"।`,
      bookingId: booking._id,
    });

    return res.status(201).json({
      success: true,
      message: 'বুকিং অনুরোধ সফলভাবে জমা দেওয়া হয়েছে।',
      data: { booking: populatedBooking },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get bookings (Admin: all, Customer: own, Driver: assigned)
 * @route   GET /api/bookings
 * @access  Private
 */
const getAllBookings = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const { status, search } = req.query;

    const query = {};

    if (status && ['pending', 'confirmed', 'rejected', 'cancelled', 'completed'].includes(status)) {
      query.status = status;
    }

    if (req.user.role === 'customer') {
      const customer = await Customer.findOne({ user: req.user._id });
      if (!customer) {
        return res.status(200).json({
          success: true,
          message: 'কোনো বুকিং পাওয়া যায়নি।',
          data: { bookings: [], pagination: { page: 1, limit, total: 0, totalPages: 1 } },
        });
      }
      query.customer = customer._id;
    } else if (req.user.role === 'driver') {
      const driver = await Driver.findOne({ user: req.user._id });
      if (!driver) {
        return res.status(200).json({
          success: true,
          message: 'কোনো বুকিং পাওয়া যায়নি।',
          data: { bookings: [], pagination: { page: 1, limit, total: 0, totalPages: 1 } },
        });
      }
      query.driver = driver._id;
    }

    if (search && search.trim()) {
      query.bookingId = new RegExp(search.trim(), 'i');
    }

    const total = await Booking.countDocuments(query);
    const totalPages = Math.ceil(total / limit) || 1;

    const bookings = await Booking.find(query)
      .populate('customer')
      .populate('car')
      .populate('driver')
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: 'বুকিংয়ের তালিকা সফলভাবে পাওয়া গেছে।',
      data: {
        bookings,
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
 * @desc    Get single booking details by ID
 * @route   GET /api/bookings/:id
 * @access  Private
 */
const getBookingById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'অবৈধ বুকিং আইডি প্রদান করা হয়েছে।',
      });
    }

    const booking = await Booking.findById(id)
      .populate({ path: 'customer', populate: { path: 'user' } })
      .populate('car')
      .populate({ path: 'driver', populate: { path: 'user' } });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'বুকিং পাওয়া যায়নি।',
      });
    }

    // Role-based authorization check
    if (req.user.role === 'customer') {
      const customer = await Customer.findOne({ user: req.user._id });
      if (!customer || booking.customer._id.toString() !== customer._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'আপনার এই বুকিং বিবরণ দেখার অনুমতি নেই।',
        });
      }
    } else if (req.user.role === 'driver') {
      const driver = await Driver.findOne({ user: req.user._id });
      if (!driver || !booking.driver || booking.driver._id.toString() !== driver._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'আপনার এই বুকিং বিবরণ দেখার অনুমতি নেই।',
        });
      }
    }

    return res.status(200).json({
      success: true,
      message: 'বুকিং বিবরণ সফলভাবে পাওয়া গেছে।',
      data: { booking },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update booking status (Admin only)
 * @route   PATCH /api/bookings/:id/status
 * @access  Private (Admin)
 */
const updateBookingStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, cancellationReason } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'অবৈধ বুকিং আইডি প্রদান করা হয়েছে।',
      });
    }

    const validStatuses = ['pending', 'confirmed', 'rejected', 'cancelled', 'completed'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'অবৈধ স্ট্যাটাস প্রদান করা হয়েছে।',
      });
    }

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'বুকিং পাওয়া যায়নি।',
      });
    }

    booking.status = status;

    if (status === 'confirmed') {
      booking.confirmedAt = new Date();
    } else if (status === 'cancelled' || status === 'rejected') {
      booking.cancelledAt = new Date();
      if (cancellationReason) booking.cancellationReason = cancellationReason;
    } else if (status === 'completed') {
      booking.completedAt = new Date();
    }

    await booking.save();

    const updatedBooking = await Booking.findById(booking._id)
      .populate('customer')
      .populate('car')
      .populate('driver');

    const pText = updatedBooking.pickupLocation?.address || updatedBooking.pickupLocation?.city || 'পিকআপ স্থান';
    const dText = updatedBooking.dropoffLocation?.address || updatedBooking.dropoffLocation?.city || 'ড্রপঅফ স্থান';
    const drvName = updatedBooking.driver ? updatedBooking.driver.fullName : 'এসাইনকৃত ড্রাইভার';

    if (status === 'confirmed' || status === 'completed' || status === 'cancelled') {
      let statusTitle = `🚕 রাইড স্ট্যাটাস আপডেট (${updatedBooking.bookingId})`;
      let statusMsg = `রাইড স্ট্যাটাস পরিবর্তন করা হয়েছে: ${status}। যাত্রাপথ: "${pText}" ➔ "${dText}"। (ড্রাইভার: ${drvName})`;

      if (status === 'confirmed') {
        statusTitle = `🚕 রাইড শুরু হয়েছে! (${updatedBooking.bookingId})`;
        statusMsg = `ড্রাইভার "${drvName}" পিকআপ স্থান "${pText}" থেকে ড্রপঅফ স্থান "${dText}" এর উদ্দেশ্যে রওনা হয়েছেন।`;
      } else if (status === 'completed') {
        statusTitle = `🏁 রাইড গন্তব্যে সম্পন্ন! (${updatedBooking.bookingId})`;
        statusMsg = `ড্রাইভার "${drvName}" সফলভাবে ড্রপঅফ স্থান "${dText}" এ পৌঁছে রাইড সম্পন্ন করেছেন।`;
      }

      await notifyAdminsAboutTrip({
        title: statusTitle,
        message: statusMsg,
        bookingId: updatedBooking._id,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'বুকিং স্ট্যাটাস সফলভাবে পরিবর্তন করা হয়েছে।',
      data: { booking: updatedBooking },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Assign a driver to a booking (Admin only)
 * @route   PATCH /api/bookings/:id/assign-driver
 * @access  Private (Admin)
 */
const assignDriver = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { driverId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'অবৈধ বুকিং আইডি প্রদান করা হয়েছে।',
      });
    }

    if (!driverId || !mongoose.Types.ObjectId.isValid(driverId)) {
      return res.status(400).json({
        success: false,
        message: 'সঠিক ড্রাইভার আইডি প্রদান করুন।',
      });
    }

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'বুকিং পাওয়া যায়নি।',
      });
    }

    const driver = await Driver.findById(driverId);
    if (!driver) {
      return res.status(404).json({
        success: false,
        message: 'মনোনীত ড্রাইভার পাওয়া যায়নি।',
      });
    }

    if (driver.status === 'inactive' || driver.status === 'suspended') {
      return res.status(400).json({
        success: false,
        message: 'নিষ্ক্রিয় বা স্থগিত ড্রাইভারকে বুকিং প্রদান করা সম্ভব নয়।',
      });
    }

    booking.driver = driver._id;
    await booking.save();

    const updatedBooking = await Booking.findById(booking._id)
      .populate('customer')
      .populate('car')
      .populate('driver');

    const pickupText = updatedBooking.pickupLocation?.address || updatedBooking.pickupLocation?.city || 'পিকআপ স্থান';
    const dropoffText = updatedBooking.dropoffLocation?.address || updatedBooking.dropoffLocation?.city || 'ড্রপঅফ স্থান';

    // Notify Admin about Driver Assignment & Trip Route
    await notifyAdminsAboutTrip({
      title: `👨‍✈️ ড্রাইভার অ্যাসাইন ও রাইড রুট অ্যালার্ট (${updatedBooking.bookingId})`,
      message: `ড্রাইভার "${driver.fullName}" (${driver.phone}) কে রাইড ${updatedBooking.bookingId}-এ নিয়োগ দেওয়া হয়েছে। যাত্রাপথ: "${pickupText}" ➔ "${dropoffText}"।`,
      bookingId: updatedBooking._id,
    });

    return res.status(200).json({
      success: true,
      message: 'ড্রাইভার সফলভাবে নিয়োগ দেওয়া হয়েছে।',
      data: { booking: updatedBooking },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Cancel booking (Customer for own booking, or Admin)
 * @route   PATCH /api/bookings/:id/cancel
 * @access  Private (Customer / Admin)
 */
const cancelBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { cancellationReason } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'অবৈধ বুকিং আইডি প্রদান করা হয়েছে।',
      });
    }

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'বুকিং পাওয়া যায়নি।',
      });
    }

    // Ownership check for customer
    if (req.user.role === 'customer') {
      const customer = await Customer.findOne({ user: req.user._id });
      if (!customer || booking.customer.toString() !== customer._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'আপনার এই বুকিংটি বাতিল করার অধিকার নেই।',
        });
      }
    }

    if (['completed', 'cancelled', 'rejected'].includes(booking.status)) {
      return res.status(400).json({
        success: false,
        message: 'বর্তমান অবস্থায় এই বুকিংটি আর বাতিল করা সম্ভব নয়।',
      });
    }

    booking.status = 'cancelled';
    booking.cancelledAt = new Date();
    booking.cancellationReason = cancellationReason ? cancellationReason.trim() : 'গ্রাহকের অনুরোধে বাতিল করা হয়েছে।';

    await booking.save();

    const updatedBooking = await Booking.findById(booking._id)
      .populate('customer')
      .populate('car')
      .populate('driver');

    return res.status(200).json({
      success: true,
      message: 'বুকিংটি সফলভাবে বাতিল করা হয়েছে।',
      data: { booking: updatedBooking },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBooking,
  getAllBookings,
  getBookingById,
  updateBookingStatus,
  assignDriver,
  cancelBooking,
};
