/*
 * Copyright Paramount soft. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Wallets, Gateway, DefaultEventHandlerStrategies } = require('fabric-network');
const util = require('util');
const fs = require('fs');
const path = require('path');
const { getNetworkObject } = require('../../utils/util.js');
const logger = require('./../../logger')(module);
const configPath = path.resolve(__dirname, 'nextblock.txt');
const { updateStatus } = require('../../utils/UpdateStatus');
const { NETWORK_PARAMETERS, BLOCKCHAIN_ASSETS } = require('./../../utils/Constants.js');
const BLOCK_RETRIVAL_TIME = 10000;  //10 second

class BlockMap {
	constructor() {
		this.list = []
	}
	get(key) {
		key = parseInt(key, 10).toString();
		return this.list[`block${key}`];
	}
	set(key, value) {
		this.list[`block${key}`] = value;
	}
	remove(key) {
		key = parseInt(key, 10).toString();
		delete this.list[`block${key}`];
	}
}

let ProcessingMap = new BlockMap()

async function processCommittedBlock(processBlock) {
	try {
		for (const i in processBlock.data.data) {

			if (processBlock.data.data[i].payload.data.actions !== undefined) {
				const inputArgs = processBlock.data.data[i].payload.data.actions[0].payload.chaincode_proposal_payload.input.chaincode_spec.input.args;
				// const tx_id = processBlock.data.data[i].payload.header.channel_header.tx_id;
				// const txTime = new Date(processBlock.data.data[i].payload.header.channel_header.timestamp).toUTCString();
				let inputData = 'Inputs: ';


				let inputFunction
				for (let j = 0; j < inputArgs.length; j++) {
					inputFunction = inputArgs[0].toString()
					const inputArgPrintable = inputArgs[j].toString().replace(/[^\x20-\x7E]+/g, '');
					inputData = inputData.concat(inputArgPrintable, ' ');
				}

				logger.info({ method: 'processCommittedBlock', message: 'Function-' + inputFunction })
				if (inputFunction == 'CreatePermissions' || inputFunction == 'CreateAssetDefinitions') {
					let payload
					if (inputArgs.length > 0) {
						payload = JSON.parse(inputArgs[1]);
					}

					logger.info({ method: 'processCommittedBlock', message: payload })
					// Show the proposed writes to the world state
					let key;
					let keyData = 'Keys updated: ';
					for (const l in processBlock.data.data[i].payload.data.actions[0].payload.action.proposal_response_payload.extension.results.ns_rwset[1].rwset.writes) {
						key = processBlock.data.data[i].payload.data.actions[0].payload.action.proposal_response_payload.extension.results.ns_rwset[1].rwset.writes[l].key
						keyData = keyData.concat(processBlock.data.data[i].payload.data.actions[0].payload.action.proposal_response_payload.extension.results.ns_rwset[1].rwset.writes[l].key, ' ');
					}

					logger.info({ method: 'processCommittedBlock', message: 'Updating in mongo->' })
					if (payload) {
						let onChainStatus
						((processBlock.metadata.metadata[2])[i] !== 0) ? onChainStatus = 'Invalid' : onChainStatus = 'Committed'
						await updateStatus(inputFunction, payload['assetType'], onChainStatus);
						logger.info({ method: 'processCommittedBlock', message: 'Updating in mongo complete' })
					}

				} else {
				}
			}
		}
	} catch (error) {
		logger.error({ method: 'processCommittedBlock', error })
	}
}



class BlockEventController {
	constructor() {
	}

	async startListner() {
		try {
			logger.info({ method: 'startListner' })

			let nextBlock = 0;
			let orgId = '2'
			let orgName = "org" + orgId
			let user = 'kamal1@spydra.app';

			if (fs.existsSync(configPath)) {
				nextBlock = fs.readFileSync(configPath, 'utf8');
			} else {
				fs.writeFileSync(configPath, parseInt(nextBlock, 18))
			}

			try {
				const gateways = new Gateway();
				let network = await getNetworkObject(orgName, user, NETWORK_PARAMETERS.CHANNEL_NAME, NETWORK_PARAMETERS.CHAINCODE_NAME, gateways)
				const listener = await network.addBlockListener(
					async (blockNum) => {
						// Add the block to the processing map by block number
						await ProcessingMap.set(blockNum.blockNumber, blockNum.blockData);
					},
					// set the starting block for the listener
					{ filtered: false, startBlock: parseInt(nextBlock, 10) }
				);

				let nextBlockNumber = parseInt(nextBlock)
				do {
					let processBlock = ProcessingMap.get(nextBlockNumber)
					if (processBlock == undefined) {
						await new Promise(resolve => setTimeout(resolve, BLOCK_RETRIVAL_TIME));
						continue;
					}
					await processCommittedBlock(processBlock)
					ProcessingMap.remove(nextBlockNumber);
					nextBlockNumber = nextBlockNumber + 1
					fs.writeFileSync(configPath, nextBlockNumber.toString())
				} while (true);

			} catch (err) {
				logger.error({ method: 'startListner', message: err.message })
			}
		} catch (error) {
			logger.error({ method: 'startListner->Outer Catch', message: error.message })
		};
	}
}

module.exports = BlockEventController;
