const { Router } = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const Payment = require('../models/payment');

const router = Router();

router.use(authenticate);
router.use(authorize('admin', 'service'));

router.get('/summary', (req, res) => {
  const payments = Payment.list({ limit: 1000 });
  const data = payments.data;

  const summary = {
    totalTransactions: data.length,
    totalVolume: data.reduce((sum, p) => sum + p.amount, 0),
    byStatus: {},
    byCurrency: {},
    averageAmount: data.length > 0
      ? Math.round((data.reduce((sum, p) => sum + p.amount, 0) / data.length) * 100) / 100
      : 0,
  };

  for (const p of data) {
    summary.byStatus[p.status] = (summary.byStatus[p.status] || 0) + 1;
    summary.byCurrency[p.currency] = (summary.byCurrency[p.currency] || 0) + p.amount;
  }

  res.json({ data: summary });
});

router.get('/volume', (req, res) => {
  const payments = Payment.list({ limit: 1000 });
  const data = payments.data;

  const daily = {};
  for (const p of data) {
    const day = p.createdAt.split('T')[0];
    if (!daily[day]) daily[day] = { count: 0, volume: 0 };
    daily[day].count++;
    daily[day].volume += p.amount;
  }

  res.json({
    data: Object.entries(daily)
      .map(([date, stats]) => ({ date, ...stats }))
      .sort((a, b) => b.date.localeCompare(a.date)),
  });
});

module.exports = router;
