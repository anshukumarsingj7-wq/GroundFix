/**
 * GroundFix Image Verification Routes (Rule 11)
 */

const express = require('express');
const router = express.Router();
const imageVerificationController = require('../controllers/imageVerificationController');
const upload = require('../middleware/uploadMiddleware');

// POST /api/image-verification/check
router.post('/check', upload.single('image'), imageVerificationController.checkImage);

module.exports = router;
