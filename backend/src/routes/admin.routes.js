const express = require('express');
const router = express.Router();

const { getDashboardSummary } = require('../controllers/admin.controller');
const protect = require('../middleware/auth.middleware');
const requireRole = require('../middleware/role.middleware');

// Admin Dashboard Summary route
router.get('/dashboard-summary', protect, requireRole('admin'), getDashboardSummary);

module.exports = router;
