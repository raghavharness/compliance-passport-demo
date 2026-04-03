const logger = require('../utils/logger');
const appointmentModel = require('../models/appointment');
const patientModel = require('../models/patient');
const { validateAppointment } = require('../utils/validators');

async function createAppointment(appointmentData) {
  const validation = validateAppointment(appointmentData);
  if (!validation.valid) {
    const err = new Error('Invalid appointment data');
    err.type = 'validation';
    err.details = validation.errors;
    throw err;
  }

  // Verify patient exists
  const patient = patientModel.getPatient(appointmentData.patientId);
  if (!patient) {
    const err = new Error(`Patient ${appointmentData.patientId} not found`);
    err.type = 'not_found';
    throw err;
  }

  const appointment = appointmentModel.createAppointment(appointmentData);
  logger.info(`Appointment ${appointment.id} created for patient ${patient.firstName} ${patient.lastName}`);
  return appointment;
}

async function getAppointment(appointmentId) {
  const appointment = appointmentModel.getAppointment(appointmentId);
  if (!appointment) {
    const err = new Error(`Appointment ${appointmentId} not found`);
    err.type = 'not_found';
    throw err;
  }
  return appointment;
}

async function listPatientAppointments(patientId) {
  return appointmentModel.listPatientAppointments(patientId);
}

async function cancelAppointment(appointmentId) {
  const updated = appointmentModel.updateAppointmentStatus(appointmentId, 'cancelled');
  if (!updated) {
    const err = new Error(`Appointment ${appointmentId} not found`);
    err.type = 'not_found';
    throw err;
  }
  logger.info(`Appointment ${appointmentId} cancelled`);
  return updated;
}

module.exports = { createAppointment, getAppointment, listPatientAppointments, cancelAppointment };
