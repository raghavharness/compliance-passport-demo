const { v4: uuidv4 } = require('uuid');

const prescriptions = new Map();

function createPrescription({ patientId, medication, dosage, frequency, duration, diagnosis, prescribedBy, pharmacyId }) {
  const prescription = {
    id: `rx_${uuidv4().replace(/-/g, '').substring(0, 16)}`,
    patientId,
    medication,
    dosage,
    frequency,
    duration: duration || '30 days',
    diagnosis,
    prescribedBy,
    pharmacyId: pharmacyId || null,
    status: 'active',
    refillsRemaining: 3,
    dispensedAt: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  prescriptions.set(prescription.id, prescription);
  return prescription;
}

function getPrescription(prescriptionId) {
  return prescriptions.get(prescriptionId) || null;
}

function listPatientPrescriptions(patientId) {
  return Array.from(prescriptions.values())
    .filter(p => p.patientId === patientId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

function clearAll() {
  prescriptions.clear();
}

module.exports = { createPrescription, getPrescription, listPatientPrescriptions, clearAll };
