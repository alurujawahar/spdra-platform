/*
 * Copyright Paramount soft. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Gateway, Wallets } = require('fabric-network');
const path = require('path');
const fs = require('fs');
const { getContractObject } = require('../../utils/util.js');
const { NETWORK_PARAMETERS, DOCTYPE } = require('../../utils/Constants');
const logger = require('../../logger')(module);
const { formatReferences, formatAssetInput } = require('../../utils/FormatStruct');
const AssetType = require('../../models/AssetType')

class AssetController {

	async addAsset(req, res, next) {
		try {
			logger.info({ userInfo: req.jwtInfo, method: 'addAsset' })

			let orgId = req.jwtInfo.orgId
			let orgName = "org" + orgId
			let userEmail = req.jwtInfo.userEmail;

			let properAsset = await formatAssetInput(req.DocType, req.body, orgId);
			logger.info({ method: 'addAsset', message: "properAsset", payload: properAsset })
			logger.info({ message: "*********************************************" })

			const gateway = new Gateway();
			let contract = await getContractObject(orgName, userEmail, NETWORK_PARAMETERS.CHANNEL_NAME, NETWORK_PARAMETERS.CHAINCODE_NAME, gateway)

			let referenceList = await formatReferences(req.body);
			logger.info({ method: 'addAsset', message: "referenceList", payload: referenceList })

			if (referenceList && referenceList.length != 0) {
				properAsset['references'] = referenceList
			}

			logger.info({ method: 'addAsset', message: "Adding asset to onchain after verification -----" })
			let stateTxn = contract.createTransaction('CreateAssets');
			let tx = await stateTxn.submit(JSON.stringify(properAsset));
			logger.info({ method: 'addAsset', message: '********Asset Added: committed*******. ' })
			return res.status(200).send({
				status: true,
				message: "Asset Added Successfully",
				txid: tx.toString()
			});
		} catch (error) {
			logger.error({ userInfo: req.jwtInfo, method: 'addAsset - Error', message: error.message })
			return res.status(500).send({
				status: false,
				message: error.message
			});
		}
	}

	async addAssets(req, res) {
		try {
			logger.info({ userInfo: req.jwtInfo, method: 'addAssets' })
			let orgId = '2'
			let orgName = "org" + orgId
			let user = 'kamal1@spydra.app';
			let assets = [...req.body]
			let properAssets = []

			const gateway = new Gateway();
			let contract = await getContractObject(orgName, user, NETWORK_PARAMETERS.CHANNEL_NAME, NETWORK_PARAMETERS.CHAINCODE_NAME, gateway)

			for (let index = 0; index < assets.length; index++) {
				const asset = assets[index];

				let properAsset = await formatAssetInput(req.DocType, asset, orgId, user);
				let referenceList = await formatReferences(asset);
				properAsset['references'] = referenceList

				properAssets.push(JSON.stringify(properAsset))
			}

			await contract.evaluateTransaction('CreateAssets', ...properAssets);
			let stateTxn = contract.createTransaction('CreateAssets');
			let tx = stateTxn.submit(...properAssets);

			return res.status(200).send({
				status: true,
				message: "Asset Added Successfully",
				txid: tx.toString()
			});
		} catch (error) {
			logger.error({ userInfo: req.jwtInfo, method: 'addAssets - Error', message: error.message })
			return res.status(500).send({
				status: false,
				message: error.message
			});
		}
	}

	async updateAsset(req, res, next) {
		try {
			logger.info({ userInfo: req.jwtInfo, method: 'updateAsset' })

			let orgId = req.jwtInfo.orgId
			let orgName = "org" + orgId
			let userEmail = req.jwtInfo.userEmail;

			let properAsset = await formatAssetInput(req.DocType, req.body, orgId);
			logger.info({ method: 'updateAsset', message: "properAsset", payload: properAsset })
			logger.info({ message: "*********************************************" })

			const gateway = new Gateway();
			let contract = await getContractObject(orgName, userEmail, NETWORK_PARAMETERS.CHANNEL_NAME, NETWORK_PARAMETERS.CHAINCODE_NAME, gateway)

			let referenceList = await formatReferences(req.body);
			logger.info({ method: 'updateAsset', message: "referenceList", payload: referenceList })


			if (referenceList && referenceList.length != 0) {
				logger.info({ method: 'addEvent', message: "Reference Verification DONE." })
				properAsset['references'] = referenceList
			}


			logger.info({ method: 'updateAsset', message: "Adding asset to onchain after verification -----" })
			let stateTxn = contract.createTransaction('UpdateAsset');
			let tx = await stateTxn.submit(JSON.stringify(properAsset));
			logger.info({ method: 'updateAsset', message: '********Asset Added: committed*******. ' })
			return res.status(200).send({
				status: true,
				message: "Asset Updated Successfully",
				txid: tx.toString()
			});
		} catch (error) {
			logger.error({ userInfo: req.jwtInfo, method: 'updateAsset - Error', message: error.message })
			return res.status(500).send({
				status: false,
				message: error.message
			});
		}
	}

	async queryAssetByTypeId(req, res, next) {
		try {
			logger.info({ userInfo: req.jwtInfo, method: 'queryAssetByTypeId' })

			let assetType = req.query.assetType;

			let orgId = req.jwtInfo.orgId
			let orgName = "org" + orgId
			let userEmail = req.jwtInfo.userEmail;


			let assetList, result;

			let objAssetType = await AssetType.findOne({ assetType: assetType });
			let assetId
			if (objAssetType && Object.keys(objAssetType).length != 0) {
				if (req.query.hasOwnProperty(objAssetType.idAttribute)) {
					assetId = req.query[objAssetType.idAttribute];
				} else {
					return res.status(406).send({
						status: false,
						message: "Request not accepted as assetId parameter name not matching."
					});
				}
			} else {
				return res.status(404).send({
					status: false,
					message: "assetType Not defined for " + orgId
				});

			}

			const gateway = new Gateway();
			let contract = await getContractObject(orgName, userEmail, NETWORK_PARAMETERS.CHANNEL_NAME, NETWORK_PARAMETERS.CHAINCODE_NAME, gateway)

			// Todo: Use org id instead org name while creating query string
			let queryString = `{\"selector\":{\"ownerOrgId\": \"${orgId}\", \"assetId\": \"${assetId}\", \"assetType\": \"${assetType}\"}}`

			result = await contract.evaluateTransaction('GetAssetByQueryString', queryString);
			let assetArray = JSON.parse(result.toString());


			if (assetArray.length != 0) {
				assetList = assetArray;
			} else {
				return res.status(404).send({
					status: false,
					message: "No assets available in organizaiton." + orgId
				});
			}

			gateway.disconnect();

			return res.status(200).send({
				status: true,
				message: "Assets records fetched successfully!",
				payload: assetList
			});

		} catch (error) {
			logger.error({ userInfo: req.jwtInfo, method: 'queryAssets', error: error.message })
			return res.status(500).send({
				success: false,
				message: error
			});
		}
	}

	async readAssetByKey(req, res, next) {
		try {
			let assetid = req.query['assetid'];
			let assettype = req.query.assettype
			let depth = req.query.depth
			let orgId = req.jwtInfo.orgId
			let orgName = "org" + orgId
			let userEmail = req.jwtInfo.userEmail;

			const gateway = new Gateway();
			let contract = await getContractObject(orgName, userEmail, NETWORK_PARAMETERS.CHANNEL_NAME, NETWORK_PARAMETERS.CHAINCODE_NAME, gateway)
			const result = await contract.evaluateTransaction('ReadAsset', assettype, assetid, depth);
			let asset
			if (result.length != 0) {
				asset = JSON.parse(result);
			} else {
				return res.status(500).send({
					status: false,
					message: "No Asset Found.",
					payload: {}
				});
			}

			gateway.disconnect();

			return res.status(200).send({
				status: true,
				message: "Asset Found!",
				payload: asset
			});

		} catch (error) {
			logger.error({ userInfo: req.jwtInfo, method: 'readAsset', message: error.message })
			return res.status(500).send({
				status: false,
				message: "errors -" + error.message
			});
		}

	}

	async queryAssetByKey(req, res, next) {
		try {
			let assetId = req.query.assetid;
			let orgId = req.jwtInfo.orgId
			let orgName = "org" + orgId
			let userEmail = req.jwtInfo.userEmail;

			logger.info({ userInfo: req.jwtInfo, method: 'queryAsset' })

			const gateway = new Gateway();
			let contract = await getContractObject(orgName, userEmail, NETWORK_PARAMETERS.CHANNEL_NAME, NETWORK_PARAMETERS.CHAINCODE_NAME, gateway)

			const result = await contract.evaluateTransaction('GetAssetById', assetId);

			let asset
			if (result.length != 0) {
				asset = JSON.parse(result);
			} else {
				return res.status(500).send({
					status: false,
					message: "No Asset Found.",
					payload: {}
				});
			}

			gateway.disconnect();

			return res.status(200).send({
				status: true,
				message: "Asset Found!",
				payload: asset
			});

		} catch (error) {
			logger.error({ userInfo: req.jwtInfo, method: 'queryAsset', error })
			return res.status(500).send({
				status: false,
				message: error.message
			});
		}

	}

	async queryAssetHistory(req, res, next) {
		try {
			let orgId = req.jwtInfo.orgId
			let orgName = "org" + orgId
			let userEmail = req.jwtInfo.userEmail;
			let assetType = req.query.assettype;
			let assetId = req.query.assetid;
			let depth = req.query.depth;

			logger.info({ userInfo: req.jwtInfo, method: 'queryAssetHistory' })

			const gateway = new Gateway();
			let contract = await getContractObject(orgName, userEmail, NETWORK_PARAMETERS.CHANNEL_NAME, NETWORK_PARAMETERS.CHAINCODE_NAME, gateway)

			const result = await contract.evaluateTransaction('ReadAssetHistory', assetType, assetId, depth);
			gateway.disconnect();

			let asset
			if (result.length != 0) {
				asset = JSON.parse(result);
			} else {
				return res.status(500).send({
					status: false,
					message: "No Asset Found.",
					payload: {}
				});
			}

			return res.status(200).send({
				status: true,
				message: "Asset Found!",
				payload: asset
			});
		} catch (error) {
			logger.error({ userInfo: req.jwtInfo, method: 'queryAssetHistory', error })
			return res.status(500).send({
				status: false,
				message: error.message
			});
		}

	}

	async queryAssets(req, res, next) {
		try {
			logger.info({ userInfo: req.jwtInfo, method: 'queryAssets' })

			let orgId = req.jwtInfo.orgId
			let orgName = "org" + orgId
			let userEmail = req.jwtInfo.userEmail;
			let pageSize = req.query.pageSize;
			let bookmark = req.query.bookmark || "";
			let assetList, result;

			const gateway = new Gateway();
			let contract = await getContractObject(orgName, userEmail, NETWORK_PARAMETERS.CHANNEL_NAME, NETWORK_PARAMETERS.CHAINCODE_NAME, gateway)

			// Todo: Use org id instead org name while creating query string
			let queryString = `{\"selector\":{\"ownerOrgId\": \"${orgId}\"}}`
			logger.info({ userInfo: req.jwtInfo, method: 'queryAssets', info: { queryString } })
			await contract.evaluateTransaction('GetAssetWithPagination', queryString, pageSize, bookmark);

			let assetArray = JSON.parse(result.toString());
			if (assetArray.length != 0) {
				assetList = assetArray;
			} else {
				return res.status(200).send({
					status: false,
					message: "No assets available in organizaiton." + orgId
				});
			}

			gateway.disconnect();

			return res.status(200).send({
				status: true,
				message: "Assets records fetched successfully!",
				payload: assetList
			});

		} catch (error) {
			logger.error({ userInfo: req.jwtInfo, method: 'queryAssets', error: error })
			return res.status(500).send({
				success: false,
				message: error
			});
		}
	}
}


module.exports = AssetController;
