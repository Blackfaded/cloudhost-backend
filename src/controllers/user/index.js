const models = require('../../database/models');

function findUserByEmail(email) {
	return models.User.findOne({
		where: {
			email
		},
		include: [{ model: models.Role, as: 'roles' }]
	});
}

async function findUserByEmailPlain(email) {
	return (await findUserByEmail(email)).get({ plain: true });
}
module.exports = {
	findUserByEmail,
	findUserByEmailPlain
};
