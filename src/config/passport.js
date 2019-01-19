import passport from 'passport';

export default (app) => {
	app.use(passport.initialize());

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
