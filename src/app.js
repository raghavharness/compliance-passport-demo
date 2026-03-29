const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const { rateLimit } = require('express-rate-limit');
const config = require('./config');
const { errorHandler } = require('./middleware/errorHandler');
const healthRoutes = require('./routes/health');
const paymentRoutes = require('./routes/payments');
const webhookRoutes = require('./routes/webhooks');
const logger = require('./utils/logger');

const app = express();

app.use(helmet());
app.use(cors({ origin: config.cors.origin }));

app.use(rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
}));

app.use(express.json({ limit: '10kb' }));

app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });
  next();
});

app.use('/health', healthRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/webhooks', webhookRoutes);

app.use((req, res) => {
  res.status(404).json({ error: 'Not Found', path: req.path });
});

app.use(errorHandler);

module.exports = app;
