/**
 * GroundFix Hazards Controller
 * Manages proximity searches for Driver Mode (Rule 27, Rule 30)
 */

const dbService = require('../services/dbService');

async function getNearby(req, res, next) {
  try {
    const lat = parseFloat(req.query.latitude || req.query.lat);
    const lng = parseFloat(req.query.longitude || req.query.lng);
    const radius = parseInt(req.query.radius, 10) || 5000; // default 5km

    if (isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({
        success: false,
        error: 'Query parameters latitude and longitude are required.'
      });
    }

    const nearby = await dbService.getNearbyHazards(lat, lng, radius);

    res.json({
      success: true,
      user_location: { latitude: lat, longitude: lng },
      radius_meters: radius,
      count: nearby.length,
      data: nearby
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getNearby
};
