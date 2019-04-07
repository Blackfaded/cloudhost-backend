module.exports = {
	openapi: '3.0.1',
	info: {
		title: 'Cloudhost API',
		version: '1.0.0'
	},
	host: 'api.cloudhost',
	basePath: '/v1',

	apis: ['./swagger/**/*.yaml']

	// List of files to be processes. You can also set globs './routes/*.js'
};
