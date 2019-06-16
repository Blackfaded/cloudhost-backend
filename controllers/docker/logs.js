const stream = require('stream');
const docker = require('./index');
const containerController = require('./container');

/** Class that controls the docker logs */
class LogController {
	/**
	 * Creates a Dockerfile with given parameters
	 * @example
	 * const userName = "john.doe"
	 * const appName = "mytemplate"
	 * @param  {string} userName The username
	 * @param  {string} appName The apps name
	 * @returns {Stream} The log stream
	 */
	async getLogStream(userName, appName) {
		const containerName = containerController.getContainerName({ userName }, appName);
		const container = await docker.getContainer(containerName);

		const logStream = new stream.PassThrough();

		const containerStream = await container.logs({
			follow: true,
			stdout: true,
			stderr: true,
			tail: 100
		});

		container.modem.demuxStream(containerStream, logStream, logStream);

		return { logStream, containerStream };
	}
}

module.exports = new LogController();
