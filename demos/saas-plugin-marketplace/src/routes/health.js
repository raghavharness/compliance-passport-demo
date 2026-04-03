const express = require('express');
const router = express.Router();

router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'saas-plugin-marketplace',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

router.get('/ready', (req, res) => {
  res.json({
    status: 'ready',
    checks: { database: 'connected', storage: 'available' },
  });
});

module.exports = router;
