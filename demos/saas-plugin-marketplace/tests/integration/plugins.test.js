const { describe, it, before, after, beforeEach } = require('node:test');
const assert = require('node:assert');
const http = require('http');
const jwt = require('jsonwebtoken');
const app = require('../../src/app');
const config = require('../../src/config');
const pluginModel = require('../../src/models/plugin');

describe('Plugin API Integration', () => {
  let server;
  let baseUrl;
  let publisherToken;

  before((_, done) => {
    server = app.listen(0, () => {
      const { port } = server.address();
      baseUrl = `http://localhost:${port}`;
      publisherToken = jwt.sign(
        { sub: 'user_001', email: 'publisher@example.com', role: 'publisher', orgId: 'org_int' },
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
    pluginModel.clearAll();
  });

  function request(method, path, body, token) {
    return new Promise((resolve, reject) => {
      const url = new URL(`${baseUrl}${path}`);
      const options = {
        method,
        hostname: url.hostname,
        port: url.port,
        path: url.pathname,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token || publisherToken}`,
        },
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

  it('should reject unauthenticated requests', async () => {
    const res = await request('GET', '/api/plugins', null, 'invalid');
    assert.strictEqual(res.status, 401);
  });

  it('should create a plugin', async () => {
    const res = await request('POST', '/api/plugins', {
      name: 'test-connector',
      version: '1.0.0',
      type: 'connector',
      description: 'A test connector plugin for integration testing',
    });

    assert.strictEqual(res.status, 201);
    assert.ok(res.body.id.startsWith('plg_'));
    assert.strictEqual(res.body.status, 'published');
  });

  it('should reject invalid plugin data', async () => {
    const res = await request('POST', '/api/plugins', {
      name: 'Invalid Plugin!',
      version: 'bad',
      type: 'invalid',
      description: 'x',
    });

    assert.strictEqual(res.status, 400);
  });

  it('should list plugins', async () => {
    await request('POST', '/api/plugins', {
      name: 'list-test',
      version: '1.0.0',
      type: 'step',
      description: 'Plugin for list testing scenario',
    });

    const res = await request('GET', '/api/plugins');
    assert.strictEqual(res.status, 200);
    assert.ok(Array.isArray(res.body.data));
  });
});
