const { v4: uuidv4 } = require('uuid');

const installations = new Map();

function createInstallation({ pluginId, pluginVersion, userId, orgId }) {
  const installation = {
    id: `inst_${uuidv4().replace(/-/g, '').substring(0, 16)}`,
    pluginId,
    pluginVersion,
    userId,
    orgId,
    status: 'installed',
    installedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  installations.set(installation.id, installation);
  return installation;
}

function getInstallation(installationId) {
  return installations.get(installationId) || null;
}

function listOrgInstallations(orgId) {
  return Array.from(installations.values())
    .filter(i => i.orgId === orgId)
    .sort((a, b) => new Date(b.installedAt) - new Date(a.installedAt));
}

function uninstall(installationId) {
  const inst = installations.get(installationId);
  if (!inst) return null;
  inst.status = 'uninstalled';
  inst.updatedAt = new Date().toISOString();
  return inst;
}

function clearAll() {
  installations.clear();
}

module.exports = { createInstallation, getInstallation, listOrgInstallations, uninstall, clearAll };
