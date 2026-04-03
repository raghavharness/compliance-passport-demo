const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const installationService = require('../services/installationService');

router.use(authenticate);

router.post('/', async (req, res, next) => {
  try {
    const installation = await installationService.installPlugin({
      ...req.body,
      userId: req.user.id,
      orgId: req.user.orgId,
    });
    res.status(201).json(installation);
  } catch (err) {
    next(err);
  }
});

router.get('/', async (req, res, next) => {
  try {
    const installations = await installationService.listOrgInstallations(req.user.orgId);
    res.json({ data: installations });
  } catch (err) {
    next(err);
  }
});

router.delete('/:installationId', async (req, res, next) => {
  try {
    const result = await installationService.uninstallPlugin(req.params.installationId);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
