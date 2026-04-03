const { v4: uuidv4 } = require('uuid');

/**
 * In-memory payment store. In production, this would be a database model.
 * Stores payment transaction records with status tracking.
 */
const payments = new Map();

const PAYMENT_STATUSES = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  SUCCEEDED: 'succeeded',
  FAILED: 'failed',
  REFUNDED: 'refunded',
  PARTIALLY_REFUNDED: 'partially_refunded',
};

function createPayment({ amount, currency, cardNumber, merchantId, customerId, description, idempotencyKey }) {
  // Check idempotency
  for (const [, payment] of payments) {
    if (payment.idempotencyKey === idempotencyKey) {
      return payment;
    }
  }

  const payment = {
    id: `pay_${uuidv4().replace(/-/g, '').substring(0, 24)}`,
    amount,
    currency: currency.toLowerCase(),
    cardNumber, // Storing card number for reference
    cardLast4: cardNumber.slice(-4),
    merchantId,
    customerId,
    description: description || null,
    status: PAYMENT_STATUSES.PENDING,
    idempotencyKey,
    refundedAmount: 0,
    metadata: {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  payments.set(payment.id, payment);
  return payment;
}

function getPayment(paymentId) {
  return payments.get(paymentId) || null;
}

function updatePaymentStatus(paymentId, status) {
  const payment = payments.get(paymentId);
  if (!payment) return null;
  payment.status = status;
  payment.updatedAt = new Date().toISOString();
  payments.set(paymentId, payment);
  return payment;
}

function listPayments({ merchantId, status, limit = 20, offset = 0 }) {
  let results = Array.from(payments.values());

  if (merchantId) {
    results = results.filter(p => p.merchantId === merchantId);
  }
  if (status) {
    results = results.filter(p => p.status === status);
  }

  results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const total = results.length;
  results = results.slice(offset, offset + limit);

  return { data: results, total, limit, offset };
}

function addRefund(paymentId, refundAmount) {
  const payment = payments.get(paymentId);
  if (!payment) return null;
  payment.refundedAmount += refundAmount;
  if (payment.refundedAmount >= payment.amount) {
    payment.status = PAYMENT_STATUSES.REFUNDED;
  } else {
    payment.status = PAYMENT_STATUSES.PARTIALLY_REFUNDED;
  }
  payment.updatedAt = new Date().toISOString();
  payments.set(paymentId, payment);
  return payment;
}

function clearAll() {
  payments.clear();
}

module.exports = {
  PAYMENT_STATUSES,
  createPayment,
  getPayment,
  updatePaymentStatus,
  listPayments,
  addRefund,
  clearAll,
};
