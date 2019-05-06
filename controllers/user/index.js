const moment = require('moment');
const models = require('../../database/models');
const roleController = require('../roles');

/** Class that controls the user */
class UserController {
	/**
	 * Cleans up user for response
	 * @param {object} user The sequelize user object
	 * @returns {object} user json
	 */
	cleanupUser(user) {
		const plainUser = user.get({ plain: true });
		const cleanedUser = {
			...plainUser,
			roles: plainUser.roles.map((role) => role.name)
		};
		delete cleanedUser.gitlabAccessToken;
		return cleanedUser;
	}

	/**
	 * Gets users name
	 * @param {object} user The sequelize user object
	 * @returns {string} The username
	 */
	getUserName(user) {
		return user.email.split('@')[0];
	}

	/**
	 * Creates or updates a user
	 * @param {object} user Gitlabs response of the user object
	 * @returns {Promise.<String>} The sequelize user object
	 */
	async createOrUpdateUser(user) {
		const uservalues = {
			email: user.email,
			gitlabId: user.id,
			gitlabAccessToken: user.accessToken,
			username: user.name,
			lastLogin: moment(),
			profilePictureUrl: user.avatar_url
		};
		const allUsers = await this.findAllUsers();

		const rolesToAssign = ['user'];
		if (!allUsers.length) {
			rolesToAssign.push('admin');
		}

		// Try to find a user
		let foundUser = await this.findUserByEmail(user.email);

		// if no user found create one
		if (!foundUser) {
			foundUser = await models.User.create(uservalues);
			// if user found update it
		} else {
			foundUser = await foundUser.update(uservalues);
		}

		// find roles to assign to user
		const roles = await roleController.findRoles(rolesToAssign);

		// set user roles
		await foundUser.addRoles(roles);

		// return updated user
		return this.findUserByEmail(user.email);
	}

	/**
	 * Finds user in database
	 * @example
	 * const user = req.user
	 * @param {object} user The user object
	 * @returns {Promise.<Object>} The sequelize user object
	 */
	findUser(user) {
		return this.findUserByEmail(user.email);
	}

	/**
	 * Finds user by email in database
	 * @example
	 * const user = "john.doe@foo.bar"
	 * @param {string} email The users email
	 * @returns {Promise.<Object>} The sequelize user object
	 */
	findUserByEmail(email) {
		return models.User.findOne({
			where: {
				email
			},
			include: [{ model: models.Role, as: 'roles' }]
		});
	}

	/**
	 * Finds all users in database
	 * @returns {Promise.<Array.<Object>>} The sequelize users objects in array
	 */
	findAllUsers() {
		return models.User.findAll({
			include: [{ model: models.Role, as: 'roles' }]
		});
	}

	/**
	 * Finds all users with mongoDB running in database
	 * @returns {Promise.<Array.<Object>>} The sequelize users objects in array
	 */
	findAllMongoContainers() {
		return models.User.findAll({
			where: {
				hasMongoDB: {
					[models.Sequelize.Op.ne]: false
				}
			}
		});
	}

	/**
	 * Update user by email in database
	 * @param {string} email Users email
	 * @param {object} data Values to be updated
	 * @returns {Promise.<Object>} The sequelize users object
	 */
	async updateUserFieldsByEmail(email, data) {
		const user = await this.findUserByEmail(email);
		return user.update(data);
	}

	/**
	 * Deletes userrole by email in database
	 * @param {string} email Users email
	 * @param {string} role The name of the role to be removed
	 * @returns {Promise.<Object>} The sequelize users object
	 */
	async deleteUserRole(email, role) {
		const user = await this.findUserByEmail(email);
		const foundRole = await roleController.findRoles([role]);
		await user.removeRole(foundRole);
		return this.findUserByEmail(email);
	}

	/**
	 * Adds userrole by email in database
	 * @param {string} email Users email
	 * @param {string} role The name of the role to be added
	 * @returns {Promise.<Object>} The sequelize users object
	 */
	async addUserRole(email, role, grantedBy) {
		const user = await this.findUserByEmail(email);
		const foundRole = await roleController.findRoles([role]);
		await user.addRole(foundRole, { through: { grantedBy_id: grantedBy } });
		return this.findUserByEmail(email);
	}
}

module.exports = new UserController();
