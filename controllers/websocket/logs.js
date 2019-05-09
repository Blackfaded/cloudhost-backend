const jwt = require('jsonwebtoken');
const config = require('../../config/connections');
const logController = require('../docker/logs');
const userController = require('../user');

class LogController {
	sendLogs(socket) {
		return async (data) => {
			try {
				const { token, appName } = data;
				const decoded = jwt.verify(token, config.jwt.secret);
				const userName = userController.getUserName({ email: decoded.email });
				const logStream = await logController.getLogStream(userName, appName);
				logStream.on('data', (chunk) => {
					socket.emit('logs', chunk.toString('utf8'));
				});

				socket.on('disconnect', () => {
					console.log('logstream destroyed');
					logStream.destroy();
				});
			} catch (error) {
				console.log({ error });
			}
		};
	}
}

module.exports = new LogController();
