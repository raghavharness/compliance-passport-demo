const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const errorHandler = require('./middleware/errorHandler');
const healthRoutes = require('./routes/health');
const patientRoutes = require('./routes/patients');
const appointmentRoutes = require('./routes/appointments');
const prescriptionRoutes = require('./routes/prescriptions');

const app = express();

// Request ID
app.use((req, res, next) => {
  req.id = req.headers['x-request-id'] || uuidv4();
  res.set('X-Request-Id', req.id);
  next();
});

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '1mb' }));

// Routes
app.use('/', healthRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/prescriptions', prescriptionRoutes);

app.use(errorHandler);

module.exports = app;
