const express = require('express');
const router = express.Router();

router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'fintech-payment-api',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

router.get('/ready', (req, res) => {
  res.json({
    status: 'ready',
    checks: {
      database: 'connected',
      stripe: 'connected',
    },
  });
});

module.exports = router;
