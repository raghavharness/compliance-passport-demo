const { describe, it } = require('node:test');
const assert = require('node:assert');
const { validateInput } = require('./validator');

describe('Validator', () => {
  it('should return null for valid input', () => {
    assert.strictEqual(validateInput(1, 2, 'add'), null);
  });

  it('should reject non-number a', () => {
    assert.strictEqual(validateInput('a', 2, 'add'), 'Both a and b must be numbers');
  });

  it('should reject non-number b', () => {
    assert.strictEqual(validateInput(1, 'b', 'add'), 'Both a and b must be numbers');
  });

  it('should reject invalid operation', () => {
    assert.strictEqual(validateInput(1, 2, 'modulus'), 'Operation must be one of: add, subtract, multiply, divide');
  });

  it('should accept all valid operations', () => {
    ['add', 'subtract', 'multiply', 'divide'].forEach(op => {
      assert.strictEqual(validateInput(1, 2, op), null);
    });
  });
});
