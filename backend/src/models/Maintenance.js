const mongoose = require('mongoose');

const maintenanceSchema = new mongoose.Schema(
  {
    maintenanceId: {
      type: String,
      required: [true, 'Maintenance ID is required'],
      unique: true,
      trim: true,
    },

    car: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Car',
      required: [true, 'Car reference is required'],
    },

    serviceType: {
      type: String,
      required: [true, 'Service type is required'],
      enum: {
        values: [
          'routine',
          'oil_change',
          'tire',
          'brake',
          'engine',
          'electrical',
          'bodywork',
          'other',
        ],
        message:
          'Service type must be routine, oil_change, tire, brake, engine, electrical, bodywork, or other',
      },
    },

    description: {
      type: String,
      trim: true,
      default: null,
    },

    serviceDate: {
      type: Date,
      required: [true, 'Service date is required'],
    },

    completedDate: {
      type: Date,
      default: null,
    },

    mileage: {
      type: Number,
      min: [0, 'Mileage cannot be negative'],
      default: 0,
    },

    cost: {
      type: Number,
      min: [0, 'Cost cannot be negative'],
      default: 0,
    },

    serviceProvider: {
      type: String,
      trim: true,
      default: null,
    },

    status: {
      type: String,
      enum: {
        values: ['scheduled', 'in_progress', 'completed', 'cancelled'],
        message:
          'Status must be scheduled, in_progress, completed, or cancelled',
      },
      default: 'scheduled',
    },

    partsReplaced: {
      type: [String],
      default: [],
    },

    notes: {
      type: String,
      trim: true,
      default: null,
    },

    nextServiceDate: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Maintenance', maintenanceSchema);
