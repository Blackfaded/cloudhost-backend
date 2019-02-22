const { findUserByEmail } = require('../user');
const models = require('../../database/models');

class ApplicationController {
	async createApplication(user, applicationValues) {
		const foundUser = await findUserByEmail(user.email);
		try {
			const app = await models.Application.create(applicationValues);
			await foundUser.addApplication(app);
		} catch (error) {
			console.log({ error });
		}
	}
}

module.exports = new ApplicationController();
