const express = require('express');
const router = express.Router();

const {
  getAllMaintenance,
  getMaintenanceById,
  createMaintenance,
  updateMaintenance,
  updateMaintenanceStatus,
  deleteMaintenance,
} = require('../controllers/maintenance.controller');

const protect = require('../middleware/auth.middleware');
const requireRole = require('../middleware/role.middleware');

// All maintenance routes are Admin-only
router.use(protect, requireRole('admin'));

router.get('/', getAllMaintenance);
router.get('/:id', getMaintenanceById);
router.post('/', createMaintenance);
router.put('/:id', updateMaintenance);
router.patch('/:id/status', updateMaintenanceStatus);
router.delete('/:id', deleteMaintenance);

module.exports = router;
