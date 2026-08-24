const mongoose = require('mongoose');

const rentalSchema = new mongoose.Schema(
  {
    rentalId: {
      type: String,
      required: [true, 'Rental ID is required'],
      unique: true,
      trim: true,
    },

    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: [true, 'Booking reference is required'],
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

    // Optional — self-drive rentals may have no driver
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Driver',
      default: null,
    },

    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },

    expectedReturnDate: {
      type: Date,
      required: [true, 'Expected return date is required'],
    },

    // Set when the car is actually returned
    actualReturnDate: {
      type: Date,
      default: null,
    },

    startMileage: {
      type: Number,
      min: [0, 'Start mileage cannot be negative'],
      default: 0,
    },

    // Set after car return
    endMileage: {
      type: Number,
      min: [0, 'End mileage cannot be negative'],
      default: null,
    },

    // Fuel level as percentage (0–100)
    startFuelLevel: {
      type: Number,
      min: [0, 'Start fuel level cannot be less than 0'],
      max: [100, 'Start fuel level cannot exceed 100'],
      default: null,
    },

    // Fuel level as percentage (0–100), set on return
    endFuelLevel: {
      type: Number,
      min: [0, 'End fuel level cannot be less than 0'],
      max: [100, 'End fuel level cannot exceed 100'],
      default: null,
    },

    rentalAmount: {
      type: Number,
      required: [true, 'Rental amount is required'],
      min: [0, 'Rental amount cannot be negative'],
    },

    // Extra charges (damage, fuel top-up, late return, etc.)
    additionalCharges: {
      type: Number,
      min: [0, 'Additional charges cannot be negative'],
      default: 0,
    },

    // Discount applied
    discount: {
      type: Number,
      min: [0, 'Discount cannot be negative'],
      default: 0,
    },

    // Calculated by service: rentalAmount + additionalCharges - discount
    finalAmount: {
      type: Number,
      required: [true, 'Final amount is required'],
      min: [0, 'Final amount cannot be negative'],
    },

    status: {
      type: String,
      enum: {
        values: ['scheduled', 'active', 'completed', 'overdue', 'cancelled'],
        message:
          'Status must be scheduled, active, completed, overdue, or cancelled',
      },
      default: 'scheduled',
    },

    // Free-text damage description, set on return inspection
    damageReport: {
      type: String,
      trim: true,
      default: null,
    },

    notes: {
      type: String,
      trim: true,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Rental', rentalSchema);
