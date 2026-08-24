const express = require('express');
const router = express.Router();

const {
  createBooking,
  getAllBookings,
  getBookingById,
  updateBookingStatus,
  assignDriver,
  cancelBooking,
} = require('../controllers/booking.controller');

const protect = require('../middleware/auth.middleware');
const requireRole = require('../middleware/role.middleware');

// Customer booking creation
router.post('/', protect, requireRole('customer'), createBooking);

// Protected booking queries
router.get('/', protect, getAllBookings);
router.get('/:id', protect, getBookingById);

// Admin-only management
router.patch('/:id/status', protect, requireRole('admin'), updateBookingStatus);
router.patch('/:id/assign-driver', protect, requireRole('admin'), assignDriver);

// Customer or Admin cancellation
router.patch('/:id/cancel', protect, cancelBooking);

module.exports = router;
