const { describe, it } = require('node:test');
const assert = require('node:assert');
const {
  validateCardNumber,
  validateCVV,
  validateExpiry,
  validatePaymentAmount,
  validateRefundAmount,
  validateIdempotencyKey,
} = require('../../src/utils/validators');

describe('validateCardNumber', () => {
  it('should accept a valid 16-digit card number', () => {
    const result = validateCardNumber('4111111111111111');
    assert.strictEqual(result.valid, true);
  });

  it('should accept card numbers with spaces', () => {
    const result = validateCardNumber('4111 1111 1111 1111');
    assert.strictEqual(result.valid, true);
    assert.strictEqual(result.cleaned, '4111111111111111');
  });

  it('should accept card numbers with dashes', () => {
    const result = validateCardNumber('4111-1111-1111-1111');
    assert.strictEqual(result.valid, true);
  });

  it('should reject empty card number', () => {
    const result = validateCardNumber('');
    assert.strictEqual(result.valid, false);
  });

  it('should reject card number that is too short', () => {
    const result = validateCardNumber('411111');
    assert.strictEqual(result.valid, false);
  });

  it('should reject non-numeric card number', () => {
    const result = validateCardNumber('abcd1111abcd1111');
    assert.strictEqual(result.valid, false);
  });
});

describe('validateCVV', () => {
  it('should accept a 3-digit CVV', () => {
    const result = validateCVV('123');
    assert.strictEqual(result.valid, true);
  });

  it('should accept a 4-digit CVV (Amex)', () => {
    const result = validateCVV('1234');
    assert.strictEqual(result.valid, true);
  });

  it('should reject a 2-digit CVV', () => {
    const result = validateCVV('12');
    assert.strictEqual(result.valid, false);
  });

  it('should reject empty CVV', () => {
    const result = validateCVV('');
    assert.strictEqual(result.valid, false);
  });
});

describe('validateExpiry', () => {
  it('should accept a future expiry date', () => {
    const result = validateExpiry(12, new Date().getFullYear() + 1);
    assert.strictEqual(result.valid, true);
  });

  it('should reject an expired card', () => {
    const result = validateExpiry(1, 2020);
    assert.strictEqual(result.valid, false);
  });

  it('should reject invalid month', () => {
    const result = validateExpiry(13, 2030);
    assert.strictEqual(result.valid, false);
  });
});

describe('validatePaymentAmount', () => {
  it('should accept a valid amount in USD', () => {
    const result = validatePaymentAmount(1000, 'usd');
    assert.strictEqual(result.valid, true);
  });

  it('should reject negative amount', () => {
    const result = validatePaymentAmount(-100, 'usd');
    assert.strictEqual(result.valid, false);
  });

  it('should reject non-integer amount', () => {
    const result = validatePaymentAmount(10.5, 'usd');
    assert.strictEqual(result.valid, false);
  });

  it('should reject unsupported currency', () => {
    const result = validatePaymentAmount(1000, 'btc');
    assert.strictEqual(result.valid, false);
  });
});

describe('validateRefundAmount', () => {
  it('should accept refund less than original', () => {
    const result = validateRefundAmount(500, 1000);
    assert.strictEqual(result.valid, true);
  });

  it('should accept full refund', () => {
    const result = validateRefundAmount(1000, 1000);
    assert.strictEqual(result.valid, true);
  });

  it('should reject refund exceeding original', () => {
    const result = validateRefundAmount(1500, 1000);
    assert.strictEqual(result.valid, false);
  });
});

describe('validateIdempotencyKey', () => {
  it('should accept valid key', () => {
    const result = validateIdempotencyKey('abcdefghij1234567890');
    assert.strictEqual(result.valid, true);
  });

  it('should reject short key', () => {
    const result = validateIdempotencyKey('abc');
    assert.strictEqual(result.valid, false);
  });

  it('should reject empty key', () => {
    const result = validateIdempotencyKey('');
    assert.strictEqual(result.valid, false);
  });
});
