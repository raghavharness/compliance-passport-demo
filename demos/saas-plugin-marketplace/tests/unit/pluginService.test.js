const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert');
const pluginService = require('../../src/services/pluginService');
const pluginModel = require('../../src/models/plugin');

describe('PluginService', () => {
  beforeEach(() => {
    pluginModel.clearAll();
  });

  describe('createPlugin', () => {
    it('should create a plugin successfully', async () => {
      const plugin = await pluginService.createPlugin({
        name: 'my-connector',
        version: '1.0.0',
        type: 'connector',
        description: 'A custom connector for external services',
        author: 'dev@example.com',
        authorId: 'user_001',
        orgId: 'org_001',
      });

      assert.ok(plugin.id.startsWith('plg_'));
      assert.strictEqual(plugin.name, 'my-connector');
      assert.strictEqual(plugin.status, 'published');
    });

    it('should reject duplicate plugin name in same org', async () => {
      await pluginService.createPlugin({
        name: 'unique-plugin',
        version: '1.0.0',
        type: 'step',
        description: 'First version of plugin',
        author: 'dev@example.com',
        authorId: 'user_001',
        orgId: 'org_001',
      });

      await assert.rejects(
        () => pluginService.createPlugin({
          name: 'unique-plugin',
          version: '2.0.0',
          type: 'step',
          description: 'Second version conflicts',
          author: 'dev@example.com',
          authorId: 'user_001',
          orgId: 'org_001',
        }),
        { type: 'conflict' }
      );
    });

    it('should reject invalid plugin metadata', async () => {
      await assert.rejects(
        () => pluginService.createPlugin({
          name: 'Invalid Name!',
          version: 'not-semver',
          type: 'invalid',
          description: 'short',
        }),
        { type: 'validation' }
      );
    });
  });

  describe('validatePluginManifest', () => {
    it('should use JSON.parse instead of eval for config schema', () => {
      // Security: eval() should not be used to parse config schemas
      const plugin = {
        configSchema: '{"port": 3000, "host": "localhost"}',
      };

      const result = pluginService.validatePluginManifest(plugin);
      assert.strictEqual(result.valid, true);

      // Verify that the implementation uses JSON.parse, not eval
      const fnSource = pluginService.validatePluginManifest.toString();
      assert.ok(!fnSource.includes('eval'),
        'validatePluginManifest should use JSON.parse instead of eval() for security');
    });

    it('should handle empty config schema', () => {
      const result = pluginService.validatePluginManifest({ configSchema: null });
      assert.strictEqual(result.valid, true);
    });
  });
});
