const docker = require('./index');
const { appLogger } = require('../../config/winston');
const applicationController = require('../application');
const userController = require('../user');
const { host } = require('../../config/connections');

class ContainerController {
	getContainerName(user, appName) {
		const { userName } = user;
		return `${userName}-${appName}`;
	}

	async startApplicationContainer(user, appName) {
		const containerName = this.getContainerName(user, appName);
		const foundContainer = await docker.getContainer(containerName);
		const inspectedContainer = await foundContainer.inspect();
		if (!inspectedContainer.State.Running) {
			await foundContainer.start();
		}
	}

	async stopApplicationContainer(user, appName) {
		const containerName = this.getContainerName(user, appName);
		const foundContainer = await docker.getContainer(containerName);
		const inspectedContainer = await foundContainer.inspect();
		if (inspectedContainer.State.Running) {
			await foundContainer.stop();
		}
	}

	async removeContainer(user, appName) {
		try {
			const containerName = this.getContainerName(user, appName);
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
		const containerName = this.getContainerName(user, appName);
		const createContainerOpts = {
			Image: imageName,
			name: containerName
			// Env: [`MONGO=${mongoContainerName}`]
		};
		if (env) {
			createContainerOpts.Env = env;
		}
		if (labels) {
			createContainerOpts.Labels = labels;
		}

		return docker.createContainer(createContainerOpts);
	}

	async createMongoContainer(user, appName) {
		const containerName = this.getContainerName(user, appName);
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

	async createMongoExpressContainer(user, appName) {
		const containerName = this.getContainerName(user, appName);
		const mongoContainerName = this.getContainerName(user, 'mongoDB');
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
						'traefik.frontend.rule': `Host:${host};PathPrefix:/mongo/${user.email.split('@')[0]}`,
						'traefik.frontend.auth.forward.address': `${process.env.BACKEND}/auth/mongoexpress`,
						'traefik.port': '8081'
					}
				});
				appLogger.info(`created mongo-express container for user ${user.email}.`);
				return newContainer;
			}
			return Promise.reject(error);
		}
	}

	async startAllRunningUserContainers() {
		const applications = await applicationController.findAllRunningContainers();
		// eslint-disable-next-line
		return applications.reduce(async (promise, application) => {
			await promise;

			const { appName, user_id } = application; // eslint-disable-line
			const userName = user_id.split('@')[0];
			const containerName = this.getContainerName({ userName }, appName);
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
					appLogger.info(
						`Container with id ${containerName} found in Database, but not as a container.
						 Removing application from Database`
					);
					// remove not existing containers from DB
					await applicationController.destroyByContainerName(user_id, appName);
					Promise.resolve();
				} else {
					Promise.reject();
				}
			}
		}, Promise.resolve());
	}

	async startAllMongoContainers() {
		const users = await userController.findAllMongoContainers();
		// eslint-disable-next-line
		return users.reduce(async (promise, user) => {
			await promise;

			try {
				const mongoContainerName = this.getContainerName(
					{ userName: userController.getUserName(user) },
					'mongoDB'
				);
				const foundMongoContainer = await docker.getContainer(mongoContainerName);
				const inspectedMongoContainer = await foundMongoContainer.inspect();
				if (!inspectedMongoContainer.State.Running) {
					await foundMongoContainer.start();
					appLogger.info(`started mongo container from user ${user.email}`);
				} else {
					appLogger.info(`mongo container from user ${user.email} is already running`);
				}

				const mongoExpressContainerName = this.getContainerName(
					{ userName: userController.getUserName(user) },
					'mongoExpress'
				);
				const foundMongExpressContainer = await docker.getContainer(mongoExpressContainerName);
				const inspectedMongoExpressContainer = await foundMongExpressContainer.inspect();
				if (!inspectedMongoExpressContainer.State.Running) {
					await foundMongExpressContainer.start();
					appLogger.info(`started mongo-express container from user ${user.email}`);
				} else {
					appLogger.info(`mongo-express container from user ${user.email} is already running`);
				}
			} catch (error) {
				if (error.statusCode === 404) {
					await userController.updateUserFieldsByEmail(user.email, { hasMongoDB: false });
					appLogger.info(
						'Found mongo container in database but no container was found. Removing mongoDB from database'
					);
					Promise.resolve();
				} else {
					Promise.reject();
				}
			}
		}, Promise.resolve());
	}
}

module.exports = new ContainerController();
