/**
 * PHI (Protected Health Information) encryption utilities.
 * Uses AES-256-GCM for field-level encryption of sensitive patient data.
 *
 * Fields that should be encrypted:
 * - SSN
 * - Date of Birth
 * - Medical Record Number
 * - Diagnosis codes
 * - Insurance information
 */
const crypto = require('crypto');
const config = require('../config');

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;

function getKey() {
  const key = config.encryption.phiKey;
  if (!key) {
    throw new Error('PHI_ENCRYPTION_KEY must be set for HIPAA compliance');
  }
  return Buffer.from(key, 'hex');
}

function encryptPHI(plaintext) {
  if (!plaintext) return null;
  const key = getKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(String(plaintext), 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag();

  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

function decryptPHI(encryptedString) {
  if (!encryptedString) return null;
  const key = getKey();
  const [ivHex, authTagHex, encrypted] = encryptedString.split(':');

  const decipher = crypto.createDecipheriv(ALGORITHM, key, Buffer.from(ivHex, 'hex'));
  decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));

  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

function maskSSN(ssn) {
  if (!ssn || ssn.length < 4) return '***-**-****';
  return `***-**-${ssn.slice(-4)}`;
}

function maskDOB(dob) {
  if (!dob) return '****-**-**';
  return `****-**-${dob.slice(-2)}`;
}

module.exports = { encryptPHI, decryptPHI, maskSSN, maskDOB };
