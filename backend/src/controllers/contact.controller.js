const ContactMessage = require('../models/ContactMessage');
const { sendEmail, generateReplyEmailHtml } = require('../utils/sendEmail');

/**
 * @desc    Submit a contact message (Public - no auth required)
 * @route   POST /api/contact
 * @access  Public
 */
const submitContactMessage = async (req, res, next) => {
  try {
    const { name, email, phone, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'নাম, ইমেইল এবং বার্তা প্রদান করা আবশ্যক।',
      });
    }

    const contactMessage = await ContactMessage.create({
      name,
      email,
      phone: phone || '',
      message,
    });

    res.status(201).json({
      success: true,
      message: 'আপনার বার্তাটি সফলভাবে পাঠানো হয়েছে। আমরা দ্রুত যোগাযোগ করব।',
      data: { contactMessage },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all contact messages (Admin only)
 * @route   GET /api/contact
 * @access  Private (Admin)
 */
const getAllContactMessages = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    const query = {};
    if (status && ['unread', 'read', 'replied'].includes(status)) {
      query.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await ContactMessage.countDocuments(query);

    const messages = await ContactMessage.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Count by status for dashboard stats
    const unreadCount = await ContactMessage.countDocuments({ status: 'unread' });

    res.status(200).json({
      success: true,
      data: {
        messages,
        unreadCount,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single contact message by ID (Admin only)
 * @route   GET /api/contact/:id
 * @access  Private (Admin)
 */
const getContactMessageById = async (req, res, next) => {
  try {
    const message = await ContactMessage.findById(req.params.id);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'বার্তাটি পাওয়া যায়নি।',
      });
    }

    // Auto-mark as read when admin views it
    if (message.status === 'unread') {
      message.status = 'read';
      await message.save();
    }

    res.status(200).json({
      success: true,
      data: { message },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update contact message status (Admin only)
 * @route   PATCH /api/contact/:id/status
 * @access  Private (Admin)
 */
const updateContactMessageStatus = async (req, res, next) => {
  try {
    const { status, adminNote } = req.body;

    if (!status || !['unread', 'read', 'replied'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'সঠিক স্ট্যাটাস প্রদান করুন (unread, read, replied)।',
      });
    }

    const message = await ContactMessage.findById(req.params.id);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'বার্তাটি পাওয়া যায়নি।',
      });
    }

    message.status = status;
    if (adminNote !== undefined) {
      message.adminNote = adminNote;
    }
    await message.save();

    res.status(200).json({
      success: true,
      message: 'বার্তার স্ট্যাটাস সফলভাবে আপডেট করা হয়েছে।',
      data: { message },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a contact message (Admin only)
 * @route   DELETE /api/contact/:id
 * @access  Private (Admin)
 */
const deleteContactMessage = async (req, res, next) => {
  try {
    const message = await ContactMessage.findById(req.params.id);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'বার্তাটি পাওয়া যায়নি।',
      });
    }

    await message.deleteOne();

    res.status(200).json({
      success: true,
      message: 'বার্তাটি সফলভাবে মুছে ফেলা হয়েছে।',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Reply to a contact message (Admin only)
 * @route   POST /api/contact/:id/reply
 * @access  Private (Admin)
 */
const replyToContactMessage = async (req, res, next) => {
  try {
    const { reply } = req.body;

    if (!reply || !reply.trim()) {
      return res.status(400).json({
        success: false,
        message: 'রিপ্লাই বার্তা প্রদান করা আবশ্যক।',
      });
    }

    const message = await ContactMessage.findById(req.params.id);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'বার্তাটি পাওয়া যায়নি।',
      });
    }

    message.adminReply = reply.trim();
    message.status = 'replied';
    message.repliedAt = new Date();
    message.repliedBy = req.user._id;
    await message.save();

    // Send automated email to the visitor
    try {
      const emailHtml = generateReplyEmailHtml({
        visitorName: message.name,
        originalMessage: message.message,
        adminReply: message.adminReply,
      });

      await sendEmail({
        to: message.email,
        subject: 'গাড়ি লাগবে - আপনার বার্তার উত্তর (Support Reply)',
        text: `প্রিয় ${message.name},\n\nআপনার বার্তার উত্তর:\n${message.adminReply}\n\nআপনার মূল বার্তা:\n${message.message}\n\nধন্যবাদ,\nগাড়ি লাগবে সাপোর্ট টিম`,
        html: emailHtml,
      });
    } catch (emailErr) {
      console.error('ইমেইল পাঠাতে ত্রুটি:', emailErr.message);
      // We don't fail the request if email transport fails; the DB reply is still saved.
    }

    res.status(200).json({
      success: true,
      message: 'রিপ্লাই সফলভাবে সংরক্ষিত ও ভিজিটরের ইমেইলে পাঠানো হয়েছে।',
      data: { message },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  submitContactMessage,
  getAllContactMessages,
  getContactMessageById,
  updateContactMessageStatus,
  deleteContactMessage,
  replyToContactMessage,
};
