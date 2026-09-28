/**
 * GroundFix Error Handling Middleware
 */

function errorHandler(err, req, res, next) {
  console.error('[GroundFix Error]', err.stack || err.message);

  const status = err.status || (res.statusCode !== 200 ? res.statusCode : 500);

  res.status(status).json({
    success: false,
    error: err.message || 'An unexpected server error occurred.',
    path: req.originalUrl,
    timestamp: new Date().toISOString()
  });
}

function notFoundHandler(req, res, next) {
  res.status(404).json({
    success: false,
    error: `API route not found: ${req.method} ${req.originalUrl}`
  });
}

module.exports = {
  errorHandler,
  notFoundHandler
};
