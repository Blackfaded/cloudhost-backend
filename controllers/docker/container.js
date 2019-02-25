const docker = require('./index');
const { appLogger } = require('../../config/winston');
const applicationController = require('../application');

class ContainerController {
	async startContainer(containerName) {
		const foundContainer = await docker.getContainer(containerName);
		const inspectedContainer = await foundContainer.inspect();
		if (!inspectedContainer.State.Running) {
			await foundContainer.start();
		}
	}

	async removeContainer(containerName) {
		try {
			const oldContainer = await docker.getContainer(containerName);
			await oldContainer.inspect();
			return oldContainer.remove({ force: true });
		} catch (error) {
			if (error.statusCode === 404) {
				return Promise.resolve();
			}
			return Promise.reject(error);
		}
	}

	async createContainer({ imageName, containerName, mongoContainerName }) {
		const createContainerOpts = {
			Image: imageName,
			name: containerName,
			Env: [`MONGO=${mongoContainerName}`]
		};
		return docker.createContainer(createContainerOpts);
	}

	async createMongoContainer(containerName) {
		try {
			const oldContainer = await docker.getContainer(containerName);
			await oldContainer.inspect();
			return oldContainer;
		} catch (error) {
			if (error.statusCode === 404) {
				return this.createContainer({
					imageName: 'mvertes/alpine-mongo:latest',
					containerName
				});
			}
			return Promise.reject(error);
		}
	}

	async startAllRunningContainers() {
		const applications = await applicationController.findAll();
		// eslint-disable-next-line

		return applications.reduce(async (promise, application) => {
			// This line will wait for the last async function to finish.
			// The first iteration uses an already resolved Promise
			// so, it will immediately continue.
			await promise;
			if (application.autostart) {
				const { containerName } = application;
				try {
					const foundContainer = await docker.getContainer(containerName);
					const inspectedContainer = await foundContainer.inspect();
					if (!inspectedContainer.State.Running) {
						await foundContainer.start();
						appLogger.info(`started container ${containerName}`);
					} else {
						appLogger.info(`container ${containerName} is already running`);
					}
				} catch (error) {
					if (error.statusCode === 404) {
						Promise.resolve();
					} else {
						Promise.reject();
					}
				}
			}
		}, Promise.resolve());
	}
}

module.exports = new ContainerController();
