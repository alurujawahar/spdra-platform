/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const logger = require("../logger")(module);
const TypeOfAsset = require('../models/AssetType');
exports.getIdFieldForType = async (AssetType) => {
	try {
		logger.info({ method: 'getIdFieldForType', message: "----start----->" + AssetType })
		let objTypeAsset = await TypeOfAsset.findOne({ assetType: AssetType });

		if (objTypeAsset && Object.keys(objTypeAsset).length != 0) {
			logger.info({ method: 'getIdFieldForType', message: "Inside if******" + objTypeAsset.idAttribute })
			return { "SourceId": objTypeAsset.idAttribute }
		} else {
			logger.info({ method: 'getIdFieldForType', message: "Inside else - Default Key - Id" })
			return { "SourceId": 'Id' }
		}
	} catch (error) {
		logger.error({ userInfo: req.jwtInfo, method: 'getIdFieldForType - Error', message: error.message })
		logger.error('getIdFieldForType', error.message)
	}
};


exports.getForiegnKeysForType = async (AssetType) => {
	try {

		logger.info({ method: 'getForiegnKeysForType', message: "----start----->" + AssetType })
		let objRefAsset = await TypeOfAsset.findOne({ assetType: AssetType });
		let references = []

		for (var i in objRefAsset.references) {
			let foriegnKey = objRefAsset.references[i].idAttribute.substr(objRefAsset.references[i].idAttribute.lastIndexOf(".") + 1)
			let section = objRefAsset.references[i].idAttribute.substr(0, objRefAsset.references[i].idAttribute.lastIndexOf("."))
			logger.info({ method: 'objRefAsset.references', message: section + "-" + foriegnKey })
			references.push({
				"section": section,
				"foriegnKey": foriegnKey,
				"assetType": objRefAsset.references[i].typeAttribute,
				"enforceIntegrity": objRefAsset.references[i].enforceIntegrity,
			})
		}
		return references
	} catch (error) {
		logger.error({ userInfo: req.jwtInfo, method: 'getForiegnKeysForType - Error', message: error.message })
		logger.error('getForiegnKeysForType', error)
	}
};