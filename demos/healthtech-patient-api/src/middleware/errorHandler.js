const logger = require('../utils/logger');

function errorHandler(err, req, res, _next) {
  logger.error('Unhandled error', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    userId: req.user?.id,
  });

  if (err.type === 'validation') {
    return res.status(400).json({
      error: 'Validation Error',
      details: err.details || err.message,
    });
  }

  if (err.type === 'not_found') {
    return res.status(404).json({ error: 'Not Found', message: err.message });
  }

  res.status(500).json({
    error: 'Internal Server Error',
    requestId: req.id,
  });
}

module.exports = errorHandler;
