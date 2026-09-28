/**
 * GroundFix AI Assistant Routes (Rule 31)
 */

const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');

// POST /api/ai/assistant
router.post('/assistant', aiController.askAssistant);

module.exports = router;
