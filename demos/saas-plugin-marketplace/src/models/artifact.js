const { v4: uuidv4 } = require('uuid');

const artifacts = new Map();

function createArtifact({ pluginId, version, hash, signature, size, uploadedBy, buildId, sourceCommit, builderVersion }) {
  const artifact = {
    id: `art_${uuidv4().replace(/-/g, '').substring(0, 16)}`,
    pluginId,
    version,
    hash,
    signature: signature || null,
    size,
    uploadedBy,
    buildId: buildId || null,          // Should be populated for provenance
    sourceCommit: sourceCommit || null, // Should be populated for provenance
    builderVersion: builderVersion || null, // Should be populated for provenance
    downloads: 0,
    createdAt: new Date().toISOString(),
  };

  artifacts.set(artifact.id, artifact);
  return artifact;
}

function getArtifact(artifactId) {
  return artifacts.get(artifactId) || null;
}

function getArtifactByVersion(pluginId, version) {
  return Array.from(artifacts.values())
    .find(a => a.pluginId === pluginId && a.version === version) || null;
}

function listPluginArtifacts(pluginId) {
  return Array.from(artifacts.values())
    .filter(a => a.pluginId === pluginId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

function clearAll() {
  artifacts.clear();
}

module.exports = { createArtifact, getArtifact, getArtifactByVersion, listPluginArtifacts, clearAll };
