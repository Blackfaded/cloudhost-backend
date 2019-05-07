const replace = require('replace-in-file');

const options = {
	files: 'docker-compose.dev.yml',
	from: /cloudhost\/backend_development:(\d+.\d+.\d+)/g,
	to: `cloudhost/backend_development:${process.env.NPM_PACKAGE_VERSION}`
};

replace(options)
	.then((results) => {
		console.log('Replacement results:', results);
	})
	.catch((error) => {
		console.error('Error occurred:', error);
	});
