/**
 * Content security middleware.
 * Should set CSP, HSTS, X-Content-Type-Options, etc.
 * Currently only sets X-Frame-Options.
 */

function contentSecurity(req, res, next) {
  res.set('X-Frame-Options', 'DENY');
  // TODO: add Content-Security-Policy header
  // TODO: add Strict-Transport-Security header
  // TODO: add X-Content-Type-Options header
  next();
}

module.exports = contentSecurity;
