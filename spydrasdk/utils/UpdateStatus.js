const AssetPermission = require('../models/AssetPermission');
const AssetType = require('../models/AssetType');

const logger = require('./../logger')(module);


exports.updateStatus = async (funcName, assetType, onChainStatus  ) => {
    try {
            logger.info({method:'updateStatus', message: funcName + "-" + assetType + "-" + onChainStatus })
            let response
            switch (funcName) {
                case 'CreatePermissions' :
                    response = await AssetPermission.updateOne({ 'assetType': assetType }, { 'status': onChainStatus})
                    break;
                case 'CreateAssetDefinitions' :
                    response = await AssetType.updateOne({ 'assetType': assetType }, { 'status': onChainStatus})
                    break;
                default:
                    throw new Error ('Function name not for offchain update.')    
                }
            logger.info({method:'updateStatus->PostUpdate', message: response.n})
        } catch (error) {
        logger.error({method:'updateStatus', error})
    }
}