const express = require('express');
const router = express.Router();

const {
  getCustomerMe,
  getAllCustomers,
  getCustomerById,
} = require('../controllers/customer.controller');

const protect = require('../middleware/auth.middleware');
const requireRole = require('../middleware/role.middleware');

// Customer self-profile (Authenticated Customer only)
router.get('/me', protect, requireRole('customer'), getCustomerMe);

// Admin-only customer management routes
router.get('/', protect, requireRole('admin'), getAllCustomers);
router.get('/:id', protect, requireRole('admin'), getCustomerById);

module.exports = router;
