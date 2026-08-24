const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    paymentId: {
      type: String,
      required: [true, 'Payment ID is required'],
      unique: true,
      trim: true,
    },

    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: [true, 'Booking reference is required'],
    },

    // Optional — rental may not yet exist at time of payment capture
    rental: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Rental',
      default: null,
    },

    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: [true, 'Customer reference is required'],
    },

    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0.01, 'Amount must be greater than 0'],
    },

    paymentMethod: {
      type: String,
      required: [true, 'Payment method is required'],
      enum: {
        values: ['bkash', 'nagad', 'cash'],
        message: 'Payment method must be bkash, nagad, or cash',
      },
    },

    // Reference number from bKash/Nagad, or receipt number for cash
    transactionId: {
      type: String,
      trim: true,
      default: null,
    },

    paymentDate: {
      type: Date,
      default: Date.now,
    },

    status: {
      type: String,
      enum: {
        values: ['pending', 'paid', 'failed', 'refunded', 'cancelled'],
        message:
          'Status must be pending, paid, failed, refunded, or cancelled',
      },
      default: 'pending',
    },

    notes: {
      type: String,
      trim: true,
      default: null,
    },

    confirmedAt: {
      type: Date,
      default: null,
    },

    refundedAt: {
      type: Date,
      default: null,
    },

    refundReason: {
      type: String,
      trim: true,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Payment', paymentSchema);
