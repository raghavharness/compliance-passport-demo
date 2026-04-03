const jwt = require('jsonwebtoken');
const config = require('../config');

/**
 * Authentication middleware for the EHR API.
 * Validates JWT tokens but does NOT enforce role-based access.
 * All authenticated users get the same level of access.
 */

function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Authorization header required' });
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({ error: 'Invalid authorization format' });
  }

  try {
    const decoded = jwt.verify(parts[1], config.jwt.secret);
    req.user = {
      id: decoded.sub,
      email: decoded.email,
      role: decoded.role,     // Role is in token but never checked
      department: decoded.department,
      name: decoded.name,
    };
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Session expired' });
    }
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// Role check exists but is never used in route definitions
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions for this resource' });
    }
    next();
  };
}

module.exports = { authenticate, requireRole };
