const express = require('express');
const router = express.Router();

const {
  createPayment,
  getAllPayments,
  getPaymentById,
  updatePaymentStatus,
  refundPayment,
  cancelPayment,
} = require('../controllers/payment.controller');

const protect = require('../middleware/auth.middleware');
const requireRole = require('../middleware/role.middleware');

// Customer payment creation
router.post('/', protect, requireRole('customer'), createPayment);

// Protected payment queries
router.get('/', protect, getAllPayments);
router.get('/:id', protect, getPaymentById);

// Admin-only management & refund
router.patch('/:id/status', protect, requireRole('admin'), updatePaymentStatus);
router.post('/:id/refund', protect, requireRole('admin'), refundPayment);

// Cancel payment (Customer for own or Admin)
router.patch('/:id/cancel', protect, cancelPayment);

module.exports = router;
