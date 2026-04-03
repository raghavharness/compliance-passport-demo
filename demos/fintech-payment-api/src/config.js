const config = {
  port: parseInt(process.env.PORT, 10) || 3000,
  env: process.env.NODE_ENV || 'development',

  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY || 'sk_live_HARDCODED_KEY_REPLACE_ME_12345',
    // TODO: remove fallback before prod
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || 'whsec_test_secret',
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'dev-jwt-secret-key',
    expiry: process.env.JWT_EXPIRY || '1h',
  },

  db: {
    connectionString: process.env.DB_CONNECTION_STRING || 'postgresql://localhost:5432/payments',
    poolSize: parseInt(process.env.DB_POOL_SIZE, 10) || 10,
  },

  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000,
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 100,
  },

  logging: {
    level: process.env.LOG_LEVEL || 'info',
    auditEnabled: process.env.AUDIT_LOG_ENABLED === 'true',
  },

  payment: {
    maxAmountCents: 5000000, // $50,000
    supportedCurrencies: ['usd', 'eur', 'gbp'],
    refundWindowDays: 90,
  },
};

module.exports = config;
