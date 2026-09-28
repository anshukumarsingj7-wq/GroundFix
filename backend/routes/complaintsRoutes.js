/**
 * GroundFix Complaints Routes
 */

const express = require('express');
const router = express.Router();
const complaintsController = require('../controllers/complaintsController');
const upload = require('../middleware/uploadMiddleware');

// GET /api/complaints
router.get('/', complaintsController.getComplaints);

// GET /api/complaints/:complaintId
router.get('/:complaintId', complaintsController.getComplaintById);

// POST /api/complaints (supports multipart upload with file or JSON)
router.post('/', upload.single('image'), complaintsController.createComplaint);

// PATCH /api/complaints/:complaintId/status
router.patch('/:complaintId/status', complaintsController.updateStatus);

// POST /api/complaints/:complaintId/confirm
router.post('/:complaintId/confirm', complaintsController.confirmComplaint);

// POST /api/complaints/:complaintId/near-miss
router.post('/:complaintId/near-miss', complaintsController.addNearMiss);

// POST /api/complaints/:complaintId/reverify
router.post('/:complaintId/reverify', complaintsController.reverifyComplaint);

// POST /api/complaints/:complaintId/assign
router.post('/:complaintId/assign', complaintsController.assignDepartment);

module.exports = router;
