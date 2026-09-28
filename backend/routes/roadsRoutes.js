/**
 * GroundFix Road Health Routes
 */

const express = require('express');
const router = express.Router();
const roadsController = require('../controllers/roadsController');

// GET /api/roads
router.get('/', roadsController.getRoads);

module.exports = router;
