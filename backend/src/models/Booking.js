const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema(
  {
    address: { type: String, trim: true },
    city: { type: String, trim: true },
    district: { type: String, trim: true },
    coordinates: {
      lat: { type: Number, default: null },
      lng: { type: Number, default: null },
    },
  },
  { _id: false }
);

const bookingSchema = new mongoose.Schema(
  {
    bookingId: {
      type: String,
      required: [true, 'Booking ID is required'],
      unique: true,
      trim: true,
    },

    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: [true, 'Customer reference is required'],
    },

    car: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Car',
      required: [true, 'Car reference is required'],
    },

    // Optional — driver may be assigned after initial booking
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Driver',
      default: null,
    },

    pickupLocation: {
      type: locationSchema,
      required: [true, 'Pickup location is required'],
    },

    dropoffLocation: {
      type: locationSchema,
      required: [true, 'Dropoff location is required'],
    },

    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },

    endDate: {
      type: Date,
      required: [true, 'End date is required'],
      validate: {
        validator: function (value) {
          // endDate must not be earlier than startDate
          return value >= this.startDate;
        },
        message: 'End date must be on or after start date',
      },
    },

    rentalDays: {
      type: Number,
      required: [true, 'Rental days is required'],
      min: [1, 'Rental days must be at least 1'],
    },

    dailyRate: {
      type: Number,
      required: [true, 'Daily rate is required'],
      min: [1, 'Daily rate must be a positive number'],
    },

    totalAmount: {
      type: Number,
      required: [true, 'Total amount is required'],
      min: [1, 'Total amount must be a positive number'],
    },

    driverRequired: {
      type: Boolean,
      default: true,
    },

    specialRequest: {
      type: String,
      trim: true,
      default: null,
    },

    status: {
      type: String,
      enum: {
        values: ['pending', 'confirmed', 'rejected', 'cancelled', 'completed'],
        message:
          'Status must be pending, confirmed, rejected, cancelled, or completed',
      },
      default: 'pending',
    },

    cancellationReason: {
      type: String,
      trim: true,
      default: null,
    },

    confirmedAt: {
      type: Date,
      default: null,
    },

    cancelledAt: {
      type: Date,
      default: null,
    },

    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Booking', bookingSchema);
