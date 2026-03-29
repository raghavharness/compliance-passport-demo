const logger = require('../utils/logger');

function errorHandler(err, req, res, _next) {
  logger.error('Unhandled error', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  if (err.isOperational) {
    return res.status(err.statusCode || 400).json({
      error: err.message,
      code: err.code,
    });
  }

  res.status(500).json({
    error: 'Internal server error',
    requestId: req.headers['x-request-id'] || 'unknown',
  });
}

class AppError extends Error {
  constructor(message, statusCode, code) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
  }
}

module.exports = { errorHandler, AppError };
