/**
 * GroundFix Road Health Controller (Rule 29)
 */

const dbService = require('../services/dbService');

async function getRoads(req, res, next) {
  try {
    const roads = await dbService.getRoadsSummary();
    res.json({
      success: true,
      count: roads.length,
      data: roads
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getRoads
};
