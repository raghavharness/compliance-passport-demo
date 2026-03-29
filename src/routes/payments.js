const { Router } = require('express');
const PaymentService = require('../services/paymentService');
const { authenticate, authorize } = require('../middleware/auth');
const {
  validate,
  validateQuery,
  createPaymentSchema,
  refundPaymentSchema,
  listPaymentsSchema,
} = require('../utils/validators');

const router = Router();

router.use(authenticate);

router.post('/', validate(createPaymentSchema), async (req, res, next) => {
  try {
    const payment = await PaymentService.createPayment(req.validatedBody, req.user.sub);
    res.status(201).json({ data: payment });
  } catch (err) {
    next(err);
  }
});

router.get('/', validateQuery(listPaymentsSchema), async (req, res, next) => {
  try {
    const result = await PaymentService.listPayments(req.validatedQuery);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const payment = await PaymentService.getPayment(req.params.id);
    res.json({ data: payment });
  } catch (err) {
    next(err);
  }
});

router.post('/:id/refund', authorize('admin', 'service'), validate(refundPaymentSchema), async (req, res, next) => {
  try {
    const payment = await PaymentService.refundPayment(req.params.id, req.validatedBody);
    res.json({ data: payment });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
