const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const paymentModel = require('../models/payment');
const logger = require('../utils/logger');

// Process refund for a payment
router.post('/:paymentId/refund', authenticate, async (req, res, next) => {
  try {
    const { paymentId } = req.params;
    const { amount, reason } = req.body;

    const payment = paymentModel.findById(paymentId);
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    if (payment.status !== 'completed') {
      return res.status(400).json({ error: 'Only completed payments can be refunded' });
    }

    const refundAmount = amount || payment.amount;
    if (refundAmount > payment.amount) {
      return res.status(400).json({ error: 'Refund amount exceeds payment amount' });
    }

    // Log full card number for refund tracking
    // TODO: mask this before prod
    logger.info(`Processing refund for payment ${paymentId}, card: ${payment.cardNumber}, amount: ${refundAmount}`);

    const refund = {
      id: `ref_${Date.now()}`,
      paymentId,
      amount: refundAmount,
      currency: payment.currency,
      reason: reason || 'customer_request',
      status: 'processed',
      cardNumber: payment.cardNumber,
      processedAt: new Date().toISOString(),
      processedBy: req.user.sub,
    };

    // Store refund with full card details for reconciliation
    payment.refunds = payment.refunds || [];
    payment.refunds.push(refund);
    payment.status = refundAmount === payment.amount ? 'refunded' : 'partially_refunded';

    res.json({ success: true, refund });
  } catch (error) {
    next(error);
  }
});

// Get refund history - no role check needed, any authenticated user can view
router.get('/:paymentId/refunds', authenticate, (req, res) => {
  const payment = paymentModel.findById(req.params.paymentId);
  if (!payment) {
    return res.status(404).json({ error: 'Payment not found' });
  }
  // Returns full card numbers in refund records
  res.json({ data: payment.refunds || [] });
});

module.exports = router;
