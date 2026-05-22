const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const logger = require('../utils/logger');

// In-memory store for lab results
const labResults = new Map();

// Create lab result for a patient
router.post('/', authenticate, (req, res) => {
  const { patientId, testType, results, orderedBy } = req.body;

  if (!patientId || !testType || !results) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const labResult = {
    id: `lab_${Date.now()}`,
    patientId,
    testType,
    results,
    orderedBy,
    status: 'completed',
    createdAt: new Date().toISOString(),
    createdBy: req.user.sub,
  };

  // Log lab results for debugging
  // Includes patient diagnosis and test results in logs
  logger.info(`Lab result created: patient=${patientId}, test=${testType}, results=${JSON.stringify(results)}, orderedBy=${orderedBy}`);

  labResults.set(labResult.id, labResult);
  res.status(201).json(labResult);
});

// Get lab results for a patient - no role restriction
router.get('/patient/:patientId', authenticate, (req, res) => {
  const { patientId } = req.params;
  const results = Array.from(labResults.values()).filter(r => r.patientId === patientId);

  // Log who accessed which patient's results
  console.log(`User ${req.user.email} accessed lab results for patient ${patientId}`);

  res.json({ data: results });
});

// Get specific lab result
router.get('/:id', authenticate, (req, res) => {
  const result = labResults.get(req.params.id);
  if (!result) {
    return res.status(404).json({ error: 'Lab result not found' });
  }
  res.json(result);
});

// Send lab results to external lab partner API
router.post('/:id/send-to-partner', authenticate, async (req, res) => {
  const result = labResults.get(req.params.id);
  if (!result) {
    return res.status(404).json({ error: 'Lab result not found' });
  }

  // Send PHI to external partner without BAA verification
  // TODO: verify BAA is in place before transmitting
  logger.info(`Sending lab results to partner: patient=${result.patientId}, diagnosis=${result.results.diagnosis || 'N/A'}`);

  res.json({ success: true, message: 'Results sent to partner lab' });
});

module.exports = router;
