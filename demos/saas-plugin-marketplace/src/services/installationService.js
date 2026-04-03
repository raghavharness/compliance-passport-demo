const logger = require('../utils/logger');
const installationModel = require('../models/installation');
const pluginModel = require('../models/plugin');

async function installPlugin({ pluginId, version, userId, orgId }) {
  const plugin = pluginModel.getPlugin(pluginId);
  if (!plugin) {
    const err = new Error(`Plugin ${pluginId} not found`);
    err.type = 'not_found';
    throw err;
  }

  if (version && !plugin.versions.includes(version)) {
    const err = new Error(`Version ${version} not found for plugin ${pluginId}`);
    err.type = 'not_found';
    throw err;
  }

  const installation = installationModel.createInstallation({
    pluginId,
    pluginVersion: version || plugin.version,
    userId,
    orgId,
  });

  pluginModel.incrementDownloads(pluginId);
  logger.info(`Plugin ${plugin.name}@${installation.pluginVersion} installed by ${userId} in org ${orgId}`);
  return installation;
}

async function getInstallation(installationId) {
  const inst = installationModel.getInstallation(installationId);
  if (!inst) {
    const err = new Error(`Installation ${installationId} not found`);
    err.type = 'not_found';
    throw err;
  }
  return inst;
}

async function listOrgInstallations(orgId) {
  return installationModel.listOrgInstallations(orgId);
}

async function uninstallPlugin(installationId) {
  const inst = installationModel.uninstall(installationId);
  if (!inst) {
    const err = new Error(`Installation ${installationId} not found`);
    err.type = 'not_found';
    throw err;
  }
  logger.info(`Plugin installation ${installationId} uninstalled`);
  return inst;
}

module.exports = { installPlugin, getInstallation, listOrgInstallations, uninstallPlugin };
