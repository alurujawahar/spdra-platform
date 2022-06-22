const express = require("express");
const router = express.Router();
const { checkOrgAccess } = require("../middleWare/orgRestrictAccess");
const { assignDocType } = require("../middleWare/modifyReqObj");
const AssetController = require('../src/handlers/AssetController');
const assetController = new AssetController();


router.post("/", checkOrgAccess, assignDocType, assetController.addAsset );
// router.get("/", eventController.queryEvent );
// router.get("/list", eventController.queryEvents );


module.exports = router;