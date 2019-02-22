async function isAdmin(req, res, next) {
	if (
		req.user.roles.some((role) => role.name === 'admin') ||
		(process.env.NODE_ENV === 'development' && req.user.email === 'rene.heinen@hsrw.org')
	) {
		next();
	} else {
		res.boom.forbidden("You don't have the required role");
	}
}

module.exports = {
	isAdmin
};
