const { findUserByEmail } = require('../user');
const models = require('../../database/models');

class ApplicationController {
	async createApplication(user, applicationValues) {
		const foundUser = await findUserByEmail(user.email);
		try {
			const app = await models.Application.create(applicationValues);
			await foundUser.addApplication(app);
			return app;
		} catch (error) {
			console.log({ error });
			throw error;
		}
	}

	findAll() {
		return models.Application.findAll();
	}

	findByImageName(imageName) {
		return models.Application.findAll({
			where: {
				imageName
			}
		});
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

	async destroyByMountPath(user, mountPath) {
		const { email } = user;
		const foundUser = await findUserByEmail(email);
		const foundApps = await foundUser.getApplications({
			where: {
				mountPath
			}
		});
		if (foundApps.length) {
			foundApps.forEach(async (app) => {
				await app.destroy();
			});
		}
	}
}

module.exports = new ApplicationController();
