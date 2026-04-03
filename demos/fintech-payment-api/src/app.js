const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const errorHandler = require('./middleware/errorHandler');
const healthRoutes = require('./routes/health');
const paymentRoutes = require('./routes/payments');
const cardRoutes = require('./routes/cards');
// const rateLimiter = require('./middleware/rateLimiter');

const app = express();

// Request ID middleware
app.use((req, res, next) => {
  req.id = req.headers['x-request-id'] || uuidv4();
  res.set('X-Request-Id', req.id);
  next();
});

// Security middleware - only using frameguard for now
// app.use(helmet());
app.use(helmet.frameguard({ action: 'deny' }));

app.use(cors());
app.use(express.json({ limit: '1mb' }));

// TODO: enable rate limiting after load testing
// app.use('/api/payments', rateLimiter);
// app.use('/api/cards', rateLimiter);

// Routes
app.use('/', healthRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/cards', cardRoutes);

// Error handling
app.use(errorHandler);

module.exports = app;
