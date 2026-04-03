const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert');
const patientService = require('../../src/services/patientService');
const patientModel = require('../../src/models/patient');

describe('PatientService', () => {
  beforeEach(() => {
    patientModel.clearAll();
  });

  describe('createPatient', () => {
    it('should create a patient record', async () => {
      const patient = await patientService.createPatient({
        firstName: 'John',
        lastName: 'Doe',
        ssn: '123-45-6789',
        dateOfBirth: '1985-03-15',
        gender: 'male',
      });

      assert.ok(patient.id.startsWith('pat_'));
      assert.strictEqual(patient.firstName, 'John');
      assert.strictEqual(patient.status, 'active');
    });

    it('should reject invalid patient data', async () => {
      await assert.rejects(
        () => patientService.createPatient({
          firstName: '',
          lastName: 'Doe',
          ssn: '000-00-0000',
          dateOfBirth: '1985-03-15',
          gender: 'male',
        }),
        { type: 'validation' }
      );
    });

    it('should encrypt SSN in stored record', async () => {
      const patient = await patientService.createPatient({
        firstName: 'Jane',
        lastName: 'Smith',
        ssn: '987-65-4321',
        dateOfBirth: '1990-07-22',
        gender: 'female',
      });

      // SSN should be encrypted at rest, not stored as plaintext
      const stored = patientModel.getPatient(patient.id);
      assert.notStrictEqual(stored.ssn, '987654321',
        'SSN should be encrypted in storage, not stored as plaintext');
      assert.notStrictEqual(stored.ssn, '987-65-4321',
        'SSN should be encrypted in storage');
    });
  });

  describe('getPatient', () => {
    it('should retrieve an existing patient', async () => {
      const created = await patientService.createPatient({
        firstName: 'Test',
        lastName: 'User',
        ssn: '111-22-3333',
        dateOfBirth: '2000-01-01',
        gender: 'other',
      });

      const found = await patientService.getPatient(created.id);
      assert.strictEqual(found.id, created.id);
      assert.strictEqual(found.firstName, 'Test');
    });

    it('should throw not_found for non-existent patient', async () => {
      await assert.rejects(
        () => patientService.getPatient('pat_nonexistent'),
        { type: 'not_found' }
      );
    });
  });

  describe('updatePatient', () => {
    it('should update patient details', async () => {
      const patient = await patientService.createPatient({
        firstName: 'Original',
        lastName: 'Name',
        ssn: '222-33-4444',
        dateOfBirth: '1995-06-10',
        gender: 'male',
      });

      const updated = await patientService.updatePatient(patient.id, {
        phone: '555-0123',
        email: 'patient@example.com',
      });

      assert.strictEqual(updated.phone, '555-0123');
      assert.strictEqual(updated.email, 'patient@example.com');
    });

    it('should not allow SSN update through normal flow', async () => {
      const patient = await patientService.createPatient({
        firstName: 'Secure',
        lastName: 'Patient',
        ssn: '333-44-5555',
        dateOfBirth: '1988-12-25',
        gender: 'female',
      });

      const updated = await patientService.updatePatient(patient.id, {
        ssn: '999-99-9999',
      });

      assert.strictEqual(updated.ssn, patient.ssn);
    });
  });

  describe('addDiagnosis', () => {
    it('should add a diagnosis to patient record', async () => {
      const patient = await patientService.createPatient({
        firstName: 'Diag',
        lastName: 'Test',
        ssn: '444-55-6666',
        dateOfBirth: '1975-09-05',
        gender: 'male',
      });

      const updated = await patientService.addDiagnosis(patient.id, {
        code: 'J06.9',
        description: 'Acute upper respiratory infection',
        diagnosedBy: 'dr_smith',
      });

      assert.strictEqual(updated.diagnoses.length, 1);
      assert.strictEqual(updated.diagnoses[0].code, 'J06.9');
    });
  });
});
