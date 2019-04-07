async function isAdmin(req, res, next) {
	try {
		if (
			req.user.roles.some((role) => role.name === 'admin') ||
			(process.env.NODE_ENV === 'development' && req.user.email === 'rene.heinen@hsrw.org')
		) {
			next();
		} else {
			res.boom.forbidden("You don't have the required role");
		}
	} catch (error) {
		res.boom.badImplementation();
	}
}

module.exports = {
	isAdmin
};
