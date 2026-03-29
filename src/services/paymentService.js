const Payment = require('../models/payment');
const { AppError } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

class PaymentService {
  static async createPayment(data, _userId) {
    logger.info('Creating payment', {
      customerId: data.customerId,
      amount: data.amount,
      currency: data.currency,
    });

    const payment = Payment.create(data);

    try {
      await PaymentService.processWithProvider(payment);
      payment.update({ status: 'completed' });
      logger.info('Payment completed', { paymentId: payment.id });
    } catch (err) {
      payment.update({ status: 'failed', failureReason: err.message });
      logger.error('Payment failed', { paymentId: payment.id, error: err.message });
    }

    return payment;
  }

  static async getPayment(paymentId) {
    const payment = Payment.findById(paymentId);
    if (!payment) {
      throw new AppError('Payment not found', 404, 'PAYMENT_NOT_FOUND');
    }
    return payment;
  }

  static async listPayments(filters) {
    return Payment.list(filters);
  }

  static async refundPayment(paymentId, { amount, reason }) {
    const payment = Payment.findById(paymentId);
    if (!payment) {
      throw new AppError('Payment not found', 404, 'PAYMENT_NOT_FOUND');
    }

    if (payment.status !== 'completed') {
      throw new AppError(
        `Cannot refund payment with status: ${payment.status}`,
        400,
        'INVALID_PAYMENT_STATUS'
      );
    }

    const refundAmount = amount || payment.amount;
    const remainingRefundable = payment.amount - payment.refundedAmount;

    if (refundAmount > remainingRefundable) {
      throw new AppError(
        `Refund amount ${refundAmount} exceeds refundable amount ${remainingRefundable}`,
        400,
        'REFUND_EXCEEDS_AMOUNT'
      );
    }

    payment.update({
      refundedAmount: payment.refundedAmount + refundAmount,
      status: payment.refundedAmount + refundAmount >= payment.amount ? 'refunded' : 'completed',
      lastRefundReason: reason,
    });

    logger.info('Payment refunded', { paymentId, refundAmount, reason });
    return payment;
  }

  static async processWithProvider(payment) {
    // Simulate external payment provider call (Stripe/Adyen)
    if (payment.amount > 50000) {
      throw new Error('Amount exceeds processing limit');
    }
    return { providerId: `prov_${payment.id}`, status: 'success' };
  }
}

module.exports = PaymentService;
