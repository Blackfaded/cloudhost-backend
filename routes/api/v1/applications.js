const express = require('express');
const rimraf = require('rimraf');
const util = require('util');
const downloader = require('../../../controllers/downloads/gitlab');
const imageController = require('../../../controllers/docker/images');
const containerController = require('../../../controllers/docker/container');
const dockerfileController = require('../../../controllers/docker/dockerfile');
const applicationController = require('../../../controllers/application');
const networkController = require('../../../controllers/docker/network');
const { appLogger } = require('../../../config/winston');

const router = express.Router();

const rimrafp = util.promisify(rimraf);

// Hole alle Applikationen des Nutzers
router.get('/', async (req, res) => {
	try {
		const applications = await applicationController.findAllByUser(req.user);
		return res.json(applications.map((app) => app.get({ plain: true })));
	} catch (error) {
		appLogger.error(error);
		return res.json([]);
	}
});

// Hole eine Applikation des Nutzers
router.get('/:appName', async (req, res) => {
	try {
		const { appName } = req.params;
		const { user } = req;
		const applications = await applicationController.findByAppName(user, appName);
		return res.json(applications[0]);
	} catch (error) {
		appLogger.error(error);
		return res.json({});
	}
});

// Lösche eine Applikation des Nutzers
router.delete('/:appName', async (req, res) => {
	try {
		const { appName } = req.params;
		const { user } = req;
		// Zerstöre Docker-Container und die App in der Datenbank
		await containerController.removeContainer(user, appName);
		await applicationController.destroyByAppName(user, appName);
		return res.status(200).send();
	} catch (error) {
		appLogger.error(error);
		return res.boom.badImplementation();
	}
});

// Erstelle eine Applikation
router.post('/', async (req, res) => {
	try {
		// Parse die benötigten Parameter aus dem Request Body
		const {
			repositoryId,
			repositoryBranch,
			runScript,
			appName,
			repositoryName,
			buildScript,
			socketId
		} = req.body;

		// Wenn der App-Name über 30 Zeichen Lang ist gebe einen Fehler zurück
		if (appName.length >= 30) {
			return res.boom.badRequest("appName can't be longer than 30 characters");
		}

		// Initialisiere Nutzersocket um dem Anfragenden Nutzer den Fortschritt mitzuteilen
		const socket = req.io.to(socketId);

		// Name des Archivs, das heruntergeladen wird

		const archive = 'archive.tar.gz';

		// Hole das Repository Archiv von Gitlab
		const path = await downloader.getRepositoryArchive(
			req.user,
			{
				repositoryId,
				repositoryBranch,
				archive
			},
			socket
		);

		// Zerstöre alte App in der Datenbank und zerstöre den alten Docker-Container
		await applicationController.destroyByAppName(req.user, appName);
		await containerController.removeContainer(req.user, appName);

		// Erstelle ein neues Dockerfile für die Anwendung
		await dockerfileController.createDockerfile(req.user, {
			dir: path,
			archive,
			runScript,
			appName,
			buildScript
		});

		// Ermittle den Image-Namen der Applikation
		const imageName = imageController.getImageName(req.user, {
			repositoryName,
			repositoryBranch,
			runScript
		});

		// Baue das Docker-Image
		await imageController.buildImage(
			{
				path,
				archive,
				imageName
			},
			socket
		);

		// Teile dem CLient mit, dass die Applikation nun gestartet wird.
		socket.emit('beginStartApplication');

		// Ermittle Dockernetzwerk Namen des Nutzers
		const usersNetworkName = networkController.getUsersNetWorkName(req.user);
		// Erstelle Docker-Netzwerk
		await networkController.createNetwork(usersNetworkName);

		const containeroptions = {
			appName,
			imageName
		};

		// Erstelle Docker Container
		const createdContainer = await containerController.createContainer(req.user, containeroptions);

		// Erstelle App in der Datenbank
		const newApplication = await applicationController.createApplication(req.user, {
			appName,
			repositoryId,
			repositoryBranch,
			repositoryName,
			runScript,
			buildScript
		});

		// Füge den Nutzercontainer seinem Docker-Netzwerk und Traefik hinzu
		await networkController.attachContainerToNetworks(req.user, {
			appName,
			networkNames: ['traefik', usersNetworkName]
		});

		// Starte den Nutzercontainer
		await createdContainer.start();

		// Teile dem Nutzer mit, dass die App gestartet ist
		socket.emit('finishStartApplication');

		// Lösche Temporäre Dateien
		await rimrafp(path);

		// Gibt das App Model an den Client
		return res.json(newApplication);
	} catch (error) {
		// Return error
		appLogger.error(error);
		return res.boom.badRequest('An error occured while creating the application');
	}
});

router.post('/:appName/stop', async (req, res) => {
	try {
		const { appName } = req.params;
		// Stoppe Container und update Datenbankmodel
		await containerController.stopApplicationContainer(req.user, appName);
		await applicationController.update(req.user, appName, {
			running: false
		});
		return res.status(200).send();
	} catch (error) {
		appLogger.error(error);
		return res.boom.badImplementation('Container already stopped.');
	}
});

router.post('/:appName/start', async (req, res) => {
	try {
		const { appName } = req.params;
		// Starte Container und update Datenbankmodel
		await containerController.startApplicationContainer(req.user, appName);
		await applicationController.update(req.user, appName, {
			running: true
		});
		return res.status(200).send();
	} catch (error) {
		appLogger.error(error);
		return res.boom.badImplementation('Container already stopped.');
	}
});

module.exports = router;
