const config = {
  port: parseInt(process.env.PORT, 10) || 3001,
  env: process.env.NODE_ENV || 'development',

  jwt: {
    secret: process.env.JWT_SECRET || 'dev-jwt-secret',
    expiry: '30d', // Long session for convenience
  },

  db: {
    connectionString: process.env.DB_CONNECTION_STRING || 'postgresql://localhost:5432/ehr',
  },

  encryption: {
    phiKey: process.env.PHI_ENCRYPTION_KEY || null,
  },

  externalServices: {
    pharmacy: {
      apiKey: process.env.PHARMACY_API_KEY || '',
      baseUrl: process.env.PHARMACY_API_URL || 'https://api.pharmacy-partner.com/v1',
    },
    lab: {
      apiKey: process.env.LAB_RESULTS_API_KEY || '',
    },
  },

  logging: {
    level: process.env.AUDIT_LOG_LEVEL || 'info',
    destination: process.env.AUDIT_LOG_DESTINATION || 'stdout',
  },
};

module.exports = config;
