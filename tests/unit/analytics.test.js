const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert');
const http = require('http');
const jwt = require('jsonwebtoken');
const app = require('../../src/app');
const Payment = require('../../src/models/payment');

const TEST_SECRET = 'dev-secret-change-in-production';

function makeToken(payload) {
  return jwt.sign(payload, TEST_SECRET);
}

function request(server, method, path, { headers } = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, `http://localhost:${server.address().port}`);
    const options = {
      method,
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      headers: { 'Content-Type': 'application/json', ...headers },
    };
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
        catch { resolve({ status: res.statusCode, body: data }); }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

describe('Analytics API', () => {
  const adminToken = makeToken({ sub: 'admin-1', role: 'admin' });
  const userToken = makeToken({ sub: 'user-1', role: 'user' });

  beforeEach(() => {
    Payment.clear();
  });

  it('should return payment summary for admin', async () => {
    Payment.create({ amount: 100, currency: 'USD', customerId: '550e8400-e29b-41d4-a716-446655440000' });
    Payment.create({ amount: 200, currency: 'EUR', customerId: '550e8400-e29b-41d4-a716-446655440000' });

    const server = app.listen(0);
    try {
      const res = await request(server, 'GET', '/api/v1/analytics/summary', {
        headers: { authorization: `Bearer ${adminToken}` },
      });
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.data.totalTransactions, 2);
      assert.strictEqual(res.body.data.totalVolume, 300);
      assert.strictEqual(res.body.data.averageAmount, 150);
    } finally {
      server.close();
    }
  });

  it('should reject non-admin access to analytics', async () => {
    const server = app.listen(0);
    try {
      const res = await request(server, 'GET', '/api/v1/analytics/summary', {
        headers: { authorization: `Bearer ${userToken}` },
      });
      assert.strictEqual(res.status, 403);
    } finally {
      server.close();
    }
  });

  it('should return daily volume breakdown', async () => {
    Payment.create({ amount: 50, currency: 'USD', customerId: '550e8400-e29b-41d4-a716-446655440000' });
    Payment.create({ amount: 75, currency: 'USD', customerId: '550e8400-e29b-41d4-a716-446655440000' });

    const server = app.listen(0);
    try {
      const res = await request(server, 'GET', '/api/v1/analytics/volume', {
        headers: { authorization: `Bearer ${adminToken}` },
      });
      assert.strictEqual(res.status, 200);
      assert.ok(res.body.data.length > 0);
      assert.ok(res.body.data[0].count > 0);
      assert.ok(res.body.data[0].volume > 0);
    } finally {
      server.close();
    }
  });

  it('should handle empty analytics gracefully', async () => {
    const server = app.listen(0);
    try {
      const res = await request(server, 'GET', '/api/v1/analytics/summary', {
        headers: { authorization: `Bearer ${adminToken}` },
      });
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.data.totalTransactions, 0);
      assert.strictEqual(res.body.data.averageAmount, 0);
    } finally {
      server.close();
    }
  });
});
