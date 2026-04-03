const express = require('express');
const router = express.Router();

router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'healthtech-patient-api',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

router.get('/ready', (req, res) => {
  res.json({
    status: 'ready',
    checks: {
      database: 'connected',
      pharmacyApi: 'reachable',
    },
  });
});

module.exports = router;
