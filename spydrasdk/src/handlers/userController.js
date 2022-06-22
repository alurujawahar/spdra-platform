/*
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Wallets } = require('fabric-network');
const FabricCAServices = require('fabric-ca-client');
const path = require('path');
const { buildCAClient, registerAndEnrollUser } = require('../../utils/CAUtil.js');
const { buildCCPOrg, buildWallet, getOrgName } = require('../../utils/AppUtil.js');
const { SETUP_TYPE } = require('../../utils/Constants.js');
const logger = require('../../logger')(module);
const config = require('../../config/cred');
const { token } = require('morgan');
var jwt = require('jsonwebtoken');


exports.registerEnrollUser = async (req, res, next) => {
	try {
		let orgId = req.body.orgId;
		let org = req.body.orgName;
		let userEmail = req.body.userEmail;
		let userId = req.body.userId;

		//KM user credential insert in DB 

		let caOrg;
		let walletPath;
		let mspOrg;
		let department;

		if (config.SETUP == SETUP_TYPE.K8S) {
			let orgName = getOrgName(org)
			caOrg = `${orgName}-ca`
			walletPath = '../../../wallet/' + orgName;
			mspOrg = orgName.charAt(0).toUpperCase() + orgName.slice(1) + 'MSP';
			department = orgName + '.department1'
		} else {
			caOrg = 'ca.' + org + '.example.com';
			walletPath = '../../wallet/' + org;
			mspOrg = 'O' + org.substr(1) + 'MSP';
			department = org + '.department1'

		}

		logger.info({ userInfo: req.jwtInfo, method: 'registerEnrollUser' })

		const ccpOrg = buildCCPOrg(org);
		const caOrgClient = buildCAClient(FabricCAServices, ccpOrg, caOrg);
		const walletPathOrg = path.join(__dirname, walletPath);
		const walletOrg = await buildWallet(Wallets, walletPathOrg);

		let response = await registerAndEnrollUser(caOrgClient, walletOrg, mspOrg, userEmail, userId, orgId, org, department);
		if (response == 'true') {
			return res.status(200).send({
				success: true,
				message: "Successfully registered user"
			});
		} else {
			return res.status(500).send({
				success: false,
				message: "Registration failed, please enroll admin and proceed"
			});
		}

	} catch (err) {
		logger.error({ userInfo: req.loggerInfo, method: 'registerEnrollUser', message: err.message })
		return res.status(500).send({
			success: false,
			message: err
		});
	}

}

exports.login = async (req, res, next) => {
	try {

		let userEmail = req.body.userEmail;
		let orgId = req.body.orgId;
		let orgName = "org" + orgId;
		let userId = req.body.userId;

		let userCredential = {
			orgId: orgId,
			orgName: orgName,
			userEmail: userEmail,
			userId: userId
		}

		const token = jwt.sign(userCredential, config.JWT_SECRET, {})
		console.log("Test Token: ", token)

		res.cookie("jwt", token, {
			expires: new Date(Date.now() + 3000000),
			httpOnly: true
		})

		return res.status(200).send({
			success: true,
			message: "Successfully registered user",
			payload: token
		});

	}
	catch (err) {
		logger.error({ userInfo: req.jwtInfo, method: 'login', err })
		return res.status(500).send({
			success: false,
			message: err
		});
	}

}
