const passport = require('passport');
const { Strategy: JwtStrategy } = require('passport-jwt');
const { findUserByEmailPlain } = require('../controllers/user');

module.exports = (app) => {
	app.use(passport.initialize());

	const opts = {};
	opts.jwtFromRequest = (req) => {
		try {
			const header = req.headers.authorization.split(' ');
			return header[0] === 'bearer' || header[0] === 'Bearer' ? header[1] : null;
		} catch (error) {
			return null;
		}
	};
	opts.secretOrKey = 'secret';

	passport.use(
		// eslint-disable-next-line
		new JwtStrategy(opts, async (jwt_payload, done) => {
			try {
				const user = await findUserByEmailPlain(jwt_payload.email);
				return done(null, user);
			} catch (error) {
				return done(null, false);
			}
		})
	);
};
