const mongoose = require('mongoose');
const Review = require('../models/Review');
const Booking = require('../models/Booking');
const Customer = require('../models/Customer');

/**
 * @desc    Create a new review for a completed booking (Customer only)
 * @route   POST /api/reviews
 * @access  Private (Customer)
 */
const createReview = async (req, res, next) => {
  try {
    const customer = await Customer.findOne({ user: req.user._id });
    if (!customer) {
      return res.status(400).json({
        success: false,
        message: 'রিভিউ প্রদান করতে কাস্টমার প্রোফাইল থাকা আবশ্যক।',
      });
    }

    const {
      bookingId,
      booking: bookingParam,
      rating,
      comment,
      car: carParam,
      driver: driverParam,
    } = req.body;

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
        message: 'রিভিউর জন্য নির্ধারিত বুকিংটি পাওয়া যায়নি।',
      });
    }

    // Ownership check
    if (booking.customer.toString() !== customer._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'আপনার অন্য কোনো গ্রাহকের বুকিংয়ের জন্য রিভিউ দেওয়ার অধিকার নেই।',
      });
    }

    // Prefer completed booking only
    if (booking.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'কেবলমাত্র সম্পন্ন (completed) বুকিংয়ের জন্যই রিভিউ প্রদান করা সম্ভব।',
      });
    }

    // Prevent multiple reviews for same booking
    const existingReview = await Review.findOne({ booking: booking._id });
    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'এই বুকিংয়ের জন্য ইতোমধ্যে রিভিউ প্রদান করা হয়েছে।',
      });
    }

    // Validate rating 1-5
    const parsedRating = Number(rating);
    if (isNaN(parsedRating) || parsedRating < 1 || parsedRating > 5) {
      return res.status(400).json({
        success: false,
        message: 'রেটিং অবশ্যই ১ থেকে ৫ এর মধ্যে হতে হবে।',
      });
    }

    const carId = carParam || booking.car || null;
    const driverId = driverParam || booking.driver || null;

    if (!carId && !driverId) {
      return res.status(400).json({
        success: false,
        message: 'রিভিউর জন্য গাড়ি অথবা ড্রাইভার নির্দেশ করা আবশ্যক।',
      });
    }

    const review = await Review.create({
      customer: customer._id,
      car: carId,
      driver: driverId,
      booking: booking._id,
      rating: parsedRating,
      comment: comment ? comment.trim() : null,
      status: 'published',
    });

    const populatedReview = await Review.findById(review._id)
      .populate('customer')
      .populate('car')
      .populate('driver')
      .populate('booking');

    return res.status(201).json({
      success: true,
      message: 'আপনার রিভিউ সফলভাবে জমা দেওয়া হয়েছে।',
      data: { review: populatedReview },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all reviews (Public for published; Admin for all)
 * @route   GET /api/reviews
 * @access  Public / Private
 */
const getAllReviews = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const { status, car, driver } = req.query;

    const query = {};

    // Only Admin can see hidden reviews or filter by status
    if (req.user && req.user.role === 'admin') {
      if (status && ['published', 'hidden'].includes(status)) {
        query.status = status;
      }
    } else {
      query.status = 'published';
    }

    if (car && mongoose.Types.ObjectId.isValid(car)) {
      query.car = car;
    }

    if (driver && mongoose.Types.ObjectId.isValid(driver)) {
      query.driver = driver;
    }

    const total = await Review.countDocuments(query);
    const totalPages = Math.ceil(total / limit) || 1;

    const reviews = await Review.find(query)
      .populate('customer')
      .populate('car')
      .populate('driver')
      .populate('booking')
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: 'রিভিউর তালিকা সফলভাবে পাওয়া গেছে।',
      data: {
        reviews,
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
 * @desc    Get single review by ID
 * @route   GET /api/reviews/:id
 * @access  Public / Private
 */
const getReviewById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'অবৈধ রিভিউ আইডি প্রদান করা হয়েছে।',
      });
    }

    const review = await Review.findById(id)
      .populate({ path: 'customer', populate: { path: 'user' } })
      .populate('car')
      .populate('driver')
      .populate('booking');

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'রিভিউ পাওয়া যায়নি।',
      });
    }

    if (review.status === 'hidden') {
      if (!req.user) {
        return res.status(403).json({
          success: false,
          message: 'এই রিভিউটি দেখতে অথেন্টিকেশন আবশ্যক।',
        });
      }

      if (req.user.role !== 'admin') {
        const customer = await Customer.findOne({ user: req.user._id });
        if (!customer || review.customer._id.toString() !== customer._id.toString()) {
          return res.status(403).json({
            success: false,
            message: 'আপনার এই রিভিউটি দেখার অনুমতি নেই।',
          });
        }
      }
    }

    return res.status(200).json({
      success: true,
      message: 'রিভিউ বিবরণ সফলভাবে পাওয়া গেছে।',
      data: { review },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update review (Owner or Admin)
 * @route   PUT /api/reviews/:id
 * @access  Private
 */
const updateReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'অবৈধ রিভিউ আইডি প্রদান করা হয়েছে।',
      });
    }

    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'রিভিউ পাওয়া যায়নি।',
      });
    }

    // Ownership or Admin check
    if (req.user.role !== 'admin') {
      const customer = await Customer.findOne({ user: req.user._id });
      if (!customer || review.customer.toString() !== customer._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'আপনার এই রিভিউ সম্পাদনা করার অধিকার নেই।',
        });
      }
    }

    if (rating !== undefined) {
      const parsedRating = Number(rating);
      if (isNaN(parsedRating) || parsedRating < 1 || parsedRating > 5) {
        return res.status(400).json({
          success: false,
          message: 'রেটিং অবশ্যই ১ থেকে ৫ এর মধ্যে হতে হবে।',
        });
      }
      review.rating = parsedRating;
    }

    if (comment !== undefined) {
      review.comment = comment ? comment.trim() : null;
    }

    await review.save();

    const updatedReview = await Review.findById(review._id)
      .populate('customer')
      .populate('car')
      .populate('driver')
      .populate('booking');

    return res.status(200).json({
      success: true,
      message: 'রিভিউ সফলভাবে আপডেট করা হয়েছে।',
      data: { review: updatedReview },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update review status (Admin only)
 * @route   PATCH /api/reviews/:id/status
 * @access  Private (Admin)
 */
const updateReviewStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'অবৈধ রিভিউ আইডি প্রদান করা হয়েছে।',
      });
    }

    const validStatuses = ['published', 'hidden'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'অবৈধ স্ট্যাটাস প্রদান করা হয়েছে। স্ট্যাটাস অবশ্যই published অথবা hidden হতে হবে।',
      });
    }

    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'রিভিউ পাওয়া যায়নি।',
      });
    }

    review.status = status;
    await review.save();

    const updatedReview = await Review.findById(review._id)
      .populate('customer')
      .populate('car')
      .populate('driver')
      .populate('booking');

    return res.status(200).json({
      success: true,
      message: 'রিভিউ স্ট্যাটাস সফলভাবে পরিবর্তন করা হয়েছে।',
      data: { review: updatedReview },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete review (Owner or Admin)
 * @route   DELETE /api/reviews/:id
 * @access  Private
 */
const deleteReview = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'অবৈধ রিভিউ আইডি প্রদান করা হয়েছে।',
      });
    }

    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'রিভিউ পাওয়া যায়নি।',
      });
    }

    // Ownership or Admin check
    if (req.user.role !== 'admin') {
      const customer = await Customer.findOne({ user: req.user._id });
      if (!customer || review.customer.toString() !== customer._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'আপনার এই রিভিউটি মুছে ফেলার অধিকার নেই।',
        });
      }
    }

    await Review.deleteOne({ _id: id });

    return res.status(200).json({
      success: true,
      message: 'রিভিউ সফলভাবে মুছে ফেলা হয়েছে।',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createReview,
  getAllReviews,
  getReviewById,
  updateReview,
  updateReviewStatus,
  deleteReview,
};
