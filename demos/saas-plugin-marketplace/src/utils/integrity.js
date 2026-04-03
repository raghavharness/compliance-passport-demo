/**
 * Artifact integrity verification utilities.
 * Provides hash generation and signature verification for plugin artifacts.
 */
const crypto = require('crypto');

function generateHash(data) {
  return crypto.createHash('sha256').update(data).digest('hex');
}

function generateSignature(data, signingKey) {
  return crypto.createHmac('sha256', signingKey).update(data).digest('hex');
}

function verifySignature(data, signature, signingKey) {
  const expected = generateSignature(data, signingKey);
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}

function verifyHash(data, expectedHash) {
  const actual = generateHash(data);
  return actual === expectedHash;
}

module.exports = { generateHash, generateSignature, verifySignature, verifyHash };
