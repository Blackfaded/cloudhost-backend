const express = require('express');

const downloader = require('../../../controllers/downloads/gitlab');
const imageController = require('../../../controllers/docker/images');
const containerController = require('../../../controllers/docker/container');
const dockerfileController = require('../../../controllers/docker/dockerfile');
const applicationController = require('../../../controllers/application');
const networkController = require('../../../controllers/docker/network');
const io = require('../../../controllers/websocket');

const router = express.Router();

router.get('/', async (req, res) => {
	try {
		console.log(req.user);
		const applications = await applicationController.findAllByUser(req.user);
		res.json(applications.map((app) => app.get({ plain: true })));
	} catch (error) {
		console.log({ error });
		res.json([]);
	}
});

router.get('/:appName', async (req, res) => {
	try {
		const { appName } = req.params;
		const { user } = req;
		const application = await applicationController.findByAppName(user, appName);
		res.json(application[0]);
	} catch (error) {
		console.log({ error });
		res.json([]);
	}
});

router.post('/', async (req, res) => {
	try {
		const { repositoryId, branchName, runScript, appName, repositoryName, needsMongo } = req.body; // eslint-disable-line

		const archive = 'archive.tar.gz';

		const path = await downloader.getRepositoryArchive(req.user, {
			repositoryId,
			branchName,
			archive
		});

		await dockerfileController.createDockerfile(req.user, {
			dir: path,
			archive,
			runScript,
			appName
		});

		const imageName = imageController.getImageName(req.user, {
			repositoryName,
			branchName,
			runScript
		});

		await imageController.buildImage({
			path,
			archive,
			imageName
		});

		io.of('/test').emit('beginStartApplication');
		await applicationController.destroyByAppName(req.user, appName);

		const mongoContainerName = containerController.getContainerName(req.user, { appName: 'mongoDB' });
		if (needsMongo) {
			const mongoContainer = await containerController.createMongoContainer(mongoContainerName);

			await networkController.attachContainerToNetworks({
				containerName: mongoContainerName,
				networkNames: ['cloudhost_users']
			});
			await containerController.startContainer(req.user, { appName: 'mongoDB' });
			console.log(await mongoContainer.inspect());
		}

		const newApplication = await applicationController.createApplication(req.user, {
			appName,
			repositoryId,
			repositoryBranch: branchName,
			repositoryName
		});

		await containerController.removeContainer(req.user, { appName });
		const createdContainer = await containerController.createContainer(req.user, {
			appName,
			imageName
		});
		await networkController.attachContainerToNetworks(req.user, {
			appName,
			networkNames: ['traefik', 'cloudhost_users']
		});
		await createdContainer.start();

		io.of('/test').emit('finishStartApplication');

		res.json(newApplication.get({ plain: true }));
	} catch (error) {
		console.log({ error });
		res.boom.badRequest('An error occured while creating the application');
	}
});

router.post('/:appName/stop', async (req, res) => {
	try {
		const { appName } = req.params;
		await containerController.stopContainer(req.user, { appName });
		res.status(200).send();
	} catch (error) {
		console.log({ error });
		res.boom.badImplementation('Container already stopped.');
	}
});

router.post('/:appName/start', async (req, res) => {
	try {
		const { appName } = req.params;
		await containerController.startContainer(req.user, { appName });
		res.status(200).send();
	} catch (error) {
		console.log({ error });
		res.boom.badImplementation('Container already stopped.');
	}
});

module.exports = router;
