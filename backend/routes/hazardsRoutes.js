/**
 * GroundFix Hazards & Proximity Routes
 */

const express = require('express');
const router = express.Router();
const hazardsController = require('../controllers/hazardsController');

// GET /api/hazards/nearby
router.get('/nearby', hazardsController.getNearby);

module.exports = router;
