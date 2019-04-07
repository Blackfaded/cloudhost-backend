const { host } = require('../config/connections');

module.exports = {
	openapi: '3.0.1',
	info: {
		title: 'Cloudhost API',
		version: '3.0.1'
	},
	host,

	apis: ['./swagger/**/*.yaml']

	// List of files to be processes. You can also set globs './routes/*.js'
};
