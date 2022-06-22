/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { SETUP_TYPE } = require('./Constants');
const logger = require('../logger')(module);
const config = require('../config/cred');

exports.buildCCPOrg = (orgName) => {
	try {
		let ccpPath;
		if (config.SETUP == SETUP_TYPE.K8S) {
			let org = this.getOrgName(orgName)
			
			let connection = 'connection-' + org + '.json'
			ccpPath = path.resolve(__dirname, '..', 'connection-profiles', connection)
		} else {
			let org = orgName + '.example.com';
			let connection = 'connection-' + orgName + '.json'
			ccpPath = path.resolve(__dirname, '..', 'organizations', 'peerOrganizations', org, connection);
		}
		logger.info({ method: 'buildCCPOrg' })

		const fileExists = fs.existsSync(ccpPath);
		if (!fileExists) {
			throw `Invalid OrgId, Please use the valid Spydra Blockchain OrgId`;
		}
		const contents = fs.readFileSync(ccpPath, 'utf8');

		// build a JSON object from the file contents
		const ccp = JSON.parse(contents);

		return ccp;
	} catch (error) {
		logger.error({ method: 'buildCCPOrg', error })
	}
	// load the common connection configuration file

};


exports.buildWallet = async (Wallets, walletPath) => {
	try {
		logger.info({ method: 'buildWallet' })
		// Create a new  wallet : Note that wallet is for managing identities.
		let wallet;
		if (walletPath) {
			wallet = await Wallets.newFileSystemWallet(walletPath);
		} else {
			wallet = await Wallets.newInMemoryWallet();
		}

		return wallet;
	} catch (error) {
		logger.error({ method: 'buildWallet', error })
	}
};

exports.prettyJSONString = (inputString) => {
	if (inputString) {
		return JSON.stringify(JSON.parse(inputString), null, 2);
	}
	else {
		return inputString;
	}
}
