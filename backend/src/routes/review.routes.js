const express = require('express');
const router = express.Router();

const {
  createReview,
  getAllReviews,
  getReviewById,
  updateReview,
  updateReviewStatus,
  deleteReview,
} = require('../controllers/review.controller');

const protect = require('../middleware/auth.middleware');
const requireRole = require('../middleware/role.middleware');

// Public route to view published reviews (protect optional handled in controller)
router.get('/', (req, res, next) => {
  // Pass to protect if authorization header present, else pass through
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return protect(req, res, next);
  }
  next();
}, getAllReviews);

router.get('/:id', (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return protect(req, res, next);
  }
  next();
}, getReviewById);

// Customer creation
router.post('/', protect, requireRole('customer'), createReview);

// Owner or Admin editing/deletion
router.put('/:id', protect, updateReview);
router.delete('/:id', protect, deleteReview);

// Admin-only status update
router.patch('/:id/status', protect, requireRole('admin'), updateReviewStatus);

module.exports = router;
