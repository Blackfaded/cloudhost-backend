const passport = require('passport');
const { Strategy: JwtStrategy } = require('passport-jwt');
const config = require('../config/connections');

const { findUserByEmail } = require('../controllers/user');

module.exports = (app) => {
	app.use(passport.initialize());

	const opts = {};
	opts.jwtFromRequest = (req) => {
		try {
			return req.cookies.jwt;
		} catch (error) {
			return null;
		}
	};
	opts.secretOrKey = config.jwt.secret;

	passport.use(
		// eslint-disable-next-line
		new JwtStrategy(opts, async (jwt_payload, done) => {
			try {
				const user = (await findUserByEmail(jwt_payload.email)).get({ plain: true });
				user.userName = user.email.split('@')[0]; // eslint-disable-line
				if (user.active) {
					return done(null, user);
				}
				return done(null, false);
			} catch (error) {
				return done(null, false);
			}
		})
	);
};
