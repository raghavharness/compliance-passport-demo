const { describe, it } = require('node:test');
const assert = require('node:assert');
const {
  createPaymentSchema,
  refundPaymentSchema,
  listPaymentsSchema,
} = require('../../src/utils/validators');

describe('Payment Validators', () => {
  describe('createPaymentSchema', () => {
    const validPayment = {
      amount: 99.99,
      currency: 'USD',
      customerId: '550e8400-e29b-41d4-a716-446655440000',
    };

    it('should accept valid payment data', () => {
      const { error } = createPaymentSchema.validate(validPayment);
      assert.strictEqual(error, undefined);
    });

    it('should reject negative amount', () => {
      const { error } = createPaymentSchema.validate({ ...validPayment, amount: -10 });
      assert.ok(error);
    });

    it('should reject amount exceeding maximum', () => {
      const { error } = createPaymentSchema.validate({ ...validPayment, amount: 1000000 });
      assert.ok(error);
    });

    it('should reject invalid currency', () => {
      const { error } = createPaymentSchema.validate({ ...validPayment, currency: 'XYZ' });
      assert.ok(error);
    });

    it('should reject non-UUID customerId', () => {
      const { error } = createPaymentSchema.validate({ ...validPayment, customerId: 'not-a-uuid' });
      assert.ok(error);
    });

    it('should accept optional description', () => {
      const { error } = createPaymentSchema.validate({ ...validPayment, description: 'Test payment' });
      assert.strictEqual(error, undefined);
    });

    it('should reject description exceeding 500 chars', () => {
      const { error } = createPaymentSchema.validate({ ...validPayment, description: 'x'.repeat(501) });
      assert.ok(error);
    });

    it('should accept valid metadata object', () => {
      const { error } = createPaymentSchema.validate({ ...validPayment, metadata: { orderId: '123' } });
      assert.strictEqual(error, undefined);
    });

    it('should require amount field', () => {
      const { currency, customerId } = validPayment;
      const { error } = createPaymentSchema.validate({ currency, customerId });
      assert.ok(error);
    });

    it('should require currency field', () => {
      const { amount, customerId } = validPayment;
      const { error } = createPaymentSchema.validate({ amount, customerId });
      assert.ok(error);
    });
  });

  describe('refundPaymentSchema', () => {
    it('should accept valid refund with reason', () => {
      const { error } = refundPaymentSchema.validate({ reason: 'duplicate' });
      assert.strictEqual(error, undefined);
    });

    it('should accept refund with partial amount', () => {
      const { error } = refundPaymentSchema.validate({ amount: 25.00, reason: 'requested_by_customer' });
      assert.strictEqual(error, undefined);
    });

    it('should reject invalid refund reason', () => {
      const { error } = refundPaymentSchema.validate({ reason: 'because_i_said_so' });
      assert.ok(error);
    });

    it('should require reason field', () => {
      const { error } = refundPaymentSchema.validate({});
      assert.ok(error);
    });
  });

  describe('listPaymentsSchema', () => {
    it('should accept empty query with defaults', () => {
      const { error, value } = listPaymentsSchema.validate({});
      assert.strictEqual(error, undefined);
      assert.strictEqual(value.page, 1);
      assert.strictEqual(value.limit, 20);
    });

    it('should reject page less than 1', () => {
      const { error } = listPaymentsSchema.validate({ page: 0 });
      assert.ok(error);
    });

    it('should reject limit exceeding 100', () => {
      const { error } = listPaymentsSchema.validate({ limit: 101 });
      assert.ok(error);
    });
  });
});
