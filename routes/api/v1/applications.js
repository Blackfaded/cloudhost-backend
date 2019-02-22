const express = require('express');

const downloader = require('../../../controllers/downloads/gitlab');
const imageController = require('../../../controllers/docker/images');
const containerController = require('../../../controllers/docker/container');
const dockerfileController = require('../../../controllers/docker/dockerfile');

const router = express.Router();

router.post('/', async (req, res) => {
	try {
		const { repositoryId, branchName, runScript, mountPath, repositoryName } = req.body;
		const { email } = req.user;
		const userName = email.split('@')[0];
		console.log({ repositoryId, branchName, runScript, mountPath, userName });

		const archive = 'archive.tar.gz';

		const dir = await downloader.getRepositoryArchive(req.user, repositoryId, branchName, archive);

		await dockerfileController.createDockerfile(dir, archive, runScript, userName, mountPath);

		const imageName = `${userName}-${mountPath}`;

		await imageController.buildImage(req.user, {
			imageName,
			path: dir,
			archive,
			repositoryName,
			repositoryId,
			repositoryBranch: branchName
		});

		await containerController.removeContainer(imageName);

		await containerController.startContainer(imageName);
		res.send().status(200);
	} catch (error) {
		console.log(error);
		res.boom.badRequest('An error occured while creating the application');
	}
});

module.exports = router;
