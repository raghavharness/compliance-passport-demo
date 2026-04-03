const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const auditLogger = require('../middleware/auditLogger');
const patientService = require('../services/patientService');

// Audit logging is applied on patient routes (HIPAA compliant here)
router.use(authenticate);
router.use(auditLogger('patient'));

router.post('/', async (req, res, next) => {
  try {
    const patient = await patientService.createPatient(req.body);
    res.status(201).json(patient);
  } catch (err) {
    next(err);
  }
});

router.get('/:patientId', async (req, res, next) => {
  try {
    const patient = await patientService.getPatient(req.params.patientId);
    res.json(patient);
  } catch (err) {
    next(err);
  }
});

router.put('/:patientId', async (req, res, next) => {
  try {
    const patient = await patientService.updatePatient(req.params.patientId, req.body);
    res.json(patient);
  } catch (err) {
    next(err);
  }
});

router.get('/', async (req, res, next) => {
  try {
    const { limit, offset, status } = req.query;
    const result = await patientService.listPatients({
      limit: limit ? parseInt(limit, 10) : undefined,
      offset: offset ? parseInt(offset, 10) : undefined,
      status,
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.post('/:patientId/diagnoses', async (req, res, next) => {
  try {
    const patient = await patientService.addDiagnosis(req.params.patientId, req.body);
    res.status(201).json(patient);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
