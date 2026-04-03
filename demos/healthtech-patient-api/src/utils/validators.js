/**
 * Validation utilities for patient and medical data.
 */

function validateSSN(ssn) {
  if (!ssn || typeof ssn !== 'string') {
    return { valid: false, error: 'SSN is required' };
  }
  const cleaned = ssn.replace(/[-\s]/g, '');
  if (!/^\d{9}$/.test(cleaned)) {
    return { valid: false, error: 'SSN must be 9 digits' };
  }
  // Basic validity: not all zeros in any group
  if (/^0{3}/.test(cleaned) || /^.{3}0{2}/.test(cleaned) || /0{4}$/.test(cleaned)) {
    return { valid: false, error: 'Invalid SSN format' };
  }
  return { valid: true, cleaned };
}

function validateDateOfBirth(dob) {
  if (!dob) {
    return { valid: false, error: 'Date of birth is required' };
  }
  const date = new Date(dob);
  if (isNaN(date.getTime())) {
    return { valid: false, error: 'Invalid date format' };
  }
  if (date > new Date()) {
    return { valid: false, error: 'Date of birth cannot be in the future' };
  }
  const age = (new Date() - date) / (365.25 * 24 * 60 * 60 * 1000);
  if (age > 150) {
    return { valid: false, error: 'Invalid date of birth' };
  }
  return { valid: true };
}

function validatePatientRecord(record) {
  const errors = [];
  if (!record.firstName || record.firstName.length < 1) {
    errors.push('First name is required');
  }
  if (!record.lastName || record.lastName.length < 1) {
    errors.push('Last name is required');
  }

  const ssnCheck = validateSSN(record.ssn);
  if (!ssnCheck.valid) errors.push(ssnCheck.error);

  const dobCheck = validateDateOfBirth(record.dateOfBirth);
  if (!dobCheck.valid) errors.push(dobCheck.error);

  if (!record.gender || !['male', 'female', 'other', 'prefer_not_to_say'].includes(record.gender)) {
    errors.push('Valid gender is required');
  }

  return errors.length > 0 ? { valid: false, errors } : { valid: true };
}

function validatePrescription(prescription) {
  const errors = [];
  if (!prescription.medication) errors.push('Medication name is required');
  if (!prescription.dosage) errors.push('Dosage is required');
  if (!prescription.frequency) errors.push('Frequency is required');
  if (!prescription.prescribedBy) errors.push('Prescriber is required');
  if (!prescription.diagnosis) errors.push('Diagnosis is required');
  return errors.length > 0 ? { valid: false, errors } : { valid: true };
}

function validateAppointment(appointment) {
  const errors = [];
  if (!appointment.patientId) errors.push('Patient ID is required');
  if (!appointment.providerId) errors.push('Provider ID is required');
  if (!appointment.scheduledAt) errors.push('Scheduled time is required');
  if (!appointment.type || !['checkup', 'followup', 'emergency', 'specialist'].includes(appointment.type)) {
    errors.push('Valid appointment type is required');
  }
  return errors.length > 0 ? { valid: false, errors } : { valid: true };
}

module.exports = {
  validateSSN,
  validateDateOfBirth,
  validatePatientRecord,
  validatePrescription,
  validateAppointment,
};
