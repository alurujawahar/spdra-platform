'use strict';
const { Gateway, Wallets } = require('fabric-network');
const AssetTypeModel = require('../../models/AssetType');
const logger = require('../../logger')(module);
const ASSET_STATUS = require('../../utils/Constants')
const { getContractObject } = require('../../utils/util.js');
const { NETWORK_PARAMETERS, DOCTYPE } = require('../../utils/Constants');


exports.addAssetType = async (req, res, next) => {
    try {

        logger.info({ method: 'addAssetType', message: "addAssetType~~~>" })
        let data = req.body.data;
        let orgId = req.jwtInfo.orgId
        let orgName = "org" + orgId
        let userEmail = req.jwtInfo.userEmail;
        let userId = req.jwtInfo.userId;

        let createdBy = {
            orgId: orgId,
            userEmail: userEmail,
            userId: userId,
        }

        let assetType = new AssetTypeModel({
            appChannelId: data.appChannelId,
            docType: data.docType,
            assetType: data.assetType,
            idAttribute: data.idAttribute,
            isActive: ASSET_STATUS.Active,
            createdBy: createdBy,
            updatedBy: createdBy,
            ownerOrgId: orgId,
            references: data.references
        });

        let response = await assetType.save();
        logger.info({ method: 'addAssetType', message: 'Asset Type added in offchain DB.' })


        const gateway = new Gateway();
        let contract = await getContractObject(orgName, userEmail, NETWORK_PARAMETERS.CHANNEL_NAME, NETWORK_PARAMETERS.CHAINCODE_NAME, gateway)
        let stateTxn = contract.createTransaction('CreateAssetDefinitions');
        await stateTxn.submit(JSON.stringify(data));

        logger.info({ method: 'addAssetType', message: 'Asset Type added in onchain DB.' })

        return res.status(200).send({
            success: true,
            message: "Asset Type added successfully!",
            payload: response
        }
        );

    } catch (error) {
        logger.error({ userInfo: req.jwtInfo }, 'assetType', 'Error in catch block' + error)
        return res.status(500).send({ success: false, message: error.message });
    }
}

exports.updateAssetType = async (req, res, next) => {
    try {

        logger.info({ method: 'updateAssetType', message: "updateAssetType~~~>" })
        let data = req.body.data;
        let orgId = req.jwtInfo.orgId
        let orgName = "org" + orgId
        let userEmail = req.jwtInfo.userEmail;

        let assetType = new AssetTypeModel({
            appChannelId: data.appChannelId,
            docType: data.docType,
            assetType: data.assetType,
            idAttribute: data.idAttribute,
            isActive: ASSET_STATUS.Active,
            createdBy: data.createdBy,
            updatedBy: data.updatedBy,
            ownerOrgId: data.ownerOrgId,
            references: data.references
        });

        let response = await assetType.save();
        logger.info({ method: 'updateAssetType', message: 'Asset Type updated in offchain DB.' })


        const gateway = new Gateway();
        let contract = await getContractObject(orgName, userEmail, NETWORK_PARAMETERS.CHANNEL_NAME, NETWORK_PARAMETERS.CHAINCODE_NAME, gateway)
        let stateTxn = contract.createTransaction('UpdateAssetDefinition');
        await stateTxn.submit(JSON.stringify(data));

        logger.info({ method: 'updateAssetType', message: 'Asset Type updated in onchain DB.' })

        return res.status(200).send({
            success: true,
            message: "Asset Type updated successfully!",
            payload: response
        }
        );

    } catch (error) {
        logger.error({ userInfo: req.jwtInfo }, 'assetType', 'Error in catch block' + error)
        return res.status(500).send({ success: false, message: error.message });
    }
}

exports.queryAssetTypeByKey = async (req, res, next) => {
    try {

        logger.info({ method: 'queryAssetTypeByKey', message: "addAssetType~~~>" })

        let orgId = req.jwtInfo.orgId
        let orgName = "org" + orgId
        let userEmail = req.jwtInfo.userEmail;

        let assetType = req.query.assetType;


        logger.info({ userInfo: req.jwtInfo, method: 'queryAssetTypeByKey' })

        const gateway = new Gateway();
        let contract = await getContractObject(orgName, userEmail, NETWORK_PARAMETERS.CHANNEL_NAME, NETWORK_PARAMETERS.CHAINCODE_NAME, gateway)
        const result = await contract.evaluateTransaction('ReadAssetDefinition', assetType);

        let asset
        if (result.length != 0) {
            asset = JSON.parse(result);
        } else {
            return res.status(500).send({
                status: false,
                message: "No Asset Type Found.",
                payload: {}
            });
        }

        gateway.disconnect();

        return res.status(200).send({
            status: true,
            message: "Asset Type Found!",
            payload: asset
        });

    } catch (error) {
        logger.error({ userInfo: req.jwtInfo, method: 'queryAssetTypeByKey', message: error.message })
        return res.status(500).send({
            status: false,
            message: error.message
        });
    }

}