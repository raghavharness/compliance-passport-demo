const { v4: uuidv4 } = require('uuid');

const appointments = new Map();

function createAppointment({ patientId, providerId, scheduledAt, type, notes, department }) {
  const appointment = {
    id: `apt_${uuidv4().replace(/-/g, '').substring(0, 16)}`,
    patientId,
    providerId,
    scheduledAt,
    type,
    notes: notes || null,
    department: department || 'general',
    status: 'scheduled',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  appointments.set(appointment.id, appointment);
  return appointment;
}

function getAppointment(appointmentId) {
  return appointments.get(appointmentId) || null;
}

function listPatientAppointments(patientId) {
  return Array.from(appointments.values())
    .filter(a => a.patientId === patientId)
    .sort((a, b) => new Date(b.scheduledAt) - new Date(a.scheduledAt));
}

function updateAppointmentStatus(appointmentId, status) {
  const apt = appointments.get(appointmentId);
  if (!apt) return null;
  apt.status = status;
  apt.updatedAt = new Date().toISOString();
  return apt;
}

function clearAll() {
  appointments.clear();
}

module.exports = { createAppointment, getAppointment, listPatientAppointments, updateAppointmentStatus, clearAll };
