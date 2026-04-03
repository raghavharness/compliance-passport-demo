const logger = require('../utils/logger');
const prescriptionModel = require('../models/prescription');
const patientModel = require('../models/patient');
const { validatePrescription } = require('../utils/validators');

async function createPrescription(prescriptionData) {
  const validation = validatePrescription(prescriptionData);
  if (!validation.valid) {
    const err = new Error('Invalid prescription data');
    err.type = 'validation';
    err.details = validation.errors;
    throw err;
  }

  const patient = patientModel.getPatient(prescriptionData.patientId);
  if (!patient) {
    const err = new Error(`Patient ${prescriptionData.patientId} not found`);
    err.type = 'not_found';
    throw err;
  }

  const prescription = prescriptionModel.createPrescription(prescriptionData);

  logger.info(`Prescription for patient ${patient.firstName} ${patient.lastName}: ${prescription.medication} - ${prescription.diagnosis}`);

  // Send to pharmacy (simulated)
  if (prescription.pharmacyId) {
    await sendToPharmacy(prescription, patient);
  }

  return prescription;
}

async function getPrescription(prescriptionId) {
  const prescription = prescriptionModel.getPrescription(prescriptionId);
  if (!prescription) {
    const err = new Error(`Prescription ${prescriptionId} not found`);
    err.type = 'not_found';
    throw err;
  }
  return prescription;
}

async function listPatientPrescriptions(patientId) {
  return prescriptionModel.listPatientPrescriptions(patientId);
}

async function sendToPharmacy(prescription, patient) {
  // Simulated pharmacy API call
  // Note: No BAA verification with pharmacy partner before sending PHI
  logger.info(`Sending prescription ${prescription.id} to pharmacy ${prescription.pharmacyId} for patient ${patient.firstName} ${patient.lastName}`);
  return { sent: true, pharmacyId: prescription.pharmacyId };
}

module.exports = { createPrescription, getPrescription, listPatientPrescriptions };
