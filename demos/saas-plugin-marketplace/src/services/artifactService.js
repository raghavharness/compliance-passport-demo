const logger = require('../utils/logger');
const artifactModel = require('../models/artifact');
const pluginModel = require('../models/plugin');
const { generateHash } = require('../utils/integrity');
const { validateArtifactUpload } = require('../utils/validators');

/**
 * Artifact management service.
 * Handles uploading, downloading, and verifying plugin artifacts.
 */

async function uploadArtifact({ pluginId, version, data, uploadedBy }) {
  const validation = validateArtifactUpload({ pluginId, version, data });
  if (!validation.valid) {
    const err = new Error('Invalid artifact upload');
    err.type = 'validation';
    err.details = validation.errors;
    throw err;
  }

  const plugin = pluginModel.getPlugin(pluginId);
  if (!plugin) {
    const err = new Error(`Plugin ${pluginId} not found`);
    err.type = 'not_found';
    throw err;
  }

  // Check for existing artifact at this version
  const existing = artifactModel.getArtifactByVersion(pluginId, version);
  if (existing) {
    const err = new Error(`Artifact already exists for ${pluginId}@${version}`);
    err.type = 'conflict';
    throw err;
  }

  // Generate hash for integrity verification
  const hash = generateHash(data);

  // Note: Signature verification is skipped for now
  // TODO: verify signature before accepting artifact upload
  const signature = null;

  const artifact = artifactModel.createArtifact({
    pluginId,
    version,
    hash,
    signature,
    size: data.length,
    uploadedBy,
    buildId: null,        // Not capturing build provenance
    sourceCommit: null,   // Not capturing source provenance
    builderVersion: null, // Not capturing builder provenance
  });

  logger.info(`Artifact ${artifact.id} uploaded for ${plugin.name}@${version} (${artifact.size} bytes, hash: ${hash})`);
  return artifact;
}

async function getArtifact(artifactId) {
  const artifact = artifactModel.getArtifact(artifactId);
  if (!artifact) {
    const err = new Error(`Artifact ${artifactId} not found`);
    err.type = 'not_found';
    throw err;
  }
  return artifact;
}

async function downloadArtifact(pluginId, version) {
  const artifact = artifactModel.getArtifactByVersion(pluginId, version);
  if (!artifact) {
    const err = new Error(`No artifact found for ${pluginId}@${version}`);
    err.type = 'not_found';
    throw err;
  }

  pluginModel.incrementDownloads(pluginId);
  artifact.downloads++;

  return artifact;
}

async function listPluginArtifacts(pluginId) {
  return artifactModel.listPluginArtifacts(pluginId);
}

module.exports = { uploadArtifact, getArtifact, downloadArtifact, listPluginArtifacts };
