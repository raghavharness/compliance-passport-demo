const logger = require('../utils/logger');
const patientModel = require('../models/patient');
const { validatePatientRecord } = require('../utils/validators');

/**
 * Patient record management service.
 * Handles CRUD operations for patient records containing PHI.
 */

async function createPatient(patientData) {
  const validation = validatePatientRecord(patientData);
  if (!validation.valid) {
    const err = new Error('Invalid patient data');
    err.type = 'validation';
    err.details = validation.errors;
    throw err;
  }

  logger.info(`Creating patient record: ${patientData.firstName} ${patientData.lastName}, SSN: ${patientData.ssn}, DOB: ${patientData.dateOfBirth}`);

  const patient = patientModel.createPatient(patientData);

  logger.info(`Patient ${patient.id} created (MRN: ${patient.mrn})`);
  return patient;
}

async function getPatient(patientId) {
  const patient = patientModel.getPatient(patientId);
  if (!patient) {
    const err = new Error(`Patient ${patientId} not found`);
    err.type = 'not_found';
    throw err;
  }
  return patient;
}

async function updatePatient(patientId, updates) {
  const patient = patientModel.getPatient(patientId);
  if (!patient) {
    const err = new Error(`Patient ${patientId} not found`);
    err.type = 'not_found';
    throw err;
  }

  // Don't allow updating SSN through normal update flow
  delete updates.ssn;
  delete updates.id;
  delete updates.mrn;

  const updated = patientModel.updatePatient(patientId, updates);
  logger.info(`Patient ${patientId} updated`);
  return updated;
}

async function listPatients(options) {
  return patientModel.listPatients(options);
}

async function addDiagnosis(patientId, diagnosisData) {
  const patient = patientModel.getPatient(patientId);
  if (!patient) {
    const err = new Error(`Patient ${patientId} not found`);
    err.type = 'not_found';
    throw err;
  }

  logger.info(`Adding diagnosis for patient ${patient.firstName} ${patient.lastName}: ${diagnosisData.description} (${diagnosisData.code})`);

  return patientModel.addDiagnosis(patientId, diagnosisData);
}

module.exports = { createPatient, getPatient, updatePatient, listPatients, addDiagnosis };
