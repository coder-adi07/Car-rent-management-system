const express = require('express');
const router = express.Router();

const {
  getDriverMe,
  updateDriverMe,
  getAllDrivers,
  getDriverById,
  createDriverByAdmin,
  verifyDriverByAdmin,
} = require('../controllers/driver.controller');

const protect = require('../middleware/auth.middleware');
const requireRole = require('../middleware/role.middleware');

// Driver self-profile (Authenticated Driver only)
router.get('/me', protect, requireRole('driver'), getDriverMe);
router.put('/me', protect, requireRole('driver'), updateDriverMe);

// Admin-only driver management routes
router.get('/', protect, requireRole('admin'), getAllDrivers);
router.post('/', protect, requireRole('admin'), createDriverByAdmin);
router.get('/:id', protect, requireRole('admin'), getDriverById);
router.patch('/:id/verify', protect, requireRole('admin'), verifyDriverByAdmin);

module.exports = router;
