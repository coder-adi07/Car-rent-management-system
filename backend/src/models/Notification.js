const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Recipient is required'],
    },

    type: {
      type: String,
      required: [true, 'Notification type is required'],
      enum: {
        values: ['booking', 'payment', 'rental', 'maintenance', 'review', 'system'],
        message:
          'Type must be booking, payment, rental, maintenance, review, or system',
      },
    },

    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },

    message: {
      type: String,
      required: [true, 'Message is required'],
      trim: true,
    },

    relatedBooking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      default: null,
    },

    relatedRental: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Rental',
      default: null,
    },

    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Notification', notificationSchema);
