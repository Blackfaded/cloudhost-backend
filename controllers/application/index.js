const { findUserByEmail } = require('../user');
const models = require('../../database/models');
const imagesController = require('../docker/images');

class ApplicationController {
	// eslint-disable-next-line
	async createApplication(user, { appName, repositoryId, repositoryBranch, repositoryName }) {
		const mountPath = imagesController.getMountPath(user, { appName });
		const foundUser = await findUserByEmail(user.email);
		try {
			const app = await models.Application.create({
				mountPath,
				appName,
				repositoryId,
				repositoryBranch,
				repositoryName
			});
			await foundUser.addApplication(app);
			return app;
		} catch (error) {
			console.log({ error });
			throw error;
		}
	}

	findAll(options = {}) {
		return models.Application.findAll(options);
	}

	findAllRunningContainers() {
		return this.findAll({
			where: {
				running: true
			}
		});
	}

	findAllByUser(user) {
		const { email } = user;
		return models.Application.findAll({
			where: {
				user_id: email
			}
		});
	}

	update(user, appName, values) {
		const { email } = user;
		return models.Application.update(values, { returning: true, where: { user_id: email, appName } });
	}

	async findByAppName(user, appName) {
		const { email } = user;
		const foundUser = await findUserByEmail(email);
		return foundUser.getApplications({
			where: {
				appName
			}
		});
	}

	async destroyByAppName(user, appName) {
		const { email } = user;
		const foundUser = await findUserByEmail(email);
		const foundApps = await foundUser.getApplications({
			where: {
				appName
			}
		});
		if (foundApps.length) {
			await foundApps.reduce(async (promise, app) => {
				await promise;
				await app.destroy();
			}, Promise.resolve());
		}
	}
}

module.exports = new ApplicationController();
