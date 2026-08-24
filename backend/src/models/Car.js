const mongoose = require('mongoose');

const carSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Car name is required'],
      trim: true,
    },

    brand: {
      type: String,
      required: [true, 'Brand is required'],
      trim: true,
    },

    model: {
      type: String,
      required: [true, 'Model is required'],
      trim: true,
    },

    registrationNumber: {
      type: String,
      required: [true, 'Registration number is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },

    carType: {
      type: String,
      required: [true, 'Car type is required'],
      enum: {
        values: ['sedan', 'suv', 'hatchback', 'microbus', 'pickup'],
        message:
          'Car type must be sedan, suv, hatchback, microbus, or pickup',
      },
    },

    year: {
      type: Number,
      required: [true, 'Year is required'],
      min: [1900, 'Year must be 1900 or later'],
      max: [new Date().getFullYear() + 1, 'Year cannot be in the future'],
    },

    seatingCapacity: {
      type: Number,
      required: [true, 'Seating capacity is required'],
      min: [1, 'Seating capacity must be at least 1'],
    },

    fuelType: {
      type: String,
      required: [true, 'Fuel type is required'],
      enum: {
        values: ['petrol', 'diesel', 'octane', 'cng', 'hybrid', 'electric'],
        message:
          'Fuel type must be petrol, diesel, octane, cng, hybrid, or electric',
      },
    },

    transmission: {
      type: String,
      required: [true, 'Transmission type is required'],
      enum: {
        values: ['manual', 'automatic'],
        message: 'Transmission must be manual or automatic',
      },
    },

    dailyRentalPrice: {
      type: Number,
      required: [true, 'Daily rental price is required'],
      min: [1, 'Daily rental price must be a positive number'],
    },

    images: {
      type: [String],
      default: [],
    },

    description: {
      type: String,
      trim: true,
      default: null,
    },

    status: {
      type: String,
      enum: {
        values: ['available', 'rented', 'reserved', 'maintenance', 'inactive'],
        message:
          'Status must be available, rented, reserved, maintenance, or inactive',
      },
      default: 'available',
    },

    // References Driver — string ref avoids circular import issues at module load
    assignedDriver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Driver',
      default: null,
    },

    currentMileage: {
      type: Number,
      min: [0, 'Mileage cannot be negative'],
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Car', carSchema);
