const mongoose = require('mongoose');
const Payment = require('../models/Payment');
const Booking = require('../models/Booking');
const Customer = require('../models/Customer');
const Rental = require('../models/Rental');
const { createNotification } = require('../utils/notification.util');

/**
 * Helper to generate unique payment ID (e.g. PAY-2026-0101)
 */
const generatePaymentId = async () => {
  const year = new Date().getFullYear();
  const count = await Payment.countDocuments();
  const sequence = String(count + 1).padStart(4, '0');
  const candidateId = `PAY-${year}-${sequence}`;

  const exists = await Payment.findOne({ paymentId: candidateId });
  if (exists) {
    const timestamp = Date.now().toString().slice(-4);
    return `PAY-${year}-${timestamp}`;
  }
  return candidateId;
};

/**
 * @desc    Create a new payment for a booking (Customer only)
 * @route   POST /api/payments
 * @access  Private (Customer)
 */
const createPayment = async (req, res, next) => {
  try {
    const customer = await Customer.findOne({ user: req.user._id });
    if (!customer) {
      return res.status(400).json({
        success: false,
        message: 'পেমেন্ট সম্পূর্ণ করতে কাস্টমার প্রোফাইল থাকা আবশ্যক।',
      });
    }

    const {
      bookingId,
      booking: bookingParam,
      rental: rentalParam,
      amount,
      paymentMethod,
      transactionId,
      notes,
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
        message: 'পেমেন্টের জন্য নির্ধারিত বুকিংটি পাওয়া যায়নি।',
      });
    }

    // Ownership check
    if (booking.customer.toString() !== customer._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'আপনার অন্য কোনো গ্রাহকের বুকিংয়ের জন্য পেমেন্ট করার অধিকার নেই।',
      });
    }

    // Validate paymentMethod enum
    const validMethods = ['bkash', 'nagad', 'cash'];
    if (!paymentMethod || !validMethods.includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        message: 'অবৈধ পেমেন্ট পদ্ধতি প্রদান করা হয়েছে। পেমেন্ট পদ্ধতি অবশ্যই bkash, nagad, অথবা cash হতে হবে।',
      });
    }

    // Validate amount
    const parsedAmount = Number(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'পেমেন্ট পরিমাণ অবশ্যই ০ এর চেয়ে বেশি হতে হবে।',
      });
    }

    // Duplicate check for existing paid payment for this booking
    const existingPaid = await Payment.findOne({
      booking: booking._id,
      status: 'paid',
    });
    if (existingPaid) {
      return res.status(400).json({
        success: false,
        message: 'এই বুকিংয়ের জন্য ইতোমধ্যে সফল পেমেন্ট সম্পন্ন করা হয়েছে।',
      });
    }

    const paymentId = await generatePaymentId();

    // Determine initial status: paid if transactionId or cash, else paid if passed or pending
    const initialStatus = (transactionId && transactionId.trim()) || paymentMethod === 'cash' ? 'paid' : 'pending';

    const payment = await Payment.create({
      paymentId,
      booking: booking._id,
      rental: rentalParam && mongoose.Types.ObjectId.isValid(rentalParam) ? rentalParam : null,
      customer: customer._id,
      amount: parsedAmount,
      paymentMethod,
      transactionId: transactionId ? transactionId.trim() : null,
      paymentDate: new Date(),
      status: initialStatus,
      notes: notes ? notes.trim() : null,
      confirmedAt: initialStatus === 'paid' ? new Date() : null,
    });

    const populatedPayment = await Payment.findById(payment._id)
      .populate('booking')
      .populate('customer')
      .populate('rental');

    // Auto notification to customer
    await createNotification({
      recipient: req.user._id,
      type: 'payment',
      title: 'পেমেন্ট জমা করা হয়েছে',
      message: `আপনার বুকিং ${booking.bookingId} এর পেমেন্ট (আইডি: ${paymentId}) জমা নেওয়া হয়েছে।`,
      relatedBooking: booking._id,
    });

    return res.status(201).json({
      success: true,
      message: 'পেমেন্ট সফলভাবে জমা করা হয়েছে।',
      data: { payment: populatedPayment },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all payments (Admin: all, Customer: own)
 * @route   GET /api/payments
 * @access  Private
 */
const getAllPayments = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const { status, search } = req.query;

    const query = {};

    if (status && ['pending', 'paid', 'failed', 'refunded', 'cancelled'].includes(status)) {
      query.status = status;
    }

    if (req.user.role === 'customer') {
      const customer = await Customer.findOne({ user: req.user._id });
      if (!customer) {
        return res.status(200).json({
          success: true,
          message: 'কোনো পেমেন্ট তথ্য পাওয়া যায়নি।',
          data: { payments: [], pagination: { page: 1, limit, total: 0, totalPages: 1 } },
        });
      }
      query.customer = customer._id;
    }

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [{ paymentId: searchRegex }, { transactionId: searchRegex }];
    }

    const total = await Payment.countDocuments(query);
    const totalPages = Math.ceil(total / limit) || 1;

    const payments = await Payment.find(query)
      .populate('booking')
      .populate('customer')
      .populate('rental')
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: 'পেমেন্টের তালিকা সফলভাবে পাওয়া গেছে।',
      data: {
        payments,
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
 * @desc    Get single payment by ID
 * @route   GET /api/payments/:id
 * @access  Private (Admin or Owner)
 */
const getPaymentById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'অবৈধ পেমেন্ট আইডি প্রদান করা হয়েছে।',
      });
    }

    const payment = await Payment.findById(id)
      .populate('booking')
      .populate({ path: 'customer', populate: { path: 'user' } })
      .populate('rental');

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'পেমেন্ট রেকর্ড পাওয়া যায়নি।',
      });
    }

    // Role-based authorization check
    if (req.user.role === 'customer') {
      const customer = await Customer.findOne({ user: req.user._id });
      if (!customer || payment.customer._id.toString() !== customer._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'আপনার এই পেমেন্ট তথ্য দেখার অনুমতি নেই।',
        });
      }
    }

    return res.status(200).json({
      success: true,
      message: 'পেমেন্ট বিবরণ সফলভাবে পাওয়া গেছে।',
      data: { payment },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update payment status (Admin only)
 * @route   PATCH /api/payments/:id/status
 * @access  Private (Admin)
 */
const updatePaymentStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'অবৈধ পেমেন্ট আইডি প্রদান করা হয়েছে।',
      });
    }

    const validStatuses = ['pending', 'paid', 'failed', 'refunded', 'cancelled'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'অবৈধ স্ট্যাটাস প্রদান করা হয়েছে।',
      });
    }

    const payment = await Payment.findById(id).populate({ path: 'customer', populate: { path: 'user' } });
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'পেমেন্ট রেকর্ড পাওয়া যায়নি।',
      });
    }

    payment.status = status;
    if (status === 'paid') {
      payment.confirmedAt = new Date();
    }

    await payment.save();

    const updatedPayment = await Payment.findById(payment._id)
      .populate('booking')
      .populate('customer')
      .populate('rental');

    if (payment.customer && payment.customer.user) {
      await createNotification({
        recipient: payment.customer.user._id || payment.customer.user,
        type: 'payment',
        title: 'পেমেন্ট স্ট্যাটাস আপডেট',
        message: `আপনার পেমেন্ট (${payment.paymentId}) এর স্ট্যাটাস পরিবর্তন হয়ে '${status}' হয়েছে।`,
        relatedBooking: payment.booking,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'পেমেন্ট স্ট্যাটাস সফলভাবে আপডেট করা হয়েছে।',
      data: { payment: updatedPayment },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Refund a payment (Admin only)
 * @route   POST /api/payments/:id/refund
 * @access  Private (Admin)
 */
const refundPayment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { refundReason, reason } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'অবৈধ পেমেন্ট আইডি প্রদান করা হয়েছে।',
      });
    }

    const payment = await Payment.findById(id).populate({ path: 'customer', populate: { path: 'user' } });
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'পেমেন্ট রেকর্ড পাওয়া যায়নি।',
      });
    }

    if (payment.status !== 'paid') {
      return res.status(400).json({
        success: false,
        message: 'কেবলমাত্র পরিশোধিত (paid) পেমেন্টই রিফান্ড করা সম্ভব।',
      });
    }

    payment.status = 'refunded';
    payment.refundedAt = new Date();
    payment.refundReason = (refundReason || reason || 'অ্যাডমিন কর্তৃক রিফান্ড করা হয়েছে।').trim();

    await payment.save();

    const refundedPayment = await Payment.findById(payment._id)
      .populate('booking')
      .populate('customer')
      .populate('rental');

    if (payment.customer && payment.customer.user) {
      await createNotification({
        recipient: payment.customer.user._id || payment.customer.user,
        type: 'payment',
        title: 'পেমেন্ট রিফান্ড',
        message: `আপনার পেমেন্ট (${payment.paymentId}) এর ৳${payment.amount} সফলভাবে রিফান্ড করা হয়েছে।`,
        relatedBooking: payment.booking,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'পেমেন্ট সফলভাবে রিফান্ড করা হয়েছে।',
      data: { payment: refundedPayment },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Cancel payment (Admin or Owner)
 * @route   PATCH /api/payments/:id/cancel
 * @access  Private
 */
const cancelPayment = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'অবৈধ পেমেন্ট আইডি প্রদান করা হয়েছে।',
      });
    }

    const payment = await Payment.findById(id);
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'পেমেন্ট রেকর্ড পাওয়া যায়নি।',
      });
    }

    if (req.user.role === 'customer') {
      const customer = await Customer.findOne({ user: req.user._id });
      if (!customer || payment.customer.toString() !== customer._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'আপনার এই পেমেন্টটি বাতিল করার অধিকার নেই।',
        });
      }
    }

    if (['paid', 'refunded', 'cancelled'].includes(payment.status)) {
      return res.status(400).json({
        success: false,
        message: 'বর্তমান অবস্থায় এই পেমেন্টটি বাতিল করা সম্ভব নয়।',
      });
    }

    payment.status = 'cancelled';
    await payment.save();

    const updatedPayment = await Payment.findById(payment._id)
      .populate('booking')
      .populate('customer')
      .populate('rental');

    return res.status(200).json({
      success: true,
      message: 'পেমেন্ট সফলভাবে বাতিল করা হয়েছে।',
      data: { payment: updatedPayment },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createPayment,
  getAllPayments,
  getPaymentById,
  updatePaymentStatus,
  refundPayment,
  cancelPayment,
};
