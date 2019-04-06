const models = require('../../database/models');
const { findRoles } = require('../roles');

class UserController {
	cleanupUser(user) {
		const plainUser = user.get({ plain: true });
		const cleanedUser = {
			...plainUser,
			roles: plainUser.roles.map((role) => role.name)
		};
		delete cleanedUser.gitlabAccessToken;
		return cleanedUser;
	}

	getUserName(user) {
		return user.email.split('@')[0];
	}

	findUser(user) {
		return this.findUserByEmail(user.email);
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

	findAllMongoContainers() {
		return models.User.findAll({
			where: {
				hasMongoDB: {
					[models.Sequelize.Op.ne]: false
				}
			}
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
