const express = require('express');
const router = express.Router();

const {
  getProfile,
  updateProfile,
  changePassword,
  getAllUsers,
  getUserById,
  updateUserStatus,
  updateUserRole,
} = require('../controllers/user.controller');

const protect = require('../middleware/auth.middleware');
const requireRole = require('../middleware/role.middleware');

// User profile & self-service routes (Authenticated Users)
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);

// Admin-only user management routes
router.get('/', protect, requireRole('admin'), getAllUsers);
router.get('/:id', protect, requireRole('admin'), getUserById);
router.patch('/:id/status', protect, requireRole('admin'), updateUserStatus);
router.patch('/:id/role', protect, requireRole('admin'), updateUserRole);

module.exports = router;
