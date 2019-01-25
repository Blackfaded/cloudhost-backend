const models = require('../../database/models');

function findRoles(roles) {
	return models.Role.findAll({
		where: {
			name: {
				[models.Sequelize.Op.or]: roles
			}
		}
	});
}

module.exports = {
	findRoles
};
