const express = require('express');

const downloader = require('../../../controllers/downloads/gitlab');
const imageController = require('../../../controllers/docker/images');
const containerController = require('../../../controllers/docker/container');
const dockerfileController = require('../../../controllers/docker/dockerfile');
const applicationController = require('../../../controllers/application');
const networkController = require('../../../controllers/docker/network');

const router = express.Router();

router.get('/', async (req, res) => {
	try {
		console.log(req.user);
		const applications = await applicationController.findAllByUser(req.user);
		return res.json(applications.map((app) => app.get({ plain: true })));
	} catch (error) {
		console.log({ error });
		return res.json([]);
	}
});

router.get('/:appName', async (req, res) => {
	try {
		const { appName } = req.params;
		const { user } = req;
		const applications = await applicationController.findByAppName(user, appName);
		return res.json(applications[0]);
	} catch (error) {
		console.log({ error });
		return res.json({});
	}
});

router.delete('/:appName', async (req, res) => {
	try {
		const { appName } = req.params;
		const { user } = req;
		await containerController.removeContainer(user, appName);
		await applicationController.destroyByAppName(user, appName);
		return res.status(200).send();
	} catch (error) {
		console.log({ error });
		return res.boom.badImplementation();
	}
});

router.post('/', async (req, res) => {
	try {
		const { repositoryId, branchName, runScript, appName, repositoryName, buildScript } = req.body; // eslint-disable-line

		if (appName.length >= 30) {
			return res.boom.badRequest("appName can't be longer than 30 characters");
		}
		const archive = 'archive.tar.gz';
		const path = await downloader.getRepositoryArchive(req.user, {
			repositoryId,
			branchName,
			archive
		}, req.app.io);

		await dockerfileController.createDockerfile(req.user, {
			dir: path,
			archive,
			runScript,
			appName,
			buildScript
		});

		const imageName = imageController.getImageName(req.user, {
			repositoryName,
			branchName,
			runScript
		});

		await imageController.buildImage(
			{
				path,
				archive,
				imageName
			},
			req.app.io
		);

		req.app.io.of('/applicationCreate').emit('beginStartApplication');
		await applicationController.destroyByAppName(req.user, appName);
		await containerController.removeContainer(req.user, appName);

		const usersNetworkName = networkController.getUsersNetWorkName(req.user);
		await networkController.createNetwork(usersNetworkName);

		const containeroptions = {
			appName,
			imageName
		};

		const createdContainer = await containerController.createContainer(req.user, containeroptions);

		const newApplication = await applicationController.createApplication(req.user, {
			appName,
			repositoryId,
			repositoryBranch: branchName,
			repositoryName
		});

		await networkController.attachContainerToNetworks(req.user, {
			appName,
			networkNames: ['traefik', usersNetworkName]
		});
		await createdContainer.start();

		req.app.io.of('/applicationCreate').emit('finishStartApplication');

		return res.json(newApplication.get({ plain: true }));
	} catch (error) {
		console.log({ error });
		return res.boom.badRequest('An error occured while creating the application');
	}
});

router.post('/:appName/stop', async (req, res) => {
	try {
		const { appName } = req.params;
		await containerController.stopApplicationContainer(req.user, appName);
		await applicationController.update(req.user, appName, {
			running: false
		});
		return res.status(200).send();
	} catch (error) {
		console.log({ error });
		return res.boom.badImplementation('Container already stopped.');
	}
});

router.post('/:appName/start', async (req, res) => {
	try {
		const { appName } = req.params;
		await containerController.startApplicationContainer(req.user, appName);
		await applicationController.update(req.user, appName, {
			running: true
		});
		return res.status(200).send();
	} catch (error) {
		console.log({ error });
		return res.boom.badImplementation('Container already stopped.');
	}
});

module.exports = router;
