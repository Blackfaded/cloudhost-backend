const logController = require('../docker/logs');

class LogController {
	sendLogs(socket) {
		return async (data) => {
			const { userName, appName } = data;
			const logStream = await logController.getLogStream(userName, appName);
			logStream.on('data', (chunk) => {
				socket.emit('logs', chunk.toString('utf8'));
			});

			socket.on('disconnect', () => {
				console.log('logstream destroyed');
				logStream.destroy();
			});
		};
	}
}

module.exports = new LogController();
