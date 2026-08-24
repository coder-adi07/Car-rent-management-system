const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: [true, 'Customer reference is required'],
    },

    car: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Car',
      default: null,
    },

    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Driver',
      default: null,
    },

    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: [true, 'Booking reference is required'],
    },

    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating must be at most 5'],
    },

    comment: {
      type: String,
      trim: true,
      default: null,
    },

    status: {
      type: String,
      enum: {
        values: ['published', 'hidden'],
        message: 'Status must be published or hidden',
      },
      default: 'published',
    },
  },
  {
    timestamps: true,
  }
);

// Validate that at least one of car or driver is provided
reviewSchema.pre('validate', function (next) {
  if (!this.car && !this.driver) {
    this.invalidate(
      'car',
      'At least one of car or driver must be provided'
    );
  }
  next();
});

module.exports = mongoose.model('Review', reviewSchema);
