const { v4: uuidv4 } = require('uuid');

// In-memory store (PostgreSQL adapter in production)
const payments = new Map();

class Payment {
  constructor({ amount, currency, customerId, description, metadata, idempotencyKey }) {
    this.id = uuidv4();
    this.amount = amount;
    this.currency = currency;
    this.customerId = customerId;
    this.description = description || null;
    this.metadata = metadata || {};
    this.idempotencyKey = idempotencyKey || null;
    this.status = 'pending';
    this.refundedAmount = 0;
    this.createdAt = new Date().toISOString();
    this.updatedAt = new Date().toISOString();
  }

  static create(data) {
    if (data.idempotencyKey) {
      for (const [, payment] of payments) {
        if (payment.idempotencyKey === data.idempotencyKey) {
          return payment;
        }
      }
    }

    const payment = new Payment(data);
    payments.set(payment.id, payment);
    return payment;
  }

  static findById(id) {
    return payments.get(id) || null;
  }

  static list({ page = 1, limit = 20, status, customerId, startDate, endDate } = {}) {
    let results = [...payments.values()];

    if (status) results = results.filter(p => p.status === status);
    if (customerId) results = results.filter(p => p.customerId === customerId);
    if (startDate) results = results.filter(p => new Date(p.createdAt) >= new Date(startDate));
    if (endDate) results = results.filter(p => new Date(p.createdAt) <= new Date(endDate));

    results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const total = results.length;
    const offset = (page - 1) * limit;
    results = results.slice(offset, offset + limit);

    return { data: results, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  update(data) {
    Object.assign(this, data, { updatedAt: new Date().toISOString() });
    payments.set(this.id, this);
    return this;
  }

  static clear() {
    payments.clear();
  }
}

module.exports = Payment;
