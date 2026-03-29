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

function request(server, method, path, { body, headers } = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, `http://localhost:${server.address().port}`);
    const options = {
      method,
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
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
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

describe('Payment API', () => {
  const adminToken = makeToken({ sub: 'admin-1', role: 'admin' });
  const userToken = makeToken({ sub: 'user-1', role: 'user' });

  beforeEach(() => {
    Payment.clear();
  });

  it('should reject unauthenticated requests', async () => {
    const server = app.listen(0);
    try {
      const res = await request(server, 'GET', '/api/v1/payments');
      assert.strictEqual(res.status, 401);
    } finally {
      server.close();
    }
  });

  it('should create a payment', async () => {
    const server = app.listen(0);
    try {
      const res = await request(server, 'POST', '/api/v1/payments', {
        headers: { authorization: `Bearer ${userToken}` },
        body: {
          amount: 49.99,
          currency: 'USD',
          customerId: '550e8400-e29b-41d4-a716-446655440000',
          description: 'Test payment',
        },
      });
      assert.strictEqual(res.status, 201);
      assert.ok(res.body.data.id);
      assert.strictEqual(res.body.data.amount, 49.99);
      assert.strictEqual(res.body.data.status, 'completed');
    } finally {
      server.close();
    }
  });

  it('should reject invalid payment data', async () => {
    const server = app.listen(0);
    try {
      const res = await request(server, 'POST', '/api/v1/payments', {
        headers: { authorization: `Bearer ${userToken}` },
        body: { amount: -10, currency: 'INVALID' },
      });
      assert.strictEqual(res.status, 400);
      assert.ok(res.body.details);
    } finally {
      server.close();
    }
  });

  it('should list payments', async () => {
    const server = app.listen(0);
    try {
      await request(server, 'POST', '/api/v1/payments', {
        headers: { authorization: `Bearer ${userToken}` },
        body: {
          amount: 25.00,
          currency: 'EUR',
          customerId: '550e8400-e29b-41d4-a716-446655440000',
        },
      });

      const res = await request(server, 'GET', '/api/v1/payments', {
        headers: { authorization: `Bearer ${userToken}` },
      });
      assert.strictEqual(res.status, 200);
      assert.ok(res.body.data.length >= 1);
    } finally {
      server.close();
    }
  });

  it('should process refund with admin role', async () => {
    const server = app.listen(0);
    try {
      const createRes = await request(server, 'POST', '/api/v1/payments', {
        headers: { authorization: `Bearer ${adminToken}` },
        body: {
          amount: 100.00,
          currency: 'USD',
          customerId: '550e8400-e29b-41d4-a716-446655440000',
        },
      });

      const paymentId = createRes.body.data.id;
      const refundRes = await request(server, 'POST', `/api/v1/payments/${paymentId}/refund`, {
        headers: { authorization: `Bearer ${adminToken}` },
        body: { reason: 'requested_by_customer' },
      });
      assert.strictEqual(refundRes.status, 200);
      assert.strictEqual(refundRes.body.data.status, 'refunded');
    } finally {
      server.close();
    }
  });

  it('should reject refund from non-admin user', async () => {
    const server = app.listen(0);
    try {
      const createRes = await request(server, 'POST', '/api/v1/payments', {
        headers: { authorization: `Bearer ${userToken}` },
        body: {
          amount: 50.00,
          currency: 'USD',
          customerId: '550e8400-e29b-41d4-a716-446655440000',
        },
      });

      const paymentId = createRes.body.data.id;
      const refundRes = await request(server, 'POST', `/api/v1/payments/${paymentId}/refund`, {
        headers: { authorization: `Bearer ${userToken}` },
        body: { reason: 'duplicate' },
      });
      assert.strictEqual(refundRes.status, 403);
    } finally {
      server.close();
    }
  });
});
