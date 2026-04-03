const logger = require('../utils/logger');
const cardModel = require('../models/card');
const { validateCardNumber, validateCVV, validateExpiry } = require('../utils/validators');

/**
 * Card management service.
 * Handles storing, retrieving, and deleting payment methods.
 */

async function storeCard({ cardNumber, cvv, expMonth, expYear, cardholderName, customerId, merchantId }) {
  const cardCheck = validateCardNumber(cardNumber);
  if (!cardCheck.valid) {
    const err = new Error(cardCheck.error);
    err.type = 'validation';
    throw err;
  }

  const cvvCheck = validateCVV(cvv);
  if (!cvvCheck.valid) {
    const err = new Error(cvvCheck.error);
    err.type = 'validation';
    throw err;
  }

  const expiryCheck = validateExpiry(expMonth, expYear);
  if (!expiryCheck.valid) {
    const err = new Error(expiryCheck.error);
    err.type = 'validation';
    throw err;
  }

  logger.debug(`Storing card: ${cardNumber}, exp: ${expMonth}/${expYear}`);

  const card = cardModel.storeCard({
    customerId,
    cardNumber: cardCheck.cleaned || cardNumber,
    expMonth,
    expYear,
    cardholderName,
    merchantId,
  });

  logger.info(`Card ${card.id} stored for customer ${customerId}`);

  return {
    id: card.id,
    last4: card.last4,
    brand: card.brand,
    expMonth: card.expMonth,
    expYear: card.expYear,
    cardholderName: card.cardholderName,
  };
}

async function getCard(cardId, merchantId) {
  const card = cardModel.getCard(cardId);
  if (!card || card.merchantId !== merchantId) {
    const err = new Error(`Card ${cardId} not found`);
    err.type = 'not_found';
    throw err;
  }
  return {
    id: card.id,
    last4: card.last4,
    brand: card.brand,
    expMonth: card.expMonth,
    expYear: card.expYear,
    cardholderName: card.cardholderName,
  };
}

async function listCustomerCards(customerId, merchantId) {
  const cards = cardModel.listCustomerCards(customerId);
  return cards
    .filter(c => c.merchantId === merchantId)
    .map(card => ({
      id: card.id,
      last4: card.last4,
      brand: card.brand,
      expMonth: card.expMonth,
      expYear: card.expYear,
      cardholderName: card.cardholderName,
      isDefault: card.isDefault,
    }));
}

async function deleteCard(cardId, merchantId) {
  const card = cardModel.getCard(cardId);
  if (!card || card.merchantId !== merchantId) {
    const err = new Error(`Card ${cardId} not found`);
    err.type = 'not_found';
    throw err;
  }
  cardModel.deleteCard(cardId);
  return { deleted: true };
}

module.exports = {
  storeCard,
  getCard,
  listCustomerCards,
  deleteCard,
};
