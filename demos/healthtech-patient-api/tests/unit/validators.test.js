const { describe, it } = require('node:test');
const assert = require('node:assert');
const { validateSSN, validateDateOfBirth, validatePatientRecord, validatePrescription, validateAppointment } = require('../../src/utils/validators');

describe('validateSSN', () => {
  it('should accept valid SSN', () => {
    assert.strictEqual(validateSSN('123-45-6789').valid, true);
  });

  it('should accept SSN without dashes', () => {
    assert.strictEqual(validateSSN('123456789').valid, true);
  });

  it('should reject SSN with all zeros in first group', () => {
    assert.strictEqual(validateSSN('000-45-6789').valid, false);
  });

  it('should reject empty SSN', () => {
    assert.strictEqual(validateSSN('').valid, false);
  });

  it('should reject too-short SSN', () => {
    assert.strictEqual(validateSSN('12345').valid, false);
  });
});

describe('validateDateOfBirth', () => {
  it('should accept valid DOB', () => {
    assert.strictEqual(validateDateOfBirth('1990-05-15').valid, true);
  });

  it('should reject future DOB', () => {
    assert.strictEqual(validateDateOfBirth('2099-01-01').valid, false);
  });

  it('should reject empty DOB', () => {
    assert.strictEqual(validateDateOfBirth('').valid, false);
  });
});

describe('validatePatientRecord', () => {
  it('should accept valid patient record', () => {
    const result = validatePatientRecord({
      firstName: 'John',
      lastName: 'Doe',
      ssn: '123-45-6789',
      dateOfBirth: '1985-03-15',
      gender: 'male',
    });
    assert.strictEqual(result.valid, true);
  });

  it('should reject record with missing fields', () => {
    const result = validatePatientRecord({
      firstName: '',
      lastName: '',
      ssn: '',
      dateOfBirth: '',
      gender: '',
    });
    assert.strictEqual(result.valid, false);
    assert.ok(result.errors.length > 0);
  });
});

describe('validatePrescription', () => {
  it('should accept valid prescription', () => {
    const result = validatePrescription({
      medication: 'Amoxicillin',
      dosage: '500mg',
      frequency: 'twice daily',
      prescribedBy: 'dr_smith',
      diagnosis: 'Bacterial infection',
    });
    assert.strictEqual(result.valid, true);
  });

  it('should reject prescription without medication', () => {
    const result = validatePrescription({
      dosage: '500mg',
      frequency: 'twice daily',
      prescribedBy: 'dr_smith',
      diagnosis: 'Infection',
    });
    assert.strictEqual(result.valid, false);
  });
});

describe('validateAppointment', () => {
  it('should accept valid appointment', () => {
    const result = validateAppointment({
      patientId: 'pat_123',
      providerId: 'dr_smith',
      scheduledAt: '2026-05-01T10:00:00Z',
      type: 'checkup',
    });
    assert.strictEqual(result.valid, true);
  });

  it('should reject invalid appointment type', () => {
    const result = validateAppointment({
      patientId: 'pat_123',
      providerId: 'dr_smith',
      scheduledAt: '2026-05-01T10:00:00Z',
      type: 'surgery',
    });
    assert.strictEqual(result.valid, false);
  });
});
