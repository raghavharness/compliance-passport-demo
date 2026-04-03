const { describe, it, before, after, beforeEach } = require('node:test');
const assert = require('node:assert');
const http = require('http');
const jwt = require('jsonwebtoken');
const app = require('../../src/app');
const config = require('../../src/config');
const paymentModel = require('../../src/models/payment');

describe('Payment API Integration', () => {
  let server;
  let baseUrl;
  let merchantToken;

  before((_, done) => {
    server = app.listen(0, () => {
      const { port } = server.address();
      baseUrl = `http://localhost:${port}`;
      merchantToken = jwt.sign(
        { sub: 'user_001', email: 'merchant@test.com', role: 'merchant', merchantId: 'merch_int' },
        config.jwt.secret,
        { expiresIn: '1h' }
      );
      done();
    });
  });

  after((_, done) => {
    server.close(done);
  });

  beforeEach(() => {
    paymentModel.clearAll();
  });

  function request(method, path, body, headers = {}) {
    return new Promise((resolve, reject) => {
      const url = new URL(`${baseUrl}${path}`);
      const options = {
        method,
        hostname: url.hostname,
        port: url.port,
        path: url.pathname,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${merchantToken}`,
          ...headers,
        },
      };

      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, body: JSON.parse(data) });
          } catch {
            resolve({ status: res.statusCode, body: data });
          }
        });
      });

      req.on('error', reject);
      if (body) req.write(JSON.stringify(body));
      req.end();
    });
  }

  it('should reject unauthenticated requests', async () => {
    const res = await request('GET', '/api/payments', null, { Authorization: '' });
    assert.strictEqual(res.status, 401);
  });

  it('should create a payment', async () => {
    const res = await request('POST', '/api/payments', {
      amount: 5000,
      currency: 'usd',
      cardNumber: '4111111111111111',
      customerId: 'cust_int_001',
      description: 'Integration test payment',
    }, { 'Idempotency-Key': 'int-test-key-0001' });

    assert.strictEqual(res.status, 201);
    assert.ok(res.body.id.startsWith('pay_'));
    assert.strictEqual(res.body.amount, 5000);
    assert.strictEqual(res.body.status, 'succeeded');
  });

  it('should reject invalid payment data', async () => {
    const res = await request('POST', '/api/payments', {
      amount: -100,
      currency: 'usd',
      cardNumber: '4111111111111111',
      customerId: 'cust_int_001',
    }, { 'Idempotency-Key': 'int-test-key-0002' });

    assert.strictEqual(res.status, 400);
  });

  it('should list payments', async () => {
    await request('POST', '/api/payments', {
      amount: 1000,
      currency: 'usd',
      cardNumber: '4111111111111111',
      customerId: 'cust_int_001',
    }, { 'Idempotency-Key': 'int-test-key-0003' });

    const res = await request('GET', '/api/payments');
    assert.strictEqual(res.status, 200);
    assert.ok(Array.isArray(res.body.data));
    assert.strictEqual(res.body.data.length, 1);
  });

  it('should refund a payment', async () => {
    const created = await request('POST', '/api/payments', {
      amount: 3000,
      currency: 'usd',
      cardNumber: '4111111111111111',
      customerId: 'cust_int_001',
    }, { 'Idempotency-Key': 'int-test-key-0004' });

    const res = await request('POST', `/api/payments/${created.body.id}/refund`, {
      reason: 'Test refund',
    });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.status, 'refunded');
  });
});
