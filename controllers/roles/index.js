const models = require('../../database/models');

/** Class that controls the roles */
class RoleController {
	/**
	 * Returns sequelize role models
	 * @example
	 * const roles = ['user', 'admin']
	 * @param {Array.<String>} roles The roles
	 * @returns {Promise.<Object>} sequelize role models
	 */
	findRoles(roles) {
		return models.Role.findAll({
			where: {
				name: {
					[models.Sequelize.Op.or]: roles
				}
			}
		});
	}
}

module.exports = new RoleController();
