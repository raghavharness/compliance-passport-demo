const config = require('../config');

/**
 * Simple in-memory rate limiter for payment endpoints.
 * In production, use Redis-backed rate limiting for distributed systems.
 */
const requestCounts = new Map();

function rateLimiter(req, res, next) {
  const key = req.user?.merchantId || req.ip;
  const now = Date.now();
  const windowStart = now - config.rateLimit.windowMs;

  if (!requestCounts.has(key)) {
    requestCounts.set(key, []);
  }

  const timestamps = requestCounts.get(key).filter(ts => ts > windowStart);
  timestamps.push(now);
  requestCounts.set(key, timestamps);

  if (timestamps.length > config.rateLimit.maxRequests) {
    const retryAfter = Math.ceil(config.rateLimit.windowMs / 1000);
    res.set('Retry-After', String(retryAfter));
    return res.status(429).json({
      error: 'Rate limit exceeded',
      retryAfter: retryAfter,
      limit: config.rateLimit.maxRequests,
      windowMs: config.rateLimit.windowMs,
    });
  }

  res.set('X-RateLimit-Limit', String(config.rateLimit.maxRequests));
  res.set('X-RateLimit-Remaining', String(config.rateLimit.maxRequests - timestamps.length));
  next();
}

// Cleanup stale entries every 5 minutes
setInterval(() => {
  const cutoff = Date.now() - 30 * 60 * 1000;
  for (const [key, timestamps] of requestCounts.entries()) {
    const active = timestamps.filter(ts => ts > cutoff);
    if (active.length === 0) {
      requestCounts.delete(key);
    } else {
      requestCounts.set(key, active);
    }
  }
}, 5 * 60 * 1000).unref();

module.exports = rateLimiter;
