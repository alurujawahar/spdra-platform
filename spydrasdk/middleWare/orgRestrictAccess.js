const logger = require('../logger')(module)
const { READ_ACCESS, WRITE_ACCESS, DELETE_ACCESS, ALL_ACCESS } = require("../utils/ErrorMessages.js");
const AssetType = require('../models/AssetType')
const AssetAccess = require('../models/AssetPermission')
const { READ, CREATE, UPDATE, DELETE, ALL, NONE } = require('../utils/Constants')

const checkOrgAccess = async (req, res, next) => {
    try {

        let orgId = req.jwtInfo.orgId
        logger.info({ userInfo: req.jwtInfo, method: 'checkOrgAccess~~~->' + req.method })
        let assetType = req.query.assetType || req.body.assetType
        logger.info({ userInfo: req.jwtInfo, method: 'assetType---->' + assetType })
        let objAssetType = await AssetType.findOne({ assetType: assetType });

        let access
        let roles = ""
        if (objAssetType && Object.keys(objAssetType).length != 0) {

            let objAssetAccess = await AssetAccess.findOne({ assetType: objAssetType.assetType, forOrgId: orgId });
            logger.info({ userInfo: req.jwtInfo, method: 'objAssetAccess~~->' + objAssetAccess })

            if (objAssetAccess && Object.keys(objAssetAccess).length != 0 && objAssetAccess.role != 'ALL') {
                logger.info({ userInfo: req.jwtInfo, method: 'NOT Full Access - ' + objAssetAccess.role + req.method })

                for (let j = 0; j < objAssetAccess.role.length; j++) {
                    if (objAssetAccess.role[j] == 'NONE') {
                        NONE.includes(req.method) ? access = 'NONE' : access = "";
                        break;
                    } else if (objAssetAccess.role[j] == 'READ') {
                        roles = roles + 'READ'
                        if (READ.includes(req.method)) { access = 'READ'; break } else { access = "" }
                    } else if (objAssetAccess.role[j] == 'CREATE') {
                        roles = roles + 'CREATE'
                        if (CREATE.includes(req.method)) { access = 'CREATE'; break } else { access = "" }
                    } else if (objAssetAccess.role[j] == 'UPDATE') {
                        roles = roles + 'UPDATE'
                        if (UPDATE.includes(req.method)) { access = 'UPDATE'; break } else { access = "" }
                    } else if (objAssetAccess.role[j] == 'DELETE') {
                        if (DELETE.includes(req.method)) { access = 'DELETE'; break } else { access = "" }
                    } else if (objAssetAccess.role[j] == 'ALL') {
                        ALL.includes(req.method) ? access = 'ALL' : access = ""
                        break;
                    }
                }
            } else {
                logger.info({ userInfo: req.jwtInfo, method: 'checkOrgAccess', message: 'Full Access provided!!!!!' })
                access = 'FULL'
            }
            if (access == "") {

                logger.info({ userInfo: req.jwtInfo, method: 'checkOrgAccess', message: 'Insufficient Privilages!!' })
                return res.status(404).send({
                    status: false,
                    message: 'Insufficient Privilages!!'
                });
            }
        } else {
            logger.info({ userInfo: req.jwtInfo, method: 'checkOrgAccess', message: 'assetType Not defined.' })
            return res.status(404).send({
                status: false,
                message: "assetType Not defined."
            });
        }
        logger.info({ userInfo: req.jwtInfo, method: 'checkOrgAccess', message: `${access} access provided. ` })
        next();
    } catch (error) {
        logger.error({ userInfo: req.jwtInfo, method: 'checkOrgAccess', message: error.message })
        return res.status(500).send({
            success: false,
            message: 'error - ' + error.message
        });
    }
}

module.exports = {
    checkOrgAccess
}