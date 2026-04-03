const semver = require('semver');
const config = require('../config');

function validatePluginMetadata(metadata) {
  const errors = [];
  if (!metadata.name || !/^[a-z0-9-]+$/.test(metadata.name)) {
    errors.push('Plugin name must be lowercase alphanumeric with hyphens');
  }
  if (!metadata.version || !semver.valid(metadata.version)) {
    errors.push('Valid semver version is required');
  }
  if (!metadata.type || !config.plugin.allowedTypes.includes(metadata.type)) {
    errors.push(`Plugin type must be one of: ${config.plugin.allowedTypes.join(', ')}`);
  }
  if (!metadata.description || metadata.description.length < 10) {
    errors.push('Description must be at least 10 characters');
  }
  if (!metadata.author) {
    errors.push('Author is required');
  }
  return errors.length > 0 ? { valid: false, errors } : { valid: true };
}

function validateVersion(version) {
  if (!version || !semver.valid(version)) {
    return { valid: false, error: 'Invalid semver version' };
  }
  return { valid: true };
}

function validateArtifactUpload(artifact) {
  const errors = [];
  if (!artifact.pluginId) errors.push('Plugin ID is required');
  if (!artifact.version) errors.push('Version is required');
  if (!artifact.data) errors.push('Artifact data is required');
  if (artifact.data && artifact.data.length > config.plugin.maxSizeMB * 1024 * 1024) {
    errors.push(`Artifact exceeds maximum size of ${config.plugin.maxSizeMB}MB`);
  }
  return errors.length > 0 ? { valid: false, errors } : { valid: true };
}

module.exports = { validatePluginMetadata, validateVersion, validateArtifactUpload };
