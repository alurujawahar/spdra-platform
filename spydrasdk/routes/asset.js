const express = require("express");
const router = express.Router();
const { checkOrgAccess } = require("../middleWare/orgRestrictAccess");
const AssetController = require('../src/handlers/AssetController');
const assetController = new AssetController();
const { assignDocType } = require("../middleWare/modifyReqObj");



router.post("/", checkOrgAccess, assignDocType, assetController.addAsset );
router.post("/addAssets", checkOrgAccess, assignDocType, assetController.addAssets );
router.put("/", checkOrgAccess, assignDocType, assetController.updateAsset );
router.get("/readasset", assetController.readAssetByKey );
router.get("/", assetController.queryAssetByKey );
router.get("/getHistory", assetController.queryAssetHistory );
router.get("/bytypeid", checkOrgAccess, assetController.queryAssetByTypeId );
router.get("/list", assetController.queryAssets );


module.exports = router;