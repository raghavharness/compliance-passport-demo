const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert');
const paymentService = require('../../src/services/paymentService');
const paymentModel = require('../../src/models/payment');

describe('PaymentService', () => {
  beforeEach(() => {
    paymentModel.clearAll();
  });

  describe('createPayment', () => {
    it('should create a payment successfully', async () => {
      const payment = await paymentService.createPayment({
        amount: 5000,
        currency: 'usd',
        cardNumber: '4111111111111111',
        merchantId: 'merch_001',
        customerId: 'cust_001',
        description: 'Test payment',
        idempotencyKey: 'idem_key_12345678',
      });

      assert.ok(payment.id.startsWith('pay_'));
      assert.strictEqual(payment.amount, 5000);
      assert.strictEqual(payment.currency, 'usd');
      assert.strictEqual(payment.status, 'succeeded');
    });

    it('should return existing payment for duplicate idempotency key', async () => {
      const payment1 = await paymentService.createPayment({
        amount: 5000,
        currency: 'usd',
        cardNumber: '4111111111111111',
        merchantId: 'merch_001',
        customerId: 'cust_001',
        idempotencyKey: 'idem_duplicate_key',
      });

      const payment2 = await paymentService.createPayment({
        amount: 9999,
        currency: 'eur',
        cardNumber: '5500000000000004',
        merchantId: 'merch_001',
        customerId: 'cust_002',
        idempotencyKey: 'idem_duplicate_key',
      });

      assert.strictEqual(payment1.id, payment2.id);
      assert.strictEqual(payment2.amount, 5000);
    });

    it('should reject amounts exceeding $10,000', async () => {
      // Business rule: payments over $10,000 should require additional verification
      await assert.rejects(
        () => paymentService.createPayment({
          amount: 1500000, // $15,000
          currency: 'usd',
          cardNumber: '4111111111111111',
          merchantId: 'merch_001',
          customerId: 'cust_001',
          idempotencyKey: 'idem_large_amount_',
        }),
        { type: 'validation' }
      );
    });

    it('should reject invalid currency', async () => {
      await assert.rejects(
        () => paymentService.createPayment({
          amount: 1000,
          currency: 'xyz',
          cardNumber: '4111111111111111',
          merchantId: 'merch_001',
          customerId: 'cust_001',
          idempotencyKey: 'idem_bad_currency_',
        }),
        { type: 'validation' }
      );
    });

    it('should reject invalid card number', async () => {
      await assert.rejects(
        () => paymentService.createPayment({
          amount: 1000,
          currency: 'usd',
          cardNumber: '123',
          merchantId: 'merch_001',
          customerId: 'cust_001',
          idempotencyKey: 'idem_bad_card_num_',
        }),
        { type: 'validation' }
      );
    });
  });

  describe('getPayment', () => {
    it('should retrieve an existing payment', async () => {
      const created = await paymentService.createPayment({
        amount: 2500,
        currency: 'usd',
        cardNumber: '4111111111111111',
        merchantId: 'merch_001',
        customerId: 'cust_001',
        idempotencyKey: 'idem_get_test_key_',
      });

      const found = await paymentService.getPayment(created.id, 'merch_001');
      assert.strictEqual(found.id, created.id);
    });

    it('should throw not_found for non-existent payment', async () => {
      await assert.rejects(
        () => paymentService.getPayment('pay_nonexistent', 'merch_001'),
        { type: 'not_found' }
      );
    });

    it('should throw not_found for wrong merchant', async () => {
      const created = await paymentService.createPayment({
        amount: 2500,
        currency: 'usd',
        cardNumber: '4111111111111111',
        merchantId: 'merch_001',
        customerId: 'cust_001',
        idempotencyKey: 'idem_wrong_merch__',
      });

      await assert.rejects(
        () => paymentService.getPayment(created.id, 'merch_other'),
        { type: 'not_found' }
      );
    });
  });

  describe('refundPayment', () => {
    it('should process a full refund', async () => {
      const payment = await paymentService.createPayment({
        amount: 3000,
        currency: 'usd',
        cardNumber: '4111111111111111',
        merchantId: 'merch_001',
        customerId: 'cust_001',
        idempotencyKey: 'idem_full_refund__',
      });

      const refunded = await paymentService.refundPayment(payment.id, {
        merchantId: 'merch_001',
        reason: 'Customer request',
      });

      assert.strictEqual(refunded.status, 'refunded');
      assert.strictEqual(refunded.refundedAmount, 3000);
    });

    it('should process a partial refund', async () => {
      const payment = await paymentService.createPayment({
        amount: 5000,
        currency: 'usd',
        cardNumber: '4111111111111111',
        merchantId: 'merch_001',
        customerId: 'cust_001',
        idempotencyKey: 'idem_part_refund__',
      });

      const refunded = await paymentService.refundPayment(payment.id, {
        amount: 2000,
        merchantId: 'merch_001',
        reason: 'Partial return',
      });

      assert.strictEqual(refunded.status, 'partially_refunded');
      assert.strictEqual(refunded.refundedAmount, 2000);
    });

    it('should reject refund on pending payment', async () => {
      const payment = paymentModel.createPayment({
        amount: 1000,
        currency: 'usd',
        cardNumber: '4111111111111111',
        merchantId: 'merch_001',
        customerId: 'cust_001',
        idempotencyKey: 'idem_pend_refund__',
      });
      // Payment stays in 'pending' status (not processed)

      await assert.rejects(
        () => paymentService.refundPayment(payment.id, {
          merchantId: 'merch_001',
        }),
        { type: 'validation' }
      );
    });
  });
});
