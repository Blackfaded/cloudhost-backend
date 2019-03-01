const docker = require('./index');
const { appLogger } = require('../../config/winston');
const applicationController = require('../application');

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
			await applicationController.update(user, appName, {
				autostart: true
			});
		}
		// return applicationController.findByAppName();
	}

	async stopContainer(user, { appName }) {
		const containerName = this.getContainerName(user, { appName });
		const foundContainer = await docker.getContainer(containerName);
		const inspectedContainer = await foundContainer.inspect();
		console.log(inspectedContainer);
		if (inspectedContainer.State.Running) {
			await foundContainer.stop();
			await applicationController.update(user, appName, {
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

	// eslint-disable-next-line
	async createContainer(user, { appName, imageName, env, labels }) {
		const containerName = this.getContainerName(user, { appName });
		const createContainerOpts = {
			Image: imageName,
			name: containerName
			// Env: [`MONGO=${mongoContainerName}`]
		};
		if (env) {
			createContainerOpts.Env = env;
		}
		if (labels) {
			console.log(labels);
			createContainerOpts.Labels = labels;
		}

		return docker.createContainer(createContainerOpts);
	}

	async createMongoContainer(user, { appName }) {
		const containerName = this.getContainerName(user, { appName });
		try {
			const oldContainer = await docker.getContainer(containerName);
			await oldContainer.inspect();
			appLogger.info(`found existing mongo container for user ${user.email}.`);
			return oldContainer;
		} catch (error) {
			if (error.statusCode === 404) {
				const newContainer = await this.createContainer(user, {
					imageName: 'mvertes/alpine-mongo:4.0.5-0',
					appName
				});
				appLogger.info(`created mongo container for user ${user.email}.`);
				return newContainer;
			}
			return Promise.reject(error);
		}
	}

	async createMongoExpressContainer(user, { appName }) {
		const containerName = this.getContainerName(user, { appName });
		const mongoContainerName = this.getContainerName(user, { appName: 'mongoDB' });
		try {
			const oldContainer = await docker.getContainer(containerName);
			await oldContainer.inspect();
			appLogger.info(`found existing mongo-express container for user ${user.email}.`);
			return oldContainer;
		} catch (error) {
			if (error.statusCode === 404) {
				const newContainer = await this.createContainer(user, {
					imageName: 'mongo-express:0.49',
					appName,
					env: [
						'ME_CONFIG_MONGODB_ENABLE_ADMIN=true',
						`ME_CONFIG_MONGODB_SERVER=${mongoContainerName}`,
						`ME_CONFIG_SITE_BASEURL=/mongo/${user.email.split('@')[0]}/`
					],
					labels: {
						'traefik.enable': 'true',
						'traefik.backend': `/mongo/${user.email.split('@')[0]}`,
						'traefik.docker.network': 'traefik',
						'traefik.frontend.rule': `Host:cloudhost.localhost;PathPrefix:/mongo/${
							user.email.split('@')[0]
						}`,
						'traefik.frontend.auth.forward.address': `${process.env.BACKEND}auth/mongoexpress`,
						'traefik.port': '8081'
					}
				});
				appLogger.info(`created mongo-express container for user ${user.email}.`);
				return newContainer;
			}
			return Promise.reject(error);
		}
	}

	async startAllRunningContainers() {
		const applications = await applicationController.findAllRunningContainers();
		// eslint-disable-next-line
		console.log({ applications });
		return applications.reduce(async (promise, application) => {
			await promise;

			const { appName, user_id } = application; // eslint-disable-line
			const containerName = this.getContainerName({ userName: user_id.split('@')[0] }, { appName });
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
		}, Promise.resolve());
	}
}

module.exports = new ContainerController();
