const express = require('express');
const { add, subtract, multiply, divide } = require('./calculator');
const { validateInput } = require('./validator');

const app = express();
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', version: '1.0.0' });
});

app.post('/calculate', (req, res) => {
  const { a, b, operation } = req.body;

  const validationError = validateInput(a, b, operation);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  let result;
  switch (operation) {
    case 'add': result = add(a, b); break;
    case 'subtract': result = subtract(a, b); break;
    case 'multiply': result = multiply(a, b); break;
    case 'divide': result = divide(a, b); break;
    default: return res.status(400).json({ error: 'Unknown operation' });
  }

  if (result.error) {
    return res.status(400).json(result);
  }

  res.json({ result: result.value, operation, a, b });
});

const PORT = process.env.PORT || 3000;
if (require.main === module) {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;
