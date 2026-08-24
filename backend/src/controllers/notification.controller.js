const mongoose = require('mongoose');
const Notification = require('../models/Notification');

/**
 * @desc    Get user's own notifications
 * @route   GET /api/notifications
 * @access  Private (Authenticated User)
 */
const getMyNotifications = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const { type, isRead } = req.query;

    const query = { recipient: req.user._id };

    const validTypes = ['booking', 'payment', 'rental', 'maintenance', 'review', 'system'];
    if (type && validTypes.includes(type)) {
      query.type = type;
    }

    if (isRead !== undefined) {
      query.isRead = isRead === 'true' || isRead === true;
    }

    const total = await Notification.countDocuments(query);
    const totalPages = Math.ceil(total / limit) || 1;

    const notifications = await Notification.find(query)
      .populate('relatedBooking')
      .populate('relatedRental')
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: 'নোটিফিকেশনের তালিকা সফলভাবে পাওয়া গেছে।',
      data: {
        notifications,
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
 * @desc    Get single notification details by ID
 * @route   GET /api/notifications/:id
 * @access  Private (Owner only)
 */
const getNotificationById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'অবৈধ নোটিফিকেশন আইডি প্রদান করা হয়েছে।',
      });
    }

    const notification = await Notification.findById(id)
      .populate('relatedBooking')
      .populate('relatedRental');

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'নোটিফিকেশন পাওয়া যায়নি।',
      });
    }

    // Ownership check
    if (notification.recipient.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'আপনার এই নোটিফিকেশনটি দেখার অনুমতি নেই।',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'নোটিফিকেশন বিবরণ সফলভাবে পাওয়া গেছে।',
      data: { notification },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Mark a single notification as read
 * @route   PATCH /api/notifications/:id/read
 * @access  Private (Owner only)
 */
const markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'অবৈধ নোটিফিকেশন আইডি প্রদান করা হয়েছে।',
      });
    }

    const notification = await Notification.findById(id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'নোটিফিকেশন পাওয়া যায়নি।',
      });
    }

    if (notification.recipient.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'আপনার এই নোটিফিকেশন পরিবর্তনের অনুমতি নেই।',
      });
    }

    notification.isRead = true;
    await notification.save();

    return res.status(200).json({
      success: true,
      message: 'নোটিফিকেশন পঠিত হিসেবে চিহ্নিত করা হয়েছে।',
      data: { notification },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Mark all user's notifications as read
 * @route   PATCH /api/notifications/read-all
 * @access  Private (Owner only)
 */
const markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, isRead: false },
      { $set: { isRead: true } }
    );

    return res.status(200).json({
      success: true,
      message: 'সমস্ত নোটিফিকেশন পঠিত হিসেবে চিহ্নিত করা হয়েছে।',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete own notification
 * @route   DELETE /api/notifications/:id
 * @access  Private (Owner only)
 */
const deleteNotification = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'অবৈধ নোটিফিকেশন আইডি প্রদান করা হয়েছে।',
      });
    }

    const notification = await Notification.findById(id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'নোটিফিকেশন পাওয়া যায়নি।',
      });
    }

    if (notification.recipient.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'আপনার এই নোটিফিকেশন মুছে ফেলার অনুমতি নেই।',
      });
    }

    await Notification.deleteOne({ _id: id });

    return res.status(200).json({
      success: true,
      message: 'নোটিফিকেশন সফলভাবে মুছে ফেলা হয়েছে।',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyNotifications,
  getNotificationById,
  markAsRead,
  markAllAsRead,
  deleteNotification,
};
