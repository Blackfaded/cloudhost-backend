const containerController = require('../docker/container');
const imageController = require('../docker/images');

/** Helper class that initializes server startup
 * It fetches needes images and starts all app and mongoDB containers
 */
class Initializer {
	/**
	 * Initializes images and containers
	 * @returns {Promise}
	 */
	async init() {
		await imageController.getImage('mvertes/alpine-mongo:4.0.5-0');
		await imageController.getImage('mongo-express:0.49');

		await containerController.startAllMongoContainers();
		await containerController.startAllRunningUserContainers();
	}
}

module.exports = new Initializer();
