const express = require("express");
const router = express.Router();
// const { loadTrialLimits } = require("../middleWare/trialSetup");
const AssetPermissionController = require('../src/handlers/AssetPermissionController');
// const assetTypeController = new AssetTypeController();

router.post("/", AssetPermissionController.addAssetPermission);
router.post("/", AssetPermissionController.updateAssetPermission);
router.get("/", AssetPermissionController.queryAssetPermission);
// router.get("/list", assetController.queryAssets );

module.exports = router;