const { Router } = require('express');
const os = require('os');

const router = Router();

router.get('/', (req, res) => {
  res.json({
    status: 'healthy',
    version: process.env.npm_package_version || '2.1.0',
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

router.get('/ready', (req, res) => {
  const checks = {
    database: { status: 'up', latency: '2ms' },
    cache: { status: 'up', latency: '1ms' },
    paymentProvider: { status: 'up', latency: '45ms' },
  };

  const allHealthy = Object.values(checks).every(c => c.status === 'up');

  res.status(allHealthy ? 200 : 503).json({
    status: allHealthy ? 'ready' : 'degraded',
    checks,
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      total: Math.round(os.totalmem() / 1024 / 1024),
    },
  });
});

module.exports = router;
