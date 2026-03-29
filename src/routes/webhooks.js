const { Router } = require('express');
const crypto = require('crypto');
const config = require('../config');
const logger = require('../utils/logger');

const router = Router();

function verifyWebhookSignature(req, res, next) {
  const signature = req.headers['x-webhook-signature'];
  if (!signature) {
    return res.status(401).json({ error: 'Missing webhook signature' });
  }

  const secret = config.stripe.webhookSecret;
  if (!secret) {
    logger.warn('Webhook secret not configured');
    return res.status(500).json({ error: 'Webhook verification not configured' });
  }

  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(req.body))
    .digest('hex');

  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
    return res.status(401).json({ error: 'Invalid webhook signature' });
  }

  next();
}

router.post('/payment-provider', verifyWebhookSignature, async (req, res) => {
  const event = req.body;

  logger.info('Webhook received', { type: event.type, id: event.id });

  switch (event.type) {
    case 'payment.completed':
      logger.info('Payment completed via webhook', { paymentId: event.data.paymentId });
      break;
    case 'payment.failed':
      logger.warn('Payment failed via webhook', {
        paymentId: event.data.paymentId,
        reason: event.data.reason,
      });
      break;
    case 'refund.completed':
      logger.info('Refund completed via webhook', { paymentId: event.data.paymentId });
      break;
    default:
      logger.warn('Unhandled webhook event type', { type: event.type });
  }

  res.status(200).json({ received: true });
});

module.exports = router;
