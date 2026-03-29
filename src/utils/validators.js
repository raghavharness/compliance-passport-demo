const Joi = require('joi');

const createPaymentSchema = Joi.object({
  amount: Joi.number().positive().precision(2).max(999999.99).required()
    .messages({ 'number.max': 'Amount cannot exceed 999,999.99' }),
  currency: Joi.string().length(3).uppercase().valid('USD', 'EUR', 'GBP', 'CAD', 'AUD').required(),
  customerId: Joi.string().uuid().required(),
  description: Joi.string().max(500).optional(),
  metadata: Joi.object().optional(),
  idempotencyKey: Joi.string().uuid().optional(),
});

const refundPaymentSchema = Joi.object({
  amount: Joi.number().positive().precision(2).optional(),
  reason: Joi.string().valid('duplicate', 'fraudulent', 'requested_by_customer', 'other').required(),
});

const listPaymentsSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  status: Joi.string().valid('pending', 'completed', 'failed', 'refunded').optional(),
  customerId: Joi.string().uuid().optional(),
  startDate: Joi.date().iso().optional(),
  endDate: Joi.date().iso().min(Joi.ref('startDate')).optional(),
});

function validate(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (error) {
      const details = error.details.map(d => ({
        field: d.path.join('.'),
        message: d.message,
      }));
      return res.status(400).json({ error: 'Validation failed', details });
    }
    req.validatedBody = value;
    next();
  };
}

function validateQuery(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.query, { abortEarly: false, stripUnknown: true });
    if (error) {
      const details = error.details.map(d => ({
        field: d.path.join('.'),
        message: d.message,
      }));
      return res.status(400).json({ error: 'Validation failed', details });
    }
    req.validatedQuery = value;
    next();
  };
}

module.exports = {
  createPaymentSchema,
  refundPaymentSchema,
  listPaymentsSchema,
  validate,
  validateQuery,
};
