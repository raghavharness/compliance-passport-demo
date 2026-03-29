const { describe, it } = require('node:test');
const assert = require('node:assert');
const http = require('http');
const app = require('../../src/app');

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

describe('Health Endpoints', () => {
  it('should return healthy status', async () => {
    const server = app.listen(0);
    try {
      const res = await request(server, 'GET', '/health');
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.status, 'healthy');
      assert.ok(res.body.version);
      assert.ok(res.body.timestamp);
    } finally {
      server.close();
    }
  });

  it('should return readiness status with dependency checks', async () => {
    const server = app.listen(0);
    try {
      const res = await request(server, 'GET', '/health/ready');
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.status, 'ready');
      assert.ok(res.body.checks.database);
      assert.ok(res.body.checks.cache);
      assert.ok(res.body.checks.paymentProvider);
    } finally {
      server.close();
    }
  });

  it('should return 404 for unknown routes', async () => {
    const server = app.listen(0);
    try {
      const res = await request(server, 'GET', '/unknown');
      assert.strictEqual(res.status, 404);
    } finally {
      server.close();
    }
  });
});
