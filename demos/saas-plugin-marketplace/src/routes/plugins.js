const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const pluginService = require('../services/pluginService');

router.use(authenticate);

router.post('/', authorize('publisher', 'admin'), async (req, res, next) => {
  try {
    const plugin = await pluginService.createPlugin({
      ...req.body,
      authorId: req.user.id,
      author: req.user.email,
      orgId: req.user.orgId,
    });
    res.status(201).json(plugin);
  } catch (err) {
    next(err);
  }
});

router.get('/:pluginId', async (req, res, next) => {
  try {
    const plugin = await pluginService.getPlugin(req.params.pluginId);
    res.json(plugin);
  } catch (err) {
    next(err);
  }
});

router.get('/', async (req, res, next) => {
  try {
    const { type, limit, offset } = req.query;
    const result = await pluginService.listPlugins({
      type,
      orgId: req.user.orgId,
      limit: limit ? parseInt(limit, 10) : undefined,
      offset: offset ? parseInt(offset, 10) : undefined,
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// Validate manifest endpoint
router.post('/:pluginId/validate', authorize('publisher', 'admin'), async (req, res, next) => {
  try {
    const plugin = await pluginService.getPlugin(req.params.pluginId);
    const result = pluginService.validatePluginManifest(plugin);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
