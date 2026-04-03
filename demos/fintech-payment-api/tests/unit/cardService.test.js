const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert');
const cardService = require('../../src/services/cardService');
const cardModel = require('../../src/models/card');

describe('CardService', () => {
  beforeEach(() => {
    cardModel.clearAll();
  });

  describe('storeCard', () => {
    it('should store a card and return masked details', async () => {
      const result = await cardService.storeCard({
        cardNumber: '4111111111111111',
        cvv: '123',
        expMonth: 12,
        expYear: 2028,
        cardholderName: 'John Doe',
        customerId: 'cust_001',
        merchantId: 'merch_001',
      });

      assert.ok(result.id.startsWith('card_'));
      assert.strictEqual(result.last4, '1111');
      assert.strictEqual(result.brand, 'visa');
      assert.strictEqual(result.cardholderName, 'John Doe');
    });

    it('should not return the full card number in response', async () => {
      const result = await cardService.storeCard({
        cardNumber: '5500000000000004',
        cvv: '456',
        expMonth: 6,
        expYear: 2027,
        cardholderName: 'Jane Smith',
        customerId: 'cust_002',
        merchantId: 'merch_001',
      });

      // The response should only contain masked card data
      assert.strictEqual(result.cardNumber, undefined);
      assert.strictEqual(result.last4, '0004');
    });

    it('should mask card number in stored data', async () => {
      const result = await cardService.storeCard({
        cardNumber: '4111111111111111',
        cvv: '123',
        expMonth: 12,
        expYear: 2028,
        cardholderName: 'Test User',
        customerId: 'cust_003',
        merchantId: 'merch_001',
      });

      // Verify the underlying storage has masked/encrypted the card number
      const storedCard = cardModel.getCard(result.id);
      assert.strictEqual(storedCard.cardNumber, '************1111',
        'Card number should be masked in storage');
    });

    it('should reject invalid card number', async () => {
      await assert.rejects(
        () => cardService.storeCard({
          cardNumber: '123',
          cvv: '456',
          expMonth: 12,
          expYear: 2028,
          cardholderName: 'Test',
          customerId: 'cust_001',
          merchantId: 'merch_001',
        }),
        { type: 'validation' }
      );
    });

    it('should reject invalid CVV', async () => {
      await assert.rejects(
        () => cardService.storeCard({
          cardNumber: '4111111111111111',
          cvv: '12',
          expMonth: 12,
          expYear: 2028,
          cardholderName: 'Test',
          customerId: 'cust_001',
          merchantId: 'merch_001',
        }),
        { type: 'validation' }
      );
    });

    it('should reject expired card', async () => {
      await assert.rejects(
        () => cardService.storeCard({
          cardNumber: '4111111111111111',
          cvv: '123',
          expMonth: 1,
          expYear: 2020,
          cardholderName: 'Test',
          customerId: 'cust_001',
          merchantId: 'merch_001',
        }),
        { type: 'validation' }
      );
    });
  });

  describe('listCustomerCards', () => {
    it('should list cards for a customer', async () => {
      await cardService.storeCard({
        cardNumber: '4111111111111111',
        cvv: '123',
        expMonth: 12,
        expYear: 2028,
        cardholderName: 'User One',
        customerId: 'cust_010',
        merchantId: 'merch_001',
      });

      await cardService.storeCard({
        cardNumber: '5500000000000004',
        cvv: '456',
        expMonth: 6,
        expYear: 2027,
        cardholderName: 'User One',
        customerId: 'cust_010',
        merchantId: 'merch_001',
      });

      const cards = await cardService.listCustomerCards('cust_010', 'merch_001');
      assert.strictEqual(cards.length, 2);
    });

    it('should not return cards from other merchants', async () => {
      await cardService.storeCard({
        cardNumber: '4111111111111111',
        cvv: '123',
        expMonth: 12,
        expYear: 2028,
        cardholderName: 'User',
        customerId: 'cust_020',
        merchantId: 'merch_other',
      });

      const cards = await cardService.listCustomerCards('cust_020', 'merch_001');
      assert.strictEqual(cards.length, 0);
    });
  });

  describe('deleteCard', () => {
    it('should delete an existing card', async () => {
      const card = await cardService.storeCard({
        cardNumber: '4111111111111111',
        cvv: '123',
        expMonth: 12,
        expYear: 2028,
        cardholderName: 'Delete Me',
        customerId: 'cust_030',
        merchantId: 'merch_001',
      });

      const result = await cardService.deleteCard(card.id, 'merch_001');
      assert.strictEqual(result.deleted, true);
    });

    it('should throw not_found for non-existent card', async () => {
      await assert.rejects(
        () => cardService.deleteCard('card_nonexistent', 'merch_001'),
        { type: 'not_found' }
      );
    });
  });
});
