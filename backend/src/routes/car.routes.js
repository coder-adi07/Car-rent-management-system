const express = require('express');
const router = express.Router();

const {
  getAllCars,
  getCarById,
  createCar,
  updateCar,
  deleteCar,
  updateCarStatus,
} = require('../controllers/car.controller');

const protect = require('../middleware/auth.middleware');
const requireRole = require('../middleware/role.middleware');

// Public routes
router.get('/', getAllCars);
router.get('/:id', getCarById);

// Admin-only management routes
router.post('/', protect, requireRole('admin'), createCar);
router.put('/:id', protect, requireRole('admin'), updateCar);
router.delete('/:id', protect, requireRole('admin'), deleteCar);
router.patch('/:id/status', protect, requireRole('admin'), updateCarStatus);

module.exports = router;
