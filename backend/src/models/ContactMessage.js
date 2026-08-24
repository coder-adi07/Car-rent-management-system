const mongoose = require('mongoose');

const contactMessageSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'নাম প্রদান করা আবশ্যক।'],
      trim: true,
      maxlength: [100, 'নাম সর্বোচ্চ ১০০ অক্ষর হতে পারবে।'],
    },
    email: {
      type: String,
      required: [true, 'ইমেইল প্রদান করা আবশ্যক।'],
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'সঠিক ইমেইল ঠিকানা প্রদান করুন।'],
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    message: {
      type: String,
      required: [true, 'বার্তা প্রদান করা আবশ্যক।'],
      trim: true,
      maxlength: [2000, 'বার্তা সর্বোচ্চ ২০০০ অক্ষর হতে পারবে।'],
    },
    status: {
      type: String,
      enum: ['unread', 'read', 'replied'],
      default: 'unread',
    },
    adminNote: {
      type: String,
      trim: true,
      default: '',
    },
    adminReply: {
      type: String,
      trim: true,
      default: '',
      maxlength: [3000, 'রিপ্লাই সর্বোচ্চ ৩০০০ অক্ষর হতে পারবে।'],
    },
    repliedAt: {
      type: Date,
      default: null,
    },
    repliedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient querying
contactMessageSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('ContactMessage', contactMessageSchema);
