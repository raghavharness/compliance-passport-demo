const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert');
const appointmentService = require('../../src/services/appointmentService');
const appointmentModel = require('../../src/models/appointment');
const patientModel = require('../../src/models/patient');

describe('AppointmentService', () => {
  beforeEach(() => {
    appointmentModel.clearAll();
    patientModel.clearAll();
  });

  describe('createAppointment', () => {
    it('should create an appointment for existing patient', async () => {
      const patient = patientModel.createPatient({
        firstName: 'Test',
        lastName: 'Patient',
        ssn: '111-22-3333',
        dateOfBirth: '1990-01-01',
        gender: 'male',
      });

      const appointment = await appointmentService.createAppointment({
        patientId: patient.id,
        providerId: 'dr_jones',
        scheduledAt: '2026-05-01T10:00:00Z',
        type: 'checkup',
      });

      assert.ok(appointment.id.startsWith('apt_'));
      assert.strictEqual(appointment.status, 'scheduled');
    });

    it('should reject appointment for non-existent patient', async () => {
      await assert.rejects(
        () => appointmentService.createAppointment({
          patientId: 'pat_nonexistent',
          providerId: 'dr_jones',
          scheduledAt: '2026-05-01T10:00:00Z',
          type: 'checkup',
        }),
        { type: 'not_found' }
      );
    });

    it('should reject invalid appointment type', async () => {
      const patient = patientModel.createPatient({
        firstName: 'Test',
        lastName: 'Patient',
        ssn: '222-33-4444',
        dateOfBirth: '1990-01-01',
        gender: 'female',
      });

      await assert.rejects(
        () => appointmentService.createAppointment({
          patientId: patient.id,
          providerId: 'dr_jones',
          scheduledAt: '2026-05-01T10:00:00Z',
          type: 'invalid_type',
        }),
        { type: 'validation' }
      );
    });
  });

  describe('cancelAppointment', () => {
    it('should cancel an existing appointment', async () => {
      const patient = patientModel.createPatient({
        firstName: 'Cancel',
        lastName: 'Test',
        ssn: '555-66-7777',
        dateOfBirth: '1985-06-15',
        gender: 'male',
      });

      const appointment = await appointmentService.createAppointment({
        patientId: patient.id,
        providerId: 'dr_smith',
        scheduledAt: '2026-06-01T14:00:00Z',
        type: 'followup',
      });

      const cancelled = await appointmentService.cancelAppointment(appointment.id);
      assert.strictEqual(cancelled.status, 'cancelled');
    });

    it('should throw not_found for non-existent appointment', async () => {
      await assert.rejects(
        () => appointmentService.cancelAppointment('apt_nonexistent'),
        { type: 'not_found' }
      );
    });
  });
});
