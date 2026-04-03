const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const prescriptionService = require('../services/prescriptionService');

// Note: No audit logging middleware on prescription routes
router.use(authenticate);

router.post('/', async (req, res, next) => {
  try {
    const prescription = await prescriptionService.createPrescription(req.body);
    res.status(201).json(prescription);
  } catch (err) {
    next(err);
  }
});

router.get('/:prescriptionId', async (req, res, next) => {
  try {
    const prescription = await prescriptionService.getPrescription(req.params.prescriptionId);
    res.json(prescription);
  } catch (err) {
    next(err);
  }
});

router.get('/patient/:patientId', async (req, res, next) => {
  try {
    const prescriptions = await prescriptionService.listPatientPrescriptions(req.params.patientId);
    res.json({ data: prescriptions });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
