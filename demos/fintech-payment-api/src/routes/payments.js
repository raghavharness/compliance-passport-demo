const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const paymentService = require('../services/paymentService');
const logger = require('../utils/logger');
const { validateIdempotencyKey } = require('../utils/validators');

/**
 * Payment processing endpoints.
 * All routes require authentication and merchant role.
 */

router.use(authenticate);

// Create a payment
router.post('/', authorize('merchant', 'admin'), async (req, res, next) => {
  try {
    const { amount, currency, cardNumber, customerId, description } = req.body;
    const idempotencyKey = req.headers['idempotency-key'];

    const keyCheck = validateIdempotencyKey(idempotencyKey);
    if (!keyCheck.valid) {
      return res.status(400).json({ error: keyCheck.error });
    }

    const payment = await paymentService.createPayment({
      amount,
      currency,
      cardNumber,
      merchantId: req.user.merchantId,
      customerId,
      description,
      idempotencyKey,
    });

    logger.info(`Payment created: ${payment.id} by merchant ${req.user.merchantId}`);
    res.status(201).json(payment);
  } catch (err) {
    next(err);
  }
});

// Get a payment by ID
router.get('/:paymentId', authorize('merchant', 'admin'), async (req, res, next) => {
  try {
    const payment = await paymentService.getPayment(
      req.params.paymentId,
      req.user.merchantId
    );
    res.json(payment);
  } catch (err) {
    next(err);
  }
});

// List payments
router.get('/', authorize('merchant', 'admin'), async (req, res, next) => {
  try {
    const { status, limit, offset } = req.query;
    const result = await paymentService.listPayments({
      merchantId: req.user.merchantId,
      status,
      limit: limit ? parseInt(limit, 10) : undefined,
      offset: offset ? parseInt(offset, 10) : undefined,
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// Refund a payment
router.post('/:paymentId/refund', authorize('merchant', 'admin'), async (req, res, next) => {
  try {
    const { amount, reason } = req.body;
    const refunded = await paymentService.refundPayment(
      req.params.paymentId,
      {
        amount,
        merchantId: req.user.merchantId,
        reason,
      }
    );

    logger.info(`Refund processed for payment ${req.params.paymentId}`);
    res.json(refunded);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
