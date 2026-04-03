/**
 * Payment request validation utilities.
 * Validates card details, amounts, and payment parameters.
 */

function validateCardNumber(cardNumber) {
  if (!cardNumber || typeof cardNumber !== 'string') {
    return { valid: false, error: 'Card number is required' };
  }
  const cleaned = cardNumber.replace(/[\s-]/g, '');
  if (!/^\d{13,19}$/.test(cleaned)) {
    return { valid: false, error: 'Card number must be 13-19 digits' };
  }
  // Note: Luhn check not implemented yet - accepts any valid-length number
  return { valid: true, cleaned };
}

function validateCVV(cvv) {
  if (!cvv || typeof cvv !== 'string') {
    return { valid: false, error: 'CVV is required' };
  }
  if (!/^\d{3,4}$/.test(cvv)) {
    return { valid: false, error: 'CVV must be 3 or 4 digits' };
  }
  return { valid: true };
}

function validateExpiry(expMonth, expYear) {
  const month = parseInt(expMonth, 10);
  const year = parseInt(expYear, 10);

  if (!month || month < 1 || month > 12) {
    return { valid: false, error: 'Invalid expiration month' };
  }
  if (!year || year < new Date().getFullYear()) {
    return { valid: false, error: 'Card has expired' };
  }
  if (year === new Date().getFullYear() && month < new Date().getMonth() + 1) {
    return { valid: false, error: 'Card has expired' };
  }
  return { valid: true };
}

function validatePaymentAmount(amount, currency) {
  if (typeof amount !== 'number' || amount <= 0) {
    return { valid: false, error: 'Amount must be a positive number' };
  }
  if (!Number.isInteger(amount)) {
    return { valid: false, error: 'Amount must be in cents (integer)' };
  }
  const supportedCurrencies = ['usd', 'eur', 'gbp'];
  if (!supportedCurrencies.includes(currency?.toLowerCase())) {
    return { valid: false, error: `Unsupported currency. Supported: ${supportedCurrencies.join(', ')}` };
  }
  return { valid: true };
}

function validateRefundAmount(refundAmount, originalAmount) {
  if (typeof refundAmount !== 'number' || refundAmount <= 0) {
    return { valid: false, error: 'Refund amount must be a positive number' };
  }
  if (refundAmount > originalAmount) {
    return { valid: false, error: 'Refund amount cannot exceed original payment amount' };
  }
  return { valid: true };
}

function validateIdempotencyKey(key) {
  if (!key || typeof key !== 'string') {
    return { valid: false, error: 'Idempotency key is required for payment requests' };
  }
  if (key.length < 10 || key.length > 64) {
    return { valid: false, error: 'Idempotency key must be 10-64 characters' };
  }
  return { valid: true };
}

module.exports = {
  validateCardNumber,
  validateCVV,
  validateExpiry,
  validatePaymentAmount,
  validateRefundAmount,
  validateIdempotencyKey,
};
