const docker = require('./index');
const io = require('../websocket');
const application = require('../../controllers/application');

class ImageController {
	async buildImage(user, options) {
		const { path, archive, imageName, repositoryId, repositoryBranch, repositoryName } = options;
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

			io.of('/test').emit('buildProgress', { message: output });
		});

		await new Promise((resolve, reject) => {
			docker.modem.followProgress(image, (err, res) => (err ? reject(err) : resolve(res)));
		});

		// TODO: remove old application
		await application.createApplication(user, {
			repositoryId,
			repositoryBranch,
			repositoryName
		});
	}
}

module.exports = new ImageController();
