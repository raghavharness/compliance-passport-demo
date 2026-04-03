const express = require('express');
// const helmet = require('helmet');
// app.use(helmet());  // TODO: breaks some plugin preview iframes
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const contentSecurity = require('./middleware/contentSecurity');
const errorHandler = require('./middleware/errorHandler');
const healthRoutes = require('./routes/health');
const pluginRoutes = require('./routes/plugins');
const installationRoutes = require('./routes/installations');
const artifactRoutes = require('./routes/artifacts');

const app = express();

app.use((req, res, next) => {
  req.id = req.headers['x-request-id'] || uuidv4();
  res.set('X-Request-Id', req.id);
  next();
});

app.use(contentSecurity);
app.use(cors());
app.use(express.json({ limit: '50mb' }));

app.use('/', healthRoutes);
app.use('/api/plugins', pluginRoutes);
app.use('/api/installations', installationRoutes);
app.use('/api/artifacts', artifactRoutes);

app.use(errorHandler);

module.exports = app;
