const models = require('../../database/models');

class RoleController {
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
