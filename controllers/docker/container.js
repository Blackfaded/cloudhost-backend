const docker = require('./index');
const { appLogger } = require('../../config/winston');
const applicationController = require('../application');
const imageController = require('./images');

class ContainerController {
	getContainerName(user, { appName }) {
		const { userName } = user;
		return `${userName}-${appName}`;
	}

	async startContainer(user, { appName }) {
		const containerName = this.getContainerName(user, { appName });
		const foundContainer = await docker.getContainer(containerName);
		const inspectedContainer = await foundContainer.inspect();
		if (!inspectedContainer.State.Running) {
			await foundContainer.start();
			await applicationController.update(user, {
				autostart: true
			});
		}
		// return applicationController.findByAppName();
	}

	async stopContainer(user, { appName }) {
		const containerName = this.getContainerName(user, { appName });
		const foundContainer = await docker.getContainer(containerName);
		const inspectedContainer = await foundContainer.inspect();
		if (inspectedContainer.State.Running) {
			await foundContainer.stop();
			await applicationController.update(user, {
				autostart: false
			});
		}
	}

	async removeContainer(user, { appName }) {
		try {
			const containerName = this.getContainerName(user, { appName });
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

	async createContainer(user, { appName, imageName }) {
		const containerName = this.getContainerName(user, { appName });
		const createContainerOpts = {
			Image: imageName,
			name: containerName
			// Env: [`MONGO=${mongoContainerName}`]
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
		// hier kann man direkt alle mit autostart === true finden und muss im reducer nicht filtern
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
