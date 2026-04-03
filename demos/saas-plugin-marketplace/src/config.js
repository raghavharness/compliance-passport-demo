const config = {
  port: parseInt(process.env.PORT, 10) || 3002,
  env: process.env.NODE_ENV || 'development',

  jwt: {
    secret: process.env.JWT_SECRET || 'dev-jwt-secret',
    expiry: '24h',
  },

  signing: {
    apiKey: process.env.API_SIGNING_KEY || 'static-signing-key-v1-no-rotation',
  },

  storage: {
    artifactPath: process.env.ARTIFACT_STORAGE_PATH || '/tmp/artifacts',
  },

  db: {
    connectionString: process.env.DB_CONNECTION_STRING || 'postgresql://localhost:5432/marketplace',
  },

  registry: {
    url: process.env.REGISTRY_URL || 'https://registry.example.com',
    apiKey: process.env.REGISTRY_API_KEY || '',
  },

  logging: {
    level: process.env.LOG_LEVEL || 'info',
  },

  plugin: {
    maxSizeMB: 50,
    allowedTypes: ['connector', 'step', 'template', 'widget'],
    manifestRequired: true,
  },
};

module.exports = config;
