const express = require('express');
const router = express.Router();

const {
  getAllRentals,
  getRentalById,
  createRental,
  updateRentalStatus,
  returnRental,
} = require('../controllers/rental.controller');

const protect = require('../middleware/auth.middleware');
const requireRole = require('../middleware/role.middleware');

// Protected rental queries
router.get('/', protect, getAllRentals);
router.get('/:id', protect, getRentalById);

// Admin-only management
router.post('/', protect, requireRole('admin'), createRental);
router.patch('/:id/status', protect, requireRole('admin'), updateRentalStatus);
router.patch('/:id/return', protect, requireRole('admin'), returnRental);

module.exports = router;
