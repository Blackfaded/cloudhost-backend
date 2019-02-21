const express = require('express');
const fs = require('fs');
const { promises: fsp } = require('fs');
const path = require('path');
const tmp = require('tmp-promise');
const axios = require('../../../config/axios');
const { docker, dockerfile } = require('../../../config/docker');

const router = express.Router();

router.post('/', async (req, res) => {
	try {
		const { repositoryId, branchName, runScript } = req.body;
		console.log({ repositoryId, branchName });

		const { path: tempPath } = await tmp.dir({
			template: path.join(__dirname, '../../../tmp/tmp-XXXXXX'),
			unsafeCleanup: true
		});

		const archive = 'archive.tar.gz';

		const output = fs.createWriteStream(path.join(tempPath, archive));

		const { data: stream } = await axios.get(
			`api/v4/projects/${repositoryId}/repository/archive?sha=${branchName}`,
			{
				headers: {
					Authorization: `Bearer ${req.user.gitlabAccessToken}`
				},
				responseType: 'stream'
			}
		);
		const downloadSize = stream._readableState.length; // eslint-disable-line

		let downloaded = 0;

		await new Promise((resolve, reject) => {
			stream.on('data', (chunk /* arraybuffer */) => {
				downloaded += chunk.length;

				output.write(Buffer.from(chunk));
			});
			stream.on('end', () => resolve());
			stream.on('error', () => reject());
		});

		console.log({ downloaded });
		output.end();

		await fsp.writeFile(path.join(tempPath, 'Dockerfile'), dockerfile(archive, runScript), 'utf-8');

		const image = await docker.buildImage(
			{
				context: tempPath,
				src: ['Dockerfile', archive]
			},
			{ t: 'node_test' }
		);

		await new Promise((resolve, reject) => {
			image.pipe(
				process.stdout,
				{
					end: true
				}
			);
			docker.modem.followProgress(image, (err, res) => (err ? reject(err) : resolve(res)));
		});

		const createContainerOpts = {
			Image: 'node_test',
			ExposedPorts: {
				'8080/tcp': {}
			},
			Hostconfig: {
				NetworkMode: 'traefik'
			}
		};
		const container = await docker.createContainer(createContainerOpts);
		await container.start();
		res.send().status(200);
	} catch (error) {
		console.log(error);
		res.boom.badRequest('An error occured while creating the application');
	}
});

module.exports = router;
