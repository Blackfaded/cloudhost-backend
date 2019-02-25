const docker = require('./index');
const io = require('../websocket');

class ImageController {
	async buildImage(options) {
		const { path, archive, imageName } = options;
		io.of('/test').emit('startBuildImage');
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

			// io.of('/test').emit('buildProgress', { message: output });
		});

		await new Promise((resolve, reject) => {
			docker.modem.followProgress(image, (err, res) => (err ? reject(err) : resolve(res)));
		});
		io.of('/test').emit('finishBuildImage');
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
