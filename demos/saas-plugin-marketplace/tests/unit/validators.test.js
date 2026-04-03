const { describe, it } = require('node:test');
const assert = require('node:assert');
const { validatePluginMetadata, validateVersion, validateArtifactUpload } = require('../../src/utils/validators');

describe('validatePluginMetadata', () => {
  it('should accept valid plugin metadata', () => {
    const result = validatePluginMetadata({
      name: 'my-plugin',
      version: '1.0.0',
      type: 'connector',
      description: 'A valid plugin description that is long enough',
      author: 'dev@example.com',
    });
    assert.strictEqual(result.valid, true);
  });

  it('should reject invalid plugin name', () => {
    const result = validatePluginMetadata({
      name: 'Invalid Name!',
      version: '1.0.0',
      type: 'connector',
      description: 'Valid description here',
      author: 'dev@example.com',
    });
    assert.strictEqual(result.valid, false);
  });

  it('should reject invalid semver', () => {
    const result = validatePluginMetadata({
      name: 'valid-name',
      version: 'not-semver',
      type: 'connector',
      description: 'Valid description here',
      author: 'dev@example.com',
    });
    assert.strictEqual(result.valid, false);
  });

  it('should reject invalid plugin type', () => {
    const result = validatePluginMetadata({
      name: 'valid-name',
      version: '1.0.0',
      type: 'invalid',
      description: 'Valid description here',
      author: 'dev@example.com',
    });
    assert.strictEqual(result.valid, false);
  });

  it('should reject short description', () => {
    const result = validatePluginMetadata({
      name: 'valid-name',
      version: '1.0.0',
      type: 'step',
      description: 'Short',
      author: 'dev@example.com',
    });
    assert.strictEqual(result.valid, false);
  });
});

describe('validateVersion', () => {
  it('should accept valid semver', () => {
    assert.strictEqual(validateVersion('1.0.0').valid, true);
    assert.strictEqual(validateVersion('2.3.4-beta.1').valid, true);
  });

  it('should reject invalid version', () => {
    assert.strictEqual(validateVersion('invalid').valid, false);
    assert.strictEqual(validateVersion('').valid, false);
  });
});

describe('validateArtifactUpload', () => {
  it('should accept valid artifact', () => {
    const result = validateArtifactUpload({
      pluginId: 'plg_123',
      version: '1.0.0',
      data: 'some-binary-data',
    });
    assert.strictEqual(result.valid, true);
  });

  it('should reject missing fields', () => {
    const result = validateArtifactUpload({});
    assert.strictEqual(result.valid, false);
    assert.ok(result.errors.length > 0);
  });
});
