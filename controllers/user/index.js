const models = require('../../database/models');
const { findRoles } = require('../roles');

class UserController {
	getUserName(user) {
		return user.email.split('@')[0];
	}

	findUserByEmail(email) {
		return models.User.findOne({
			where: {
				email
			},
			include: [{ model: models.Role, as: 'roles' }]
		});
	}

	findAllUsers() {
		return models.User.findAll({
			include: [{ model: models.Role, as: 'roles' }]
		});
	}

	async updateUserFieldsByEmail(email, data) {
		const user = await this.findUserByEmail(email);
		return user.update(data);
	}

	async deleteUserRole(email, role) {
		const user = await this.findUserByEmail(email);
		const foundRole = await findRoles([role]);
		await user.removeRole(foundRole);
		return this.findUserByEmail(email);
	}

	async addUserRole(email, role, grantedBy) {
		const user = await this.findUserByEmail(email);
		const foundRole = await findRoles([role]);
		await user.addRole(foundRole, { through: { grantedBy_id: grantedBy } });
		return this.findUserByEmail(email);
	}
}

module.exports = new UserController();
