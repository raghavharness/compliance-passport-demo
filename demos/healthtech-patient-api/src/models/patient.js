const { v4: uuidv4 } = require('uuid');

/**
 * In-memory patient record store.
 * Stores PHI including SSN, DOB, diagnosis, and insurance info.
 */
const patients = new Map();

function createPatient({ firstName, lastName, ssn, dateOfBirth, gender, address, phone, email, insuranceId, primaryPhysician }) {
  const patient = {
    id: `pat_${uuidv4().replace(/-/g, '').substring(0, 16)}`,
    mrn: `MRN-${Date.now().toString(36).toUpperCase()}`,
    firstName,
    lastName,
    ssn,                // Stored as plain text
    dateOfBirth,        // Stored as plain text
    gender,
    address: address || null,
    phone: phone || null,
    email: email || null,
    insuranceId: insuranceId || null,
    primaryPhysician: primaryPhysician || null,
    diagnoses: [],
    allergies: [],
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  patients.set(patient.id, patient);
  return patient;
}

function getPatient(patientId) {
  return patients.get(patientId) || null;
}

function updatePatient(patientId, updates) {
  const patient = patients.get(patientId);
  if (!patient) return null;
  Object.assign(patient, updates, { updatedAt: new Date().toISOString() });
  patients.set(patientId, patient);
  return patient;
}

function listPatients({ limit = 20, offset = 0, status } = {}) {
  let results = Array.from(patients.values());
  if (status) {
    results = results.filter(p => p.status === status);
  }
  results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  return { data: results.slice(offset, offset + limit), total: results.length };
}

function addDiagnosis(patientId, diagnosis) {
  const patient = patients.get(patientId);
  if (!patient) return null;
  patient.diagnoses.push({
    code: diagnosis.code,
    description: diagnosis.description,
    diagnosedAt: diagnosis.diagnosedAt || new Date().toISOString(),
    diagnosedBy: diagnosis.diagnosedBy,
  });
  patient.updatedAt = new Date().toISOString();
  return patient;
}

function clearAll() {
  patients.clear();
}

module.exports = {
  createPatient,
  getPatient,
  updatePatient,
  listPatients,
  addDiagnosis,
  clearAll,
};
