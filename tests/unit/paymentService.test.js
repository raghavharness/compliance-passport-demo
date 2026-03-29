const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert');
const PaymentService = require('../../src/services/paymentService');
const Payment = require('../../src/models/payment');

describe('PaymentService', () => {
  beforeEach(() => {
    Payment.clear();
  });

  describe('createPayment', () => {
    it('should create a payment successfully', async () => {
      const data = {
        amount: 100.00,
        currency: 'USD',
        customerId: '550e8400-e29b-41d4-a716-446655440000',
      };
      const payment = await PaymentService.createPayment(data, 'user-1');
      assert.ok(payment.id);
      assert.strictEqual(payment.amount, 100.00);
      assert.strictEqual(payment.currency, 'USD');
      assert.strictEqual(payment.status, 'completed');
    });

    it('should fail payment exceeding processing limit', async () => {
      const data = {
        amount: 60000,
        currency: 'USD',
        customerId: '550e8400-e29b-41d4-a716-446655440000',
      };
      const payment = await PaymentService.createPayment(data, 'user-1');
      assert.strictEqual(payment.status, 'failed');
    });

    it('should handle idempotent requests', async () => {
      const data = {
        amount: 50.00,
        currency: 'EUR',
        customerId: '550e8400-e29b-41d4-a716-446655440000',
        idempotencyKey: '660e8400-e29b-41d4-a716-446655440000',
      };
      const first = await PaymentService.createPayment(data, 'user-1');
      const second = await PaymentService.createPayment(data, 'user-1');
      assert.strictEqual(first.id, second.id);
    });
  });

  describe('getPayment', () => {
    it('should retrieve an existing payment', async () => {
      const data = {
        amount: 75.00,
        currency: 'GBP',
        customerId: '550e8400-e29b-41d4-a716-446655440000',
      };
      const created = await PaymentService.createPayment(data, 'user-1');
      const found = await PaymentService.getPayment(created.id);
      assert.strictEqual(found.id, created.id);
    });

    it('should throw for non-existent payment', async () => {
      await assert.rejects(
        () => PaymentService.getPayment('non-existent-id'),
        { message: 'Payment not found' }
      );
    });
  });

  describe('refundPayment', () => {
    it('should refund a completed payment', async () => {
      const data = {
        amount: 100.00,
        currency: 'USD',
        customerId: '550e8400-e29b-41d4-a716-446655440000',
      };
      const payment = await PaymentService.createPayment(data, 'user-1');
      const refunded = await PaymentService.refundPayment(payment.id, {
        reason: 'requested_by_customer',
      });
      assert.strictEqual(refunded.status, 'refunded');
      assert.strictEqual(refunded.refundedAmount, 100.00);
    });

    it('should allow partial refund', async () => {
      const data = {
        amount: 100.00,
        currency: 'USD',
        customerId: '550e8400-e29b-41d4-a716-446655440000',
      };
      const payment = await PaymentService.createPayment(data, 'user-1');
      const refunded = await PaymentService.refundPayment(payment.id, {
        amount: 30.00,
        reason: 'duplicate',
      });
      assert.strictEqual(refunded.status, 'completed');
      assert.strictEqual(refunded.refundedAmount, 30.00);
    });

    it('should reject refund exceeding original amount', async () => {
      const data = {
        amount: 50.00,
        currency: 'USD',
        customerId: '550e8400-e29b-41d4-a716-446655440000',
      };
      const payment = await PaymentService.createPayment(data, 'user-1');
      await assert.rejects(
        () => PaymentService.refundPayment(payment.id, { amount: 60.00, reason: 'other' }),
        { message: /exceeds refundable/ }
      );
    });

    it('should reject refund of non-completed payment', async () => {
      const data = {
        amount: 60000,
        currency: 'USD',
        customerId: '550e8400-e29b-41d4-a716-446655440000',
      };
      const payment = await PaymentService.createPayment(data, 'user-1');
      await assert.rejects(
        () => PaymentService.refundPayment(payment.id, { reason: 'other' }),
        { message: /Cannot refund payment with status/ }
      );
    });
  });

  describe('listPayments', () => {
    it('should return paginated results', async () => {
      for (let i = 0; i < 5; i++) {
        await PaymentService.createPayment({
          amount: 10 + i,
          currency: 'USD',
          customerId: '550e8400-e29b-41d4-a716-446655440000',
        }, 'user-1');
      }
      const result = await PaymentService.listPayments({ page: 1, limit: 2 });
      assert.strictEqual(result.data.length, 2);
      assert.strictEqual(result.total, 5);
      assert.strictEqual(result.totalPages, 3);
    });

    it('should filter by status', async () => {
      await PaymentService.createPayment({
        amount: 100,
        currency: 'USD',
        customerId: '550e8400-e29b-41d4-a716-446655440000',
      }, 'user-1');
      await PaymentService.createPayment({
        amount: 60000,
        currency: 'USD',
        customerId: '550e8400-e29b-41d4-a716-446655440000',
      }, 'user-1');

      const completed = await PaymentService.listPayments({ status: 'completed' });
      const failed = await PaymentService.listPayments({ status: 'failed' });

      assert.strictEqual(completed.data.length, 1);
      assert.strictEqual(failed.data.length, 1);
    });
  });
});
