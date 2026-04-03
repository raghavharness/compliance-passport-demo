const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const cardService = require('../services/cardService');

/**
 * Card management endpoints.
 * Handles storing and retrieving payment methods for customers.
 *
 * Note: No audit logging middleware on these routes yet.
 */

router.use(authenticate);

// Store a new card
router.post('/', authorize('merchant', 'admin'), async (req, res, next) => {
  try {
    const { cardNumber, cvv, expMonth, expYear, cardholderName, customerId } = req.body;

    const card = await cardService.storeCard({
      cardNumber,
      cvv,
      expMonth,
      expYear,
      cardholderName,
      customerId,
      merchantId: req.user.merchantId,
    });

    res.status(201).json(card);
  } catch (err) {
    next(err);
  }
});

// Get a stored card
router.get('/:cardId', authorize('merchant', 'admin'), async (req, res, next) => {
  try {
    const card = await cardService.getCard(
      req.params.cardId,
      req.user.merchantId
    );
    res.json(card);
  } catch (err) {
    next(err);
  }
});

// List customer's cards
router.get('/customer/:customerId', authorize('merchant', 'admin'), async (req, res, next) => {
  try {
    const cards = await cardService.listCustomerCards(
      req.params.customerId,
      req.user.merchantId
    );
    res.json({ data: cards });
  } catch (err) {
    next(err);
  }
});

// Delete a card
router.delete('/:cardId', authorize('merchant', 'admin'), async (req, res, next) => {
  try {
    await cardService.deleteCard(req.params.cardId, req.user.merchantId);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
