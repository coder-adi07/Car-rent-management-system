const Notification = require('../models/Notification');

/**
 * Safely create a notification for a user without breaking main process on error
 * @param {Object} params
 * @param {String|ObjectId} params.recipient - User ID of the recipient
 * @param {String} params.type - 'booking', 'payment', 'rental', 'maintenance', 'review', 'system'
 * @param {String} params.title - Notification title
 * @param {String} params.message - Notification message
 * @param {String|ObjectId} [params.relatedBooking] - Optional Booking ID
 * @param {String|ObjectId} [params.relatedRental] - Optional Rental ID
 */
const createNotification = async ({
  recipient,
  type,
  title,
  message,
  relatedBooking = null,
  relatedRental = null,
}) => {
  try {
    if (!recipient || !type || !title || !message) {
      return null;
    }

    const notification = await Notification.create({
      recipient,
      type,
      title: title.trim(),
      message: message.trim(),
      relatedBooking: relatedBooking || null,
      relatedRental: relatedRental || null,
      isRead: false,
    });

    return notification;
  } catch (error) {
    console.error('Failed to create notification safely:', error.message);
    return null;
  }
};

module.exports = {
  createNotification,
};
