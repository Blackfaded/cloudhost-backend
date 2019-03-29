const docker = require('./index');

class ImageController {
	getImageName(user, { repositoryName, repositoryBranch, runScript }) {
		const { userName } = user;
		return `${userName}_repository-${repositoryName}_branch-${repositoryBranch}_runscript-${runScript}`;
	}

	getMountPath(user, { appName }) {
		const { userName } = user;
		return `${userName}/${appName}`;
	}

	async buildImage(options, socket) {
		const { path, archive, imageName } = options;

		// TODO: fix io is not initialized yet
		socket.emit('startBuildImage');
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
		socket.emit('finishBuildImage');
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
