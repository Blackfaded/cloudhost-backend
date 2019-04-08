const docker = require('./index');

/** Class that controls the docker images */
class ImageController {
	/**
	 * Gets the image name of given user with options
	 * @param  {object} options
	 * @param  {string} options.repositoryName The apps repository name
	 * @param  {string} options.repositoryBranch The apps repository branch
	 * @param  {string} options.runScript The runscript from package.json
	 * @returns {string} The Dockerfile content
	 */
	getImageName(user, { repositoryName, repositoryBranch, runScript }) {
		const { userName } = user;
		const imageName = `${userName}_repository-${repositoryName}_branch-${repositoryBranch}_runscript-${runScript}`;
		return imageName.toLowerCase();
	}

	/**
	 * Gets the mount path of the application
	 * @example
	 * const user = req.user
	 * const appName = "mytemplate"
	 * @param {object} user The user object
	 * @param  {string} appName The apps name
	 * @returns {string} The apps mount path
	 */
	getMountPath(user, appName) {
		const { userName } = user;
		return `${userName}/${appName}`;
	}

	/**
	 * Builds an docker image
	 * @param {object} options The user object
	 * @param  {string} options.path The downloaded repositories path
	 * @param  {string} options.archive The downloaded repositories archive name
	 * @param  {string} options.imageName The name of the image to be build
	 * @returns {Promise} The Build promise
	 */
	async buildImage({ path, archive, imageName }, socket) {
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

	/**
	 * Pulls a docker image
	 * @param  {string} imageName The name of the image to be pulled
	 * @returns {Promise} The pulled image promise
	 */
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
