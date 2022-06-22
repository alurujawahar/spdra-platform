/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const logger = require("../logger")(module);

const adminUserId = 'admin';
const adminUserPasswd = 'adminpw';

/**
 *
 * @param {*} FabricCAServices
 * @param {*} ccp
 */
exports.buildCAClient = (FabricCAServices, ccp, caHostName) => {
	// Create a new CA client for interacting with the CA.
	try {
		logger.info('buildCAClient')
		const caInfo = ccp.certificateAuthorities[caHostName]; //lookup CA details from config
		const caTLSCACerts = caInfo.tlsCACerts.pem;
		const caClient = new FabricCAServices(caInfo.url, { trustedRoots: caTLSCACerts, verify: false }, caInfo.caName);

		return caClient;
	} catch (error) {
		logger.error('buildCAClient', error)
	}
};

exports.enrollAdmin = async (caClient, wallet, orgMspId) => {
	try {
		// Check to see if we've already enrolled the admin user.
		logger.info('enrollAdmin')
		const identity = await wallet.get(adminUserId);
		if (identity) {
			return;
		}

		// Enroll the admin user, and import the new identity into the wallet.
		const enrollment = await caClient.enroll({ enrollmentID: adminUserId, enrollmentSecret: adminUserPasswd });
		const x509Identity = {
			credentials: {
				certificate: enrollment.certificate,
				privateKey: enrollment.key.toBytes(),
			},
			mspId: orgMspId,
			type: 'X.509',
		};
		await wallet.put(adminUserId, x509Identity);
	} catch (error) {
		console.error(`Failed to enroll admin user : ${error}`);
		logger.error('enrollAdmin', error)
		throw error;
	}
};

exports.registerAndEnrollUser = async (caClient, wallet, orgMspId, userEmail, userId, orgId, orgName, affiliation) => {
	try {
		logger.info('registerAndEnrollUser')
		// Check to see if we've already enrolled the user
		const userIdentity = await wallet.get(userEmail);
		if (userIdentity) {
			return 'true';
		}

		// Must use an admin to register a new user
		let adminIdentity = await wallet.get(adminUserId);
		if (!adminIdentity) {
			await this.enrollAdmin(caClient, wallet, orgMspId);
		}

		adminIdentity = await wallet.get(adminUserId);
		// build a user object for authenticating with the CA
		const provider = wallet.getProviderRegistry().getProvider(adminIdentity.type);
		const adminUser = await provider.getUserContext(adminIdentity, adminUserId);

		logger.info({ method: 'registerAndEnrollUser', message: "userEmail - " + userEmail + ", userId - " + userId + ", orgId - " + orgId + ", orgName -" + orgName + "." })

		// Register the user, enroll the user, and import the new identity into the wallet.
		// if affiliation is specified by client, the affiliation value must be configured in CA
		const secret = await caClient.register({
			affiliation: affiliation,
			enrollmentID: userEmail,
			role: 'client',
			attrs: [
				{ name: "userEmail", value: userEmail, ecert: true },
				{ name: "userId", value: userId, ecert: true },
				{ name: "orgId", value: orgId, ecert: true },
				{ name: "orgName", value: orgName, ecert: true }
			]
		}, adminUser);
		const enrollment = await caClient.enroll({
			enrollmentID: userEmail,
			enrollmentSecret: secret
		});
		const x509Identity = {
			credentials: {
				certificate: enrollment.certificate,
				privateKey: enrollment.key.toBytes(),
			},
			mspId: orgMspId,
			type: 'X.509',
		};
		await wallet.put(userEmail, x509Identity);

		return 'true';
	} catch (error) {
		console.error(`Failed to register user : ${error}`);
		logger.error('registerAndEnrollUser', error)
		throw error;
	}
};
