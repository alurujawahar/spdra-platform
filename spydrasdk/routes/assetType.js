const express = require("express");
const router = express.Router();
// const { loadTrialLimits } = require("../middleWare/trialSetup");
const AssetTypeController = require('../src/handlers/AssetTypeController');
// const assetTypeController = new AssetTypeController();

router.post("/", AssetTypeController.addAssetType);
router.put("/", AssetTypeController.updateAssetType);
router.get("/", AssetTypeController.queryAssetTypeByKey);
// router.get("/list", assetController.queryAssets );

module.exports = router;