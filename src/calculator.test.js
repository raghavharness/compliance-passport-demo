const { describe, it } = require('node:test');
const assert = require('node:assert');
const { add, subtract, multiply, divide } = require('./calculator');

describe('Calculator', () => {
  describe('add', () => {
    it('should add two positive numbers', () => {
      assert.deepStrictEqual(add(2, 3), { value: 5 });
    });
    it('should handle negative numbers', () => {
      assert.deepStrictEqual(add(-1, -2), { value: -3 });
    });
    it('should handle zero', () => {
      assert.deepStrictEqual(add(0, 5), { value: 5 });
    });
  });

  describe('subtract', () => {
    it('should subtract two numbers', () => {
      assert.deepStrictEqual(subtract(10, 4), { value: 6 });
    });
    it('should handle negative results', () => {
      assert.deepStrictEqual(subtract(3, 7), { value: -4 });
    });
  });

  describe('multiply', () => {
    it('should multiply two numbers', () => {
      assert.deepStrictEqual(multiply(3, 4), { value: 12 });
    });
    it('should handle zero', () => {
      assert.deepStrictEqual(multiply(5, 0), { value: 0 });
    });
  });

  describe('divide', () => {
    it('should divide two numbers', () => {
      assert.deepStrictEqual(divide(10, 2), { value: 5 });
    });
    it('should return error for division by zero', () => {
      assert.deepStrictEqual(divide(10, 0), { error: 'Division by zero' });
    });
    it('should handle decimal results', () => {
      assert.deepStrictEqual(divide(7, 2), { value: 3.5 });
    });
  });
});
