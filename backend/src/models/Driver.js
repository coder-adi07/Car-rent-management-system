const mongoose = require('mongoose');

const emergencyContactSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true },
    phone: { type: String, trim: true },
    relationship: { type: String, trim: true },
  },
  { _id: false }
);

const addressSchema = new mongoose.Schema(
  {
    street: { type: String, trim: true },
    city: { type: String, trim: true },
    district: { type: String, trim: true },
    postalCode: { type: String, trim: true },
  },
  { _id: false }
);

const driverSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      unique: true,
    },

    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
    },

    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },

    email: {
      type: String,
      lowercase: true,
      trim: true,
    },

    profileImage: {
      type: String,
      default: null,
    },

    dateOfBirth: {
      type: Date,
      default: null,
    },

    address: {
      type: addressSchema,
      default: null,
    },

    licenseNumber: {
      type: String,
      required: [true, 'License number is required'],
      unique: true,
      trim: true,
    },

    licenseExpiryDate: {
      type: Date,
      required: [true, 'License expiry date is required'],
    },

    experienceYears: {
      type: Number,
      min: [0, 'Experience years cannot be negative'],
      default: 0,
    },

    emergencyContact: {
      type: emergencyContactSchema,
      default: null,
    },

    status: {
      type: String,
      enum: {
        values: ['pending', 'available', 'busy', 'inactive', 'suspended'],
        message: 'Status must be pending, available, busy, inactive, or suspended',
      },
      default: 'pending',
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    rating: {
      type: Number,
      min: [0, 'Rating cannot be less than 0'],
      max: [5, 'Rating cannot be more than 5'],
      default: 0,
    },

    totalTrips: {
      type: Number,
      min: [0, 'Total trips cannot be negative'],
      default: 0,
    },

    // References Car — using string ref to avoid circular import issues
    assignedCar: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Car',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Driver', driverSchema);
