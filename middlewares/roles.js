/**
 * @module Middlewares
 */

/**
 * Check if current user is an admin
 * @name isAdmin
 * @function
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @return {undefined}
 */
async function isAdmin(req, res, next) {
	try {
		if (req.user.roles.some((role) => role.name === 'admin')) {
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
