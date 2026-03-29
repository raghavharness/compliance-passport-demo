function add(a, b) {
  return { value: a + b };
}

function subtract(a, b) {
  return { value: a - b };
}

function multiply(a, b) {
  return { value: a * b };
}

function divide(a, b) {
  if (b === 0) {
    return { error: 'Division by zero' };
  }
  return { value: a / b };
}

module.exports = { add, subtract, multiply, divide };
