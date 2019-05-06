#!/usr/bin/env node

require('custom-env').env(process.env.NODE_ENV || 'development');
const http = require('http');
const debug = require('debug')('cloudhost:server');
const io = require('../controllers/websocket');
const models = require('../database/models');
const umzug = require('../database/umzug');
const { appLogger } = require('../config/winston');
const app = require('../app');
const initializer = require('../controllers/initialize');

const port = normalizePort(process.env.PORT || '3000');
app.set('port', port);

// Erstelle Server
const server = http.createServer(app);
io.listen(server);

// Synchronisiere Datenbank
models.sequelize.sync().then(async () => {
	// Führe Migrations durch
	umzug.up();

	// Initializiere App
	await initializer.init();

	server.listen(port);
	server.on('error', onError);
	server.on('listening', onListening);
});

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
