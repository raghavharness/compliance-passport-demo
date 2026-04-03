const { describe, it, before, after, beforeEach } = require('node:test');
const assert = require('node:assert');
const http = require('http');
const jwt = require('jsonwebtoken');
const app = require('../../src/app');
const config = require('../../src/config');
const patientModel = require('../../src/models/patient');

describe('Patient API Integration', () => {
  let server;
  let baseUrl;
  let doctorToken;
  let receptionistToken;

  before((_, done) => {
    server = app.listen(0, () => {
      const { port } = server.address();
      baseUrl = `http://localhost:${port}`;
      doctorToken = jwt.sign(
        { sub: 'dr_001', email: 'doctor@hospital.com', role: 'doctor', name: 'Dr. Smith', department: 'cardiology' },
        config.jwt.secret,
        { expiresIn: '1h' }
      );
      receptionistToken = jwt.sign(
        { sub: 'rec_001', email: 'reception@hospital.com', role: 'receptionist', name: 'Jane Doe', department: 'front_desk' },
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
    patientModel.clearAll();
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
          'Authorization': `Bearer ${token || doctorToken}`,
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
    const res = await request('GET', '/api/patients', null, 'invalid');
    assert.strictEqual(res.status, 401);
  });

  it('should create a patient', async () => {
    const res = await request('POST', '/api/patients', {
      firstName: 'John',
      lastName: 'Doe',
      ssn: '123-45-6789',
      dateOfBirth: '1985-03-15',
      gender: 'male',
    });

    assert.strictEqual(res.status, 201);
    assert.ok(res.body.id.startsWith('pat_'));
  });

  it('should allow receptionist to view patient PHI (no role check)', async () => {
    // This demonstrates the SOC 2 CC6.3 violation: no role-based access
    const created = await request('POST', '/api/patients', {
      firstName: 'Sensitive',
      lastName: 'Patient',
      ssn: '999-88-7777',
      dateOfBirth: '1970-01-01',
      gender: 'female',
    });

    // Receptionist can see full patient record including SSN
    const res = await request('GET', `/api/patients/${created.body.id}`, null, receptionistToken);
    assert.strictEqual(res.status, 200);
    assert.ok(res.body.ssn); // SSN is visible to receptionist
  });

  it('should reject invalid patient data', async () => {
    const res = await request('POST', '/api/patients', {
      firstName: '',
      lastName: '',
      ssn: 'invalid',
      dateOfBirth: 'not-a-date',
      gender: 'invalid',
    });

    assert.strictEqual(res.status, 400);
  });

  it('should list patients', async () => {
    await request('POST', '/api/patients', {
      firstName: 'List',
      lastName: 'Test',
      ssn: '111-22-3333',
      dateOfBirth: '1990-01-01',
      gender: 'male',
    });

    const res = await request('GET', '/api/patients');
    assert.strictEqual(res.status, 200);
    assert.ok(Array.isArray(res.body.data));
  });
});
