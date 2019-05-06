const express = require('express');

const containerController = require('../../../controllers/docker/container');
const networkController = require('../../../controllers/docker/network');
const userController = require('../../../controllers/user');

const router = express.Router();
const mongoAppName = 'mongoDB';
const mongoExpressAppName = 'mongoExpress';

// Hole Datenbank Connection-String
router.get('/', async (req, res) => {
	try {
		const { hasMongoDB } = req.user;
		if (hasMongoDB) {
			// Fall Nutzer eine Datebank hat gib den Containernamen zurück
			const containerName = containerController.getContainerName(req.user, mongoAppName);
			return res.status(200).send({ connectionString: containerName });
		}
		// Falls der Nutzer keine Datenbank hat gebe leeren String zurück
		return res.status(200).send({ connectionString: '' });
	} catch (e) {
		return res.boom.badImplementation();
	}
});

// Lösche Nutzer-Datenbank
router.delete('/', async (req, res) => {
	try {
		// Zerstöre Mongo und Mongo-Express Container und setze Flag in Datenbank auf false
		await containerController.removeContainer(req.user, mongoAppName);
		await containerController.removeContainer(req.user, mongoExpressAppName);
		await userController.updateUserFieldsByEmail(req.user.email, { hasMongoDB: false });
		return res.status(200).send({ connectionString: '' });
	} catch (error) {
		return res.boom.badImplementation();
	}
});

// Erstelle Nutzerdatenbank
router.post('/', async (req, res) => {
	try {
		// Hole Docker-Netzwerk-Namen des Nutzers
		const usersNetworkName = networkController.getUsersNetWorkName(req.user);
		// Erstelle Netzwerk wenn noch nicht vorhanden
		await networkController.createNetwork(usersNetworkName);

		// Erstelle MongoDB Container
		const mongoContainer = await containerController.createMongoContainer(req.user, mongoAppName);

		// Erstelle Mongo-Express Container
		const mongoExpressContainer = await containerController.createMongoExpressContainer(
			req.user,
			mongoExpressAppName
		);

		// Füge den MongoDB Container dem Nutzer-Docker Netz hinzu
		await networkController.attachContainerToNetworks(req.user, {
			appName: mongoAppName,
			networkNames: [usersNetworkName]
		});

		// Füge den MongoDB Container dem Nutzer-Docker Netz und Traefik hinzu
		await networkController.attachContainerToNetworks(req.user, {
			appName: mongoExpressAppName,
			networkNames: ['traefik', usersNetworkName]
		});

		// Setze Flag in Datenbank
		await userController.updateUserFieldsByEmail(req.user.email, { hasMongoDB: true });

		// Starte beide Container
		await mongoContainer.start();
		await mongoExpressContainer.start();

		// Gebe ConnectionString zurück
		const containerName = containerController.getContainerName(req.user, mongoAppName);
		return res.status(200).send({ connectionString: containerName });
	} catch (error) {
		return res.boom.badImplementation();
	}
});

module.exports = router;
