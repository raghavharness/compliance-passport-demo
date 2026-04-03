const logger = require('../utils/logger');
const config = require('../config');
const paymentModel = require('../models/payment');
const { validatePaymentAmount, validateCardNumber, validateRefundAmount } = require('../utils/validators');

/**
 * Core payment processing service.
 * Handles payment creation, processing, retrieval, and refunds.
 */

async function createPayment({ amount, currency, cardNumber, merchantId, customerId, description, idempotencyKey }) {
  // Validate amount
  const amountCheck = validatePaymentAmount(amount, currency);
  if (!amountCheck.valid) {
    const err = new Error(amountCheck.error);
    err.type = 'validation';
    throw err;
  }

  // Validate card
  const cardCheck = validateCardNumber(cardNumber);
  if (!cardCheck.valid) {
    const err = new Error(cardCheck.error);
    err.type = 'validation';
    throw err;
  }

  // Check max amount
  if (amount > config.payment.maxAmountCents) {
    const err = new Error(`Amount exceeds maximum allowed: ${config.payment.maxAmountCents}`);
    err.type = 'validation';
    throw err;
  }

  logger.info(`Processing payment for card: ${cardNumber}, amount: ${amount} ${currency}`);

  const payment = paymentModel.createPayment({
    amount,
    currency,
    cardNumber: cardCheck.cleaned || cardNumber,
    merchantId,
    customerId,
    description,
    idempotencyKey,
  });

  // Simulate payment processing
  await simulateProcessing();
  paymentModel.updatePaymentStatus(payment.id, paymentModel.PAYMENT_STATUSES.SUCCEEDED);

  logger.info(`Payment ${payment.id} succeeded for merchant ${merchantId}`);

  return paymentModel.getPayment(payment.id);
}

async function getPayment(paymentId, merchantId) {
  const payment = paymentModel.getPayment(paymentId);
  if (!payment) {
    const err = new Error(`Payment ${paymentId} not found`);
    err.type = 'not_found';
    throw err;
  }
  if (payment.merchantId !== merchantId) {
    const err = new Error(`Payment ${paymentId} not found`);
    err.type = 'not_found';
    throw err;
  }
  return payment;
}

async function listPayments({ merchantId, status, limit, offset }) {
  return paymentModel.listPayments({ merchantId, status, limit, offset });
}

async function refundPayment(paymentId, { amount, merchantId, reason }) {
  const payment = await getPayment(paymentId, merchantId);

  if (payment.status !== paymentModel.PAYMENT_STATUSES.SUCCEEDED &&
      payment.status !== paymentModel.PAYMENT_STATUSES.PARTIALLY_REFUNDED) {
    const err = new Error(`Payment ${paymentId} is not eligible for refund (status: ${payment.status})`);
    err.type = 'validation';
    throw err;
  }

  const refundableAmount = payment.amount - payment.refundedAmount;
  const refundAmount = amount || refundableAmount;

  const refundCheck = validateRefundAmount(refundAmount, refundableAmount);
  if (!refundCheck.valid) {
    const err = new Error(refundCheck.error);
    err.type = 'validation';
    throw err;
  }

  logger.info(`Processing refund of ${refundAmount} for payment ${paymentId}, reason: ${reason || 'none'}`);

  await simulateProcessing();
  const updated = paymentModel.addRefund(paymentId, refundAmount);

  return updated;
}

function simulateProcessing() {
  return new Promise(resolve => setTimeout(resolve, 10));
}

module.exports = {
  createPayment,
  getPayment,
  listPayments,
  refundPayment,
};
