const express = require('express');
const router = express.Router();

const {
  submitContactMessage,
  getAllContactMessages,
  getContactMessageById,
  updateContactMessageStatus,
  deleteContactMessage,
  replyToContactMessage,
} = require('../controllers/contact.controller');

const protect = require('../middleware/auth.middleware');
const requireRole = require('../middleware/role.middleware');

// Public route - anyone can submit a contact message
router.post('/', submitContactMessage);

// Admin-only routes
router.get('/', protect, requireRole('admin'), getAllContactMessages);
router.get('/:id', protect, requireRole('admin'), getContactMessageById);
router.patch('/:id/status', protect, requireRole('admin'), updateContactMessageStatus);
router.post('/:id/reply', protect, requireRole('admin'), replyToContactMessage);
router.delete('/:id', protect, requireRole('admin'), deleteContactMessage);

module.exports = router;
