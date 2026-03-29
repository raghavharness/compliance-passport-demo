const { describe, it } = require('node:test');
const assert = require('node:assert');
const jwt = require('jsonwebtoken');
const { authenticate, authorize } = require('../../src/middleware/auth');

describe('Auth Middleware', () => {
  const mockRes = () => {
    const res = {};
    res.status = (code) => { res.statusCode = code; return res; };
    res.json = (data) => { res.body = data; return res; };
    return res;
  };

  describe('authenticate', () => {
    it('should reject request without authorization header', () => {
      const req = { headers: {} };
      const res = mockRes();
      let nextCalled = false;
      authenticate(req, res, () => { nextCalled = true; });
      assert.strictEqual(res.statusCode, 401);
      assert.strictEqual(nextCalled, false);
    });

    it('should reject request with invalid token format', () => {
      const req = { headers: { authorization: 'InvalidFormat' } };
      const res = mockRes();
      let nextCalled = false;
      authenticate(req, res, () => { nextCalled = true; });
      assert.strictEqual(res.statusCode, 401);
      assert.strictEqual(nextCalled, false);
    });

    it('should accept valid JWT token', () => {
      const token = jwt.sign({ sub: 'user-1', role: 'admin' }, 'dev-secret-change-in-production');
      const req = { headers: { authorization: `Bearer ${token}` } };
      const res = mockRes();
      let nextCalled = false;
      authenticate(req, res, () => { nextCalled = true; });
      assert.strictEqual(nextCalled, true);
      assert.strictEqual(req.user.sub, 'user-1');
    });

    it('should reject expired token', () => {
      const token = jwt.sign({ sub: 'user-1' }, 'dev-secret-change-in-production', { expiresIn: '-1s' });
      const req = { headers: { authorization: `Bearer ${token}` } };
      const res = mockRes();
      let nextCalled = false;
      authenticate(req, res, () => { nextCalled = true; });
      assert.strictEqual(res.statusCode, 401);
      assert.ok(res.body.error.includes('expired'));
      assert.strictEqual(nextCalled, false);
    });

    it('should reject token with wrong secret', () => {
      const token = jwt.sign({ sub: 'user-1' }, 'wrong-secret');
      const req = { headers: { authorization: `Bearer ${token}` } };
      const res = mockRes();
      let nextCalled = false;
      authenticate(req, res, () => { nextCalled = true; });
      assert.strictEqual(res.statusCode, 401);
      assert.strictEqual(nextCalled, false);
    });
  });

  describe('authorize', () => {
    it('should allow user with correct role', () => {
      const req = { user: { role: 'admin' } };
      const res = mockRes();
      let nextCalled = false;
      authorize('admin', 'service')(req, res, () => { nextCalled = true; });
      assert.strictEqual(nextCalled, true);
    });

    it('should reject user with insufficient role', () => {
      const req = { user: { role: 'viewer' } };
      const res = mockRes();
      let nextCalled = false;
      authorize('admin')(req, res, () => { nextCalled = true; });
      assert.strictEqual(res.statusCode, 403);
      assert.strictEqual(nextCalled, false);
    });

    it('should reject request without user', () => {
      const req = {};
      const res = mockRes();
      let nextCalled = false;
      authorize('admin')(req, res, () => { nextCalled = true; });
      assert.strictEqual(res.statusCode, 403);
      assert.strictEqual(nextCalled, false);
    });
  });
});
