const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const appointmentService = require('../services/appointmentService');

// Note: No audit logging middleware on appointment routes
router.use(authenticate);

router.post('/', async (req, res, next) => {
  try {
    const appointment = await appointmentService.createAppointment(req.body);
    res.status(201).json(appointment);
  } catch (err) {
    next(err);
  }
});

router.get('/:appointmentId', async (req, res, next) => {
  try {
    const appointment = await appointmentService.getAppointment(req.params.appointmentId);
    res.json(appointment);
  } catch (err) {
    next(err);
  }
});

router.get('/patient/:patientId', async (req, res, next) => {
  try {
    const appointments = await appointmentService.listPatientAppointments(req.params.patientId);
    res.json({ data: appointments });
  } catch (err) {
    next(err);
  }
});

router.post('/:appointmentId/cancel', async (req, res, next) => {
  try {
    const appointment = await appointmentService.cancelAppointment(req.params.appointmentId);
    res.json(appointment);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
