/**
 * GroundFix Dashboard Controller
 * Provides KPIs and municipal statistics (Rule 20)
 */

const dbService = require('../services/dbService');

async function getStats(req, res, next) {
  try {
    const stats = await dbService.getDashboardStats();
    res.json({
      success: true,
      data: stats
    });
  } catch (err) {
    next(err);
  }
}

async function getDepartments(req, res, next) {
  try {
    const departments = await dbService.getDepartments();
    res.json({
      success: true,
      data: departments
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getStats,
  getDepartments
};
