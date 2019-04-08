/**
 * @module Winston
 */

const appRoot = require('app-root-path');
const { createLogger, format, transports } = require('winston');
const expressWinston = require('express-winston');

const { combine, timestamp, printf, colorize, json } = format; // eslint-disable-line

/**
 * @example
 * const filename = 'httpLogs'
 * @param  {string} filename
 * @returns {object} Winstron file transporter
 */
function configFileTransport(filename) {
	return new transports.File({
		level: 'info',
		filename: `${appRoot}/logs/${filename}.log`,
		handleExceptions: true,
		json: true,
		maxsize: 5242880, // 5MB
		maxFiles: 5,
		colorize: false
	});
}

/**
 * @returns {object} Winstron console transporter
 */
function configConsoleTransport() {
	return new transports.Console({
		level: 'debug',
		format: combine(
			timestamp(),
			colorize(),
			printf((info) => {
				const { timestamp, level, message, ...extra } = info; // eslint-disable-line
				const ts = timestamp.slice(0, 19).replace('T', ' ');
				return `${ts} [${level}]: ${message}`;
			})
		)
	});
}

const appTransports = [configFileTransport('app')];
if (process.env.NODE_ENV === 'development') {
	appTransports.push(configConsoleTransport());
}

const appLogger = createLogger({
	transports: appTransports,
	exitOnError: false
});

const httpTransports = [configFileTransport('http')];
if (process.env.NODE_ENV === 'development') {
	httpTransports.push(configConsoleTransport());
}

/**
 * @returns {object} Winstron logger
 */
const httpLogger = expressWinston.logger({
	transports: httpTransports,
	format: combine(json()),
	meta: true,
	expressFormat: true,
	colorize: false
});

module.exports = { appLogger, httpLogger };
