const docker = require('./index');

class ImageController {
	getImageName(user, { repositoryName, branchName, runScript }) {
		const { userName } = user;
		return `${userName}_repository-${repositoryName}_branch-${branchName}_runscript-${runScript}`;
	}

	getMountPath(user, { appName }) {
		const { userName } = user;
		return `${userName}/${appName}`;
	}

	async buildImage(options, io) {
		const { path, archive, imageName } = options;

		console.log(io);
		// TODO: fix io is not initialized yet
		io.of('/applicationCreate').emit('startBuildImage');
		const image = await docker.buildImage(
			{
				context: path,
				src: ['Dockerfile', archive]
			},
			{ t: imageName }
		);
		image.on('data', (chunk) => {
			const output = JSON.parse(chunk.toString()).stream;
			console.log(output);
		});

		await new Promise((resolve, reject) => {
			docker.modem.followProgress(image, (err, res) => (err ? reject(err) : resolve(res)));
		});
		io.of('/applicationCreate').emit('finishBuildImage');
	}

	async getImage(imageName) {
		return new Promise(async (resolve, reject) => {
			const stream = await docker.pull(imageName);

			stream.on('data', (chunk /* arraybuffer */) => {
				console.log(chunk.toString());
			});

			stream.on('end', () => resolve());
			stream.on('error', () => reject());
		});
	}
}

module.exports = new ImageController();
