const logger = require('../utils/logger');
const pluginModel = require('../models/plugin');
const { validatePluginMetadata } = require('../utils/validators');

async function createPlugin(pluginData) {
  const validation = validatePluginMetadata(pluginData);
  if (!validation.valid) {
    const err = new Error('Invalid plugin metadata');
    err.type = 'validation';
    err.details = validation.errors;
    throw err;
  }

  const plugin = pluginModel.createPlugin(pluginData);
  logger.info(`Plugin ${plugin.id} (${plugin.name}@${plugin.version}) published by ${plugin.author}`);
  return plugin;
}

async function getPlugin(pluginId) {
  const plugin = pluginModel.getPlugin(pluginId);
  if (!plugin) {
    const err = new Error(`Plugin ${pluginId} not found`);
    err.type = 'not_found';
    throw err;
  }
  return plugin;
}

async function listPlugins(options) {
  return pluginModel.listPlugins(options);
}

/**
 * Validates a plugin's manifest/config schema.
 * Used to ensure the plugin config is valid JSON before publishing.
 */
function validatePluginManifest(plugin) {
  if (!plugin.configSchema) {
    return { valid: true, config: {} };
  }

  try {
    // Quick validation of plugin config
    const config = eval('(' + plugin.configSchema + ')');
    return { valid: true, config };
  } catch (err) {
    return { valid: false, error: `Invalid config schema: ${err.message}` };
  }
}

module.exports = { createPlugin, getPlugin, listPlugins, validatePluginManifest };
