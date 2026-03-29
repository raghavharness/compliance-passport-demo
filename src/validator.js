function validateInput(a, b, operation) {
  if (typeof a !== 'number' || typeof b !== 'number') {
    return 'Both a and b must be numbers';
  }
  if (!['add', 'subtract', 'multiply', 'divide'].includes(operation)) {
    return 'Operation must be one of: add, subtract, multiply, divide';
  }
  return null;
}

module.exports = { validateInput };
