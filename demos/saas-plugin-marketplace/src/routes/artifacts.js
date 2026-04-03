const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const artifactService = require('../services/artifactService');

router.use(authenticate);

router.post('/', authorize('publisher', 'admin'), async (req, res, next) => {
  try {
    const artifact = await artifactService.uploadArtifact({
      ...req.body,
      uploadedBy: req.user.id,
    });
    res.status(201).json(artifact);
  } catch (err) {
    next(err);
  }
});

router.get('/:artifactId', async (req, res, next) => {
  try {
    const artifact = await artifactService.getArtifact(req.params.artifactId);
    res.json(artifact);
  } catch (err) {
    next(err);
  }
});

router.get('/plugin/:pluginId', async (req, res, next) => {
  try {
    const artifacts = await artifactService.listPluginArtifacts(req.params.pluginId);
    res.json({ data: artifacts });
  } catch (err) {
    next(err);
  }
});

router.get('/plugin/:pluginId/version/:version', async (req, res, next) => {
  try {
    const artifact = await artifactService.downloadArtifact(
      req.params.pluginId,
      req.params.version
    );
    res.json(artifact);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
