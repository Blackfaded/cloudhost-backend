const models = require('../../database/models');
const { findRoles } = require('../roles');

function findUserByEmail(email) {
	return models.User.findOne({
		where: {
			email
		},
		include: [{ model: models.Role, as: 'roles' }]
	});
}

function findAllUsers() {
	return models.User.findAll({
		include: [{ model: models.Role, as: 'roles' }]
	});
}

async function updateUserFieldsByEmail(email, data) {
	const user = await findUserByEmail(email);
	return user.update(data);
}

async function deleteUserRole(email, role) {
	const user = await findUserByEmail(email);
	const foundRole = await findRoles([role]);
	await user.removeRole(foundRole);
	return findUserByEmail(email);
}

async function addUserRole(email, role, grantedBy) {
	const user = await findUserByEmail(email);
	const foundRole = await findRoles([role]);
	await user.addRole(foundRole, { through: { grantedBy_id: grantedBy } });
	return findUserByEmail(email);
}

module.exports = {
	findUserByEmail,
	findAllUsers,
	updateUserFieldsByEmail,
	deleteUserRole,
	addUserRole
};
