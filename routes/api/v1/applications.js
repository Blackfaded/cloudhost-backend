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
		const applications = await applicationController.findAll();
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
		res.json(application);
	} catch (error) {
		console.log({ error });
		res.json([]);
	}
});

router.post('/', async (req, res) => {
	try {
		const { repositoryId, branchName, runScript, appName, repositoryName, needsMongo } = req.body; // eslint-disable-line
		const { email } = req.user;
		const userName = email.split('@')[0];

		const imageName = `${userName}_repository-${repositoryName}_branch-${branchName}_runscript-${runScript}`;
		const archive = 'archive.tar.gz';
		const mountPath = `${userName}/${appName}`;
		const containerName = `${userName}-${appName}`;

		const path = await downloader.getRepositoryArchive(req.user, {
			repositoryId,
			branchName,
			archive
		});

		await dockerfileController.createDockerfile({
			dir: path,
			archive,
			runScript,
			mountPath
		});

		await imageController.buildImage({
			imageName,
			path,
			archive
		});

		io.of('/test').emit('beginStartApplication');
		await applicationController.destroyByMountPath(req.user, mountPath);

		const mongoContainerName = `${userName}-mongoDB`;
		if (needsMongo) {
			const mongoContainer = await containerController.createMongoContainer(mongoContainerName);

			await networkController.attachContainerToNetworks({
				containerName: mongoContainerName,
				networkNames: ['cloudhost_users']
			});
			await containerController.startContainer(mongoContainerName);
			console.log(await mongoContainer.inspect());
		}

		const newApplication = await applicationController.createApplication(req.user, {
			mountPath,
			containerName,
			appName,
			imageName,
			repositoryId,
			repositoryBranch: branchName,
			repositoryName
		});

		await containerController.removeContainer(containerName);
		const createdContainer = await containerController.createContainer({
			imageName,
			containerName,
			mongoContainerName
		});
		await networkController.attachContainerToNetworks({
			containerName,
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

module.exports = router;
