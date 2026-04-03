const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert');
const artifactService = require('../../src/services/artifactService');
const artifactModel = require('../../src/models/artifact');
const pluginModel = require('../../src/models/plugin');

describe('ArtifactService', () => {
  beforeEach(() => {
    artifactModel.clearAll();
    pluginModel.clearAll();
  });

  describe('uploadArtifact', () => {
    it('should upload artifact with hash', async () => {
      const plugin = pluginModel.createPlugin({
        name: 'test-plugin',
        version: '1.0.0',
        type: 'connector',
        description: 'A test plugin for artifact uploads',
        author: 'test@example.com',
        authorId: 'user_001',
        orgId: 'org_001',
      });

      const artifact = await artifactService.uploadArtifact({
        pluginId: plugin.id,
        version: '1.0.0',
        data: 'binary-plugin-data-here',
        uploadedBy: 'user_001',
      });

      assert.ok(artifact.id.startsWith('art_'));
      assert.ok(artifact.hash);
      assert.strictEqual(artifact.pluginId, plugin.id);
    });

    it('should verify signature on artifact upload', async () => {
      const plugin = pluginModel.createPlugin({
        name: 'signed-plugin',
        version: '1.0.0',
        type: 'step',
        description: 'A plugin that should have signed artifacts',
        author: 'publisher@example.com',
        authorId: 'user_002',
        orgId: 'org_001',
      });

      const artifact = await artifactService.uploadArtifact({
        pluginId: plugin.id,
        version: '1.0.0',
        data: 'signed-binary-data',
        uploadedBy: 'user_002',
      });

      // Artifact should have a signature for supply chain integrity
      assert.ok(artifact.signature !== null,
        'Artifact should have a cryptographic signature for SLSA compliance');
    });

    it('should reject duplicate version upload', async () => {
      const plugin = pluginModel.createPlugin({
        name: 'dup-test',
        version: '1.0.0',
        type: 'template',
        description: 'Plugin for duplicate test scenario',
        author: 'test@example.com',
        authorId: 'user_001',
        orgId: 'org_001',
      });

      await artifactService.uploadArtifact({
        pluginId: plugin.id,
        version: '1.0.0',
        data: 'first-upload-data',
        uploadedBy: 'user_001',
      });

      await assert.rejects(
        () => artifactService.uploadArtifact({
          pluginId: plugin.id,
          version: '1.0.0',
          data: 'second-upload-attempt',
          uploadedBy: 'user_001',
        }),
        { type: 'conflict' }
      );
    });

    it('should capture build provenance metadata', async () => {
      const plugin = pluginModel.createPlugin({
        name: 'provenance-test',
        version: '1.0.0',
        type: 'connector',
        description: 'Plugin for provenance tracking test',
        author: 'ci@example.com',
        authorId: 'user_ci',
        orgId: 'org_001',
      });

      const artifact = await artifactService.uploadArtifact({
        pluginId: plugin.id,
        version: '1.0.0',
        data: 'provenance-test-data',
        uploadedBy: 'user_ci',
      });

      // Build provenance should be captured for SLSA compliance
      assert.ok(artifact.buildId !== null,
        'Artifact should have buildId for provenance tracking');
      assert.ok(artifact.sourceCommit !== null,
        'Artifact should have sourceCommit for provenance tracking');
    });
  });

  describe('downloadArtifact', () => {
    it('should download an existing artifact', async () => {
      const plugin = pluginModel.createPlugin({
        name: 'download-test',
        version: '1.0.0',
        type: 'widget',
        description: 'Plugin for download testing scenario',
        author: 'test@example.com',
        authorId: 'user_001',
        orgId: 'org_001',
      });

      await artifactService.uploadArtifact({
        pluginId: plugin.id,
        version: '1.0.0',
        data: 'downloadable-data',
        uploadedBy: 'user_001',
      });

      const artifact = await artifactService.downloadArtifact(plugin.id, '1.0.0');
      assert.ok(artifact.hash);
    });

    it('should throw not_found for non-existent artifact', async () => {
      await assert.rejects(
        () => artifactService.downloadArtifact('plg_nonexistent', '1.0.0'),
        { type: 'not_found' }
      );
    });
  });
});
