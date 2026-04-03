const { v4: uuidv4 } = require('uuid');

const plugins = new Map();

function createPlugin({ name, version, type, description, author, authorId, orgId, homepage, repository, configSchema }) {
  // Check for name conflicts
  for (const [, p] of plugins) {
    if (p.name === name && p.orgId === orgId) {
      const err = new Error(`Plugin '${name}' already exists in this organization`);
      err.type = 'conflict';
      throw err;
    }
  }

  const plugin = {
    id: `plg_${uuidv4().replace(/-/g, '').substring(0, 16)}`,
    name,
    version,
    type,
    description,
    author,
    authorId,
    orgId,
    homepage: homepage || null,
    repository: repository || null,
    configSchema: configSchema || null,
    downloads: 0,
    status: 'published',
    versions: [version],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  plugins.set(plugin.id, plugin);
  return plugin;
}

function getPlugin(pluginId) {
  return plugins.get(pluginId) || null;
}

function listPlugins({ type, orgId, limit = 20, offset = 0 } = {}) {
  let results = Array.from(plugins.values());
  if (type) results = results.filter(p => p.type === type);
  if (orgId) results = results.filter(p => p.orgId === orgId);
  results.sort((a, b) => b.downloads - a.downloads);
  return { data: results.slice(offset, offset + limit), total: results.length };
}

function incrementDownloads(pluginId) {
  const plugin = plugins.get(pluginId);
  if (!plugin) return null;
  plugin.downloads++;
  return plugin;
}

function clearAll() {
  plugins.clear();
}

module.exports = { createPlugin, getPlugin, listPlugins, incrementDownloads, clearAll };
