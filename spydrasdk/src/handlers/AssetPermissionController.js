'use strict';

const AssetPermissionModel = require('../../models/AssetPermission');
const AssetType = require('../../models/AssetType');
const logger = require('../../logger')(module);
const { NETWORK_PARAMETERS, DOCTYPE } = require('../../utils/Constants');
const { getContractObject } = require('../../utils/util.js');
const { Gateway, Wallets } = require('fabric-network');

exports.addAssetPermission = async (req, res, next) => {
    try {
        let orgId = req.jwtInfo.orgId
        let orgName = "org" + orgId
        let userEmail = req.jwtInfo.userEmail;

        let data = req.body.data;
        logger.info({ method: 'addAssetPermission', message: "addAssetPermission----->", payload: data })

        let objTypeAsset

        await AssetType.findOne({ assetType: data.assetType }).then(result => {
            if (!result) {
                throw new Error('AssetType not found.')
            }

            logger.info({ method: 'addAssetPermission', message: "AssetType available for adding permission - " + result.assetType })
            if (result && Object.keys(result).length != 0) {
                logger.info({ method: 'addAssetPermission', message: `AssetType ${result.assetType} available for adding permission.` })

                if (orgId != result.ownerOrgId) {
                    throw new Error(`User not authorized to add permission for AssetType ${result.assetType}.`)
                }

                objTypeAsset = result
            }
        }).catch(err => {
            logger.error({ method: 'addAssetPermission', message: "Fetching AssetType failed - " + err.message })
            throw new Error('Error fetching AssetType - ' + err.message)
        })

        let response = await AssetPermissionModel.updateOne({ 'assetType': data.assetType }, { 'assetType': objTypeAsset.assetType, 'forOrgId': data.forOrgId, 'ownerOrgId': orgId, 'role': data.role, 'isActive': data.isActive, 'createdAt': data.createdAt, 'createdBy': data.createdBy }, { upsert: true })
        logger.info({ method: 'addAssetPermission', message: "Asset permission added in offchain for - " + objTypeAsset.assetType + ". Response " + response.n })

        const gateway = new Gateway();
        let contract = await getContractObject(orgName, userEmail, NETWORK_PARAMETERS.CHANNEL_NAME, NETWORK_PARAMETERS.CHAINCODE_NAME, gateway)
        let stateTxn = contract.createTransaction('CreatePermissions');
        await stateTxn.submit(JSON.stringify(data));

        logger.info({ method: 'CreatePermissions', message: 'Asset Type permission added in onchain DB.' })

        return res.status(200).send({
            success: true,
            message: "Asset Type Permission added successfully!"
        });

    } catch (error) {
        logger.error({ userInfo: req.jwtInfo, method: 'addAssetPermission', message: 'failed - ' + error.message })
        return res.status(500).send({ success: false, message: "addAssetPermission failed - " + error.message });
    }
}

exports.updateAssetPermission = async (req, res, next) => {
    try {
        let orgId = req.jwtInfo.orgId
        let orgName = "org" + orgId
        let userEmail = req.jwtInfo.userEmail;

        let data = req.body.data;
        logger.info({ method: 'updateAssetPermission', message: "updateAssetPermission----->", payload: data })

        let objTypeAsset

        await AssetType.findOne({ assetType: data.assetType }).then(result => {
            if (!result) {
                throw new Error('AssetType not found.')
            }

            logger.info({ method: 'updateAssetPermission', message: "AssetType available for adding permission - " + result.assetType })
            if (result && Object.keys(result).length != 0) {
                logger.info({ method: 'updateAssetPermission', message: `AssetType ${result.assetType} available for adding permission.` })

                if (orgId != result.ownerOrgId) {
                    throw new Error(`User not authorized to add permission for AssetType ${result.assetType}.`)
                }

                objTypeAsset = result
            }
        }).catch(err => {
            logger.error({ method: 'updateAssetPermission', message: "Fetching AssetType failed - " + err.message })
            throw new Error('Error fetching AssetType - ' + err.message)
        })

        let response = await AssetPermissionModel.updateOne({ 'assetType': data.assetType }, { 'assetType': objTypeAsset.assetType, 'forOrgId': data.forOrgId, 'ownerOrgId': orgId, 'role': data.role, 'isActive': data.isActive, 'createdAt': data.createdAt, 'createdBy': data.createdBy }, { upsert: true })
        logger.info({ method: 'updateAssetPermission', message: "Asset permission updated in offchain for - " + objTypeAsset.assetType + ". Response " + response.n })

        const gateway = new Gateway();
        let contract = await getContractObject(orgName, userEmail, NETWORK_PARAMETERS.CHANNEL_NAME, NETWORK_PARAMETERS.CHAINCODE_NAME, gateway)
        let stateTxn = contract.createTransaction('UpdatePermission');
        await stateTxn.submit(JSON.stringify(data));

        logger.info({ method: 'UpdatePermissions', message: 'Asset Type permission updated in onchain DB.' })

        return res.status(200).send({
            success: true,
            message: "Asset Type Permission updated successfully!"
        });

    } catch (error) {
        logger.error({ userInfo: req.jwtInfo, method: 'updateAssetPermission', message: 'failed - ' + error.message })
        return res.status(500).send({ success: false, message: "updateAssetPermission failed - " + error.message });
    }
}

exports.queryAssetPermission = async (req, res, next) => {
    try {

        logger.info({ method: 'queryAssetPermission', message: "queryAssetPermission~~~>" })

        let orgId = req.query.ownerorgid;
        let orgName = "org" + orgId
        let user = req.query.user;
        let assetType = req.query.assetType;

        logger.info({ userInfo: req.jwtInfo, method: 'queryAssetPermission' })

        const gateway = new Gateway();
        let contract = await getContractObject(orgName, user, NETWORK_PARAMETERS.CHANNEL_NAME, NETWORK_PARAMETERS.CHAINCODE_NAME, gateway)

        const result = await contract.evaluateTransaction('ReadPermission', assetType, orgId);

        let asset
        if (result.length != 0) {
            asset = JSON.parse(result);
        } else {
            return res.status(500).send({
                status: false,
                message: "No permission found for Asset Type.",
                payload: {}
            });
        }

        gateway.disconnect();

        return res.status(200).send({
            status: true,
            message: "Asset Permission Found!",
            payload: asset
        });

    } catch (error) {
        logger.error({ userInfo: req.jwtInfo, method: 'queryAssetPermission', message: error.message })
        return res.status(500).send({
            status: false,
            message: error.message
        });
    }

}