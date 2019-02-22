const moment = require('moment');
const models = require('../../database/models');
const { findUserByEmail } = require('./index');
const { findRoles } = require('../roles');

module.exports = async (user) => {
	const uservalues = {
		email: user.email,
		gitlabId: user.id,
		gitlabAccessToken: user.accessToken,
		username: user.name,
		lastLogin: moment(),
		profilePictureUrl: user.avatar_url
	};

	const rolesToAssign = ['user'];


	try {
		// Try to find a user
		let foundUser = await findUserByEmail(user.email);

		// if no user found create one
		if (!foundUser) {
			foundUser = await models.User.create(uservalues);
			// if user found update it
		} else {
			foundUser = await foundUser.update(uservalues);
		}

		// find roles to assign to user
		const roles = await findRoles(rolesToAssign);
		console.log({ roles });
		// set user roles
		await foundUser.addRoles(roles);

		// return updated user
		return findUserByEmail(user.email);
	} catch (e) {
		throw e;
	}
};
