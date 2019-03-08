const stream = require('stream');
const docker = require('./index');
const containerController = require('./container');

class LogController {
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

		return logStream;
	}
}

module.exports = new LogController();
