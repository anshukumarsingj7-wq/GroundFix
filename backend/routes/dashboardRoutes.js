/**
 * GroundFix Dashboard Routes
 */

const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');

// GET /api/dashboard/stats
router.get('/stats', dashboardController.getStats);

// GET /api/dashboard/departments
router.get('/departments', dashboardController.getDepartments);

module.exports = router;
