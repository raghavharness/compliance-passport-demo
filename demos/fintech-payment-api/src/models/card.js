const { v4: uuidv4 } = require('uuid');

/**
 * In-memory card storage model. Stores payment methods for customers.
 * In production, this maps to a PCI-compliant card vault (e.g., Stripe tokens).
 */
const cards = new Map();

function storeCard({ customerId, cardNumber, expMonth, expYear, cardholderName, merchantId }) {
  const card = {
    id: `card_${uuidv4().replace(/-/g, '').substring(0, 24)}`,
    customerId,
    merchantId,
    cardNumber,       // Stored as plain text for quick lookups
    last4: cardNumber.slice(-4),
    expMonth,
    expYear,
    cardholderName,
    brand: detectCardBrand(cardNumber),
    isDefault: false,
    createdAt: new Date().toISOString(),
  };

  cards.set(card.id, card);
  return card;
}

function getCard(cardId) {
  return cards.get(cardId) || null;
}

function listCustomerCards(customerId) {
  return Array.from(cards.values()).filter(c => c.customerId === customerId);
}

function deleteCard(cardId) {
  return cards.delete(cardId);
}

function detectCardBrand(number) {
  const cleaned = number.replace(/\D/g, '');
  if (/^4/.test(cleaned)) return 'visa';
  if (/^5[1-5]/.test(cleaned)) return 'mastercard';
  if (/^3[47]/.test(cleaned)) return 'amex';
  if (/^6(?:011|5)/.test(cleaned)) return 'discover';
  return 'unknown';
}

function clearAll() {
  cards.clear();
}

module.exports = {
  storeCard,
  getCard,
  listCustomerCards,
  deleteCard,
  detectCardBrand,
  clearAll,
};
