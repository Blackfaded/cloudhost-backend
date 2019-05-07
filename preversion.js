const replace = require('replace-in-file');

const optionsDev = {
	files: 'docker-compose.dev.yml',
	from: /cloudhost\/backend_development:(\d+.\d+.\d+)/g,
	to: `cloudhost/backend_development:${process.env.NPM_PACKAGE_VERSION}`
};

const optionsStaging = {
	files: 'docker-compose.staging.yml',
	from: /cloudhost\/backend_staging:(\d+.\d+.\d+)/g,
	to: `cloudhost/backend_staging:${process.env.NPM_PACKAGE_VERSION}`
};

const optionsProd = {
	files: 'docker-compose.prod.yml',
	from: /cloudhost\/backend_production:(\d+.\d+.\d+)/g,
	to: `cloudhost/backend_production:${process.env.NPM_PACKAGE_VERSION}`
};

replace(optionsDev)
	.then((results) => {
		console.log('Replacement results:', results);
	})
	.catch((error) => {
		console.error('Error occurred:', error);
	});

replace(optionsStaging)
	.then((results) => {
		console.log('Replacement results:', results);
	})
	.catch((error) => {
		console.error('Error occurred:', error);
	});

replace(optionsProd)
	.then((results) => {
		console.log('Replacement results:', results);
	})
	.catch((error) => {
		console.error('Error occurred:', error);
	});
