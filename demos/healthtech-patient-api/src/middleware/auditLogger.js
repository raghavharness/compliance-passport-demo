const logger = require('../utils/logger');

/**
 * HIPAA Audit Trail middleware.
 * Logs all access to PHI including who accessed what, when, and from where.
 * Required by HIPAA 164.312(b) for audit controls.
 */

function auditLogger(resourceType) {
  return (req, res, next) => {
    const startTime = Date.now();

    // Capture the original end method
    const originalEnd = res.end;
    res.end = function (...args) {
      const duration = Date.now() - startTime;

      logger.info('PHI_ACCESS_AUDIT', {
        timestamp: new Date().toISOString(),
        userId: req.user?.id || 'anonymous',
        userName: req.user?.name || 'unknown',
        userRole: req.user?.role || 'unknown',
        action: req.method,
        resourceType,
        resourceId: req.params.patientId || req.params.id || 'list',
        path: req.originalUrl,
        statusCode: res.statusCode,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        duration,
      });

      originalEnd.apply(this, args);
    };

    next();
  };
}

module.exports = auditLogger;
