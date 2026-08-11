const express = require('express');
const router = express.Router();
const {
  getAdminStats, getUsers, toggleUserStatus,
  getProjects, getReports, createReport, updateReportStatus
} = require('../controllers/adminController');
const { auth, requireAdmin } = require('../middleware/auth');

router.get('/stats', auth, requireAdmin, getAdminStats);
router.get('/users', auth, requireAdmin, getUsers);
router.patch('/users/:id/status', auth, requireAdmin, toggleUserStatus);
router.get('/projects', auth, requireAdmin, getProjects);

// Reports can be created by any authenticated user
router.post('/reports', auth, createReport);
router.get('/reports', auth, requireAdmin, getReports);
router.patch('/reports/:id', auth, requireAdmin, updateReportStatus);

module.exports = router;
