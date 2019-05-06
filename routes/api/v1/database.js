const express = require('express');

const containerController = require('../../../controllers/docker/container');
const networkController = require('../../../controllers/docker/network');
const userController = require('../../../controllers/user');

const router = express.Router();
const mongoAppName = 'mongoDB';
const mongoExpressAppName = 'mongoExpress';

router.get('/', async (req, res) => {
	try {
		const { hasMongoDB } = req.user;
		if (hasMongoDB) {
			const containerName = containerController.getContainerName(req.user, mongoAppName);
			return res.status(200).send({ connectionString: containerName });
		}
		return res.status(200).send({ connectionString: '' });
	} catch (e) {
		return res.boom.badImplementation();
	}
});

router.delete('/', async (req, res) => {
	try {
		await containerController.removeContainer(req.user, mongoAppName);
		await containerController.removeContainer(req.user, mongoExpressAppName);
		await userController.updateUserFieldsByEmail(req.user.email, { hasMongoDB: false });
		return res.status(200).send({ connectionString: '' });
	} catch (error) {
		return res.boom.badImplementation();
	}
});

router.post('/', async (req, res) => {
	try {
		const usersNetworkName = networkController.getUsersNetWorkName(req.user);
		await networkController.createNetwork(usersNetworkName);
		const mongoContainer = await containerController.createMongoContainer(req.user, mongoAppName);

		const mongoExpressContainer = await containerController.createMongoExpressContainer(
			req.user,
			mongoExpressAppName
		);

		await networkController.attachContainerToNetworks(req.user, {
			appName: mongoAppName,
			networkNames: [usersNetworkName]
		});

		await networkController.attachContainerToNetworks(req.user, {
			appName: mongoExpressAppName,
			networkNames: ['traefik', usersNetworkName]
		});

		await userController.updateUserFieldsByEmail(req.user.email, { hasMongoDB: true });

		await mongoContainer.start();
		await mongoExpressContainer.start();

		const containerName = containerController.getContainerName(req.user, mongoAppName);
		return res.status(200).send({ connectionString: containerName });
	} catch (error) {
		return res.boom.badImplementation();
	}
});

module.exports = router;
