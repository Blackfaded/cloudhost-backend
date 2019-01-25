const appRoot = require('app-root-path');
const { createLogger, format, transports } = require('winston');
const Elasticsearch = require('winston-elasticsearch');
const expressWinston = require('express-winston');

const { combine, timestamp, printf, colorize, json } = format; // eslint-disable-line

const esEnabled = false;

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
const mapping = require('./mapping.json');

function configElasticsearchTransport(index) {
	return new Elasticsearch({
		level: 'info',
		indexPrefix: 'cloudhost',
		index,
		mappingTemplate: mapping,
		clientOpts: {
			host: 'http://elk_elasticsearch_1:9200',
			maxRetries: 3
		}
	});
}

function configConsoleTransport(withMeta) {
	return new transports.Console({
		level: 'debug',
		format: combine(
			timestamp(),
			colorize(),
			printf((info) => {
				const { timestamp, level, message, ...extra } = info; // eslint-disable-line
				const ts = timestamp.slice(0, 19).replace('T', ' ');
				return `${ts} [${level}]: ${message} ${
					Object.keys(extra).length && withMeta ? `\n${JSON.stringify(extra, null, 2)}` : ''
				}`;
			})
		)
	});
}

const appTransports = [configFileTransport('app')];
if (process.env.NODE_ENV === 'development') {
	appTransports.push(configConsoleTransport(true));
}
if (esEnabled) {
	httpTransports.push(configElasticsearchTransport('app'));
}

const appLogger = createLogger({
	transports: appTransports,
	exitOnError: false
});

const httpTransports = [configFileTransport('http')];
if (process.env.NODE_ENV === 'development') {
	httpTransports.push(configConsoleTransport(false));
}
if (esEnabled) {
	httpTransports.push(configElasticsearchTransport('http'));
}
const httpLogger = expressWinston.logger({
	transports: httpTransports,
	format: combine(colorize(), json()),
	meta: true,
	expressFormat: true,
	colorize: false
});

module.exports = { appLogger, httpLogger };
