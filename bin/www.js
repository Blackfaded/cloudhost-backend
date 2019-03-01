#!/usr/bin/env node

const http = require('http');

const debug = require('debug')('cloudhost:server');
const models = require('../database/models');
const umzug = require('../database/umzug');
const { appLogger } = require('../config/winston');
const app = require('../app');
const io = require('../controllers/websocket');
const containerController = require('../controllers/docker/container');
const networkController = require('../controllers/docker/network');
const imageController = require('../controllers/docker/images');
/**
 * Get port from environment and store in Express.
 */

const port = normalizePort(process.env.PORT || '3000');
app.set('port', port);

/**
 * Create HTTP server.
 */

const server = http.createServer(app);
io.listen(server);
/**
 * Listen on provided port, on all network interfaces.
 */

models.sequelize.sync().then(async () => {
	/**
	 * Listen on provided port, on all network interfaces.
	 */
	umzug.up();

	await imageController.getImage('mvertes/alpine-mongo:4.0.5-0');
	await imageController.getImage('mongo-express:0.49');
	await networkController.createNetwork('cloudhost_users');

	await containerController.startAllRunningContainers();
	server.listen(port);
	server.on('error', onError);
	server.on('listening', onListening);
});

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
	const port = parseInt(val, 10);

	if (isNaN(port)) {
		// named pipe
		return val;
	}

	if (port >= 0) {
		// port number
		return port;
	}

	return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
	if (error.syscall !== 'listen') {
		throw error;
	}

	const bind = typeof port === 'string' ? `Pipe ${port}` : `Port '${port}`;

	// handle specific listen errors with friendly messages
	switch (error.code) {
		case 'EACCES':
			console.error(`${bind} requires elevated privileges`);
			process.exit(1);
			break;
		case 'EADDRINUSE':
			console.error(`${bind} is already in use`);
			process.exit(1);
			break;
		default:
			throw error;
	}
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
	const addr = server.address();
	debug(`Listening on http://localhost:${addr.port}`);
	appLogger.info('app started');
}

module.exports = server;
