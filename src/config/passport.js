import passport from 'passport';

import { Strategy as JwtStrategy } from 'passport-jwt';

export default (app) => {
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
		new JwtStrategy(opts, (jwt_payload, done) => {
			console.log(jwt_payload);
			done(null, jwt_payload);
		})
	);

	/**
	 * This function will be executed after a succuessful login and the user object
     * returned from passport.
	 * The callback done(null, user.id) specifies which information of the user will
     * be save in the cookie to identify the user afterwards.

	passport.serializeUser((user, done) => {
		log('Serialize User ', user);
		done(null, user.id);
    });
    */

	/**
	 * deserializeUser will search the user in the database with parameters defined in serializeUser
	 * and save the found user object in req.user

	passport.deserializeUser((id, done) => {
		User.findById(id, (err, user) => {
			done(err, user);
		});
    });
    	 */
};
