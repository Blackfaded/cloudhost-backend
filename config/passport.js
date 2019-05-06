const passport = require('passport');
const { Strategy: JwtStrategy } = require('passport-jwt');
const config = require('../config/connections');

const { findUserByEmail } = require('../controllers/user');

module.exports = (app) => {
	// initialisiert Passport
	app.use(passport.initialize());

	const opts = {};
	// Hilfsfunktion, die den JWT aus dem express Request-Objekt parst
	opts.jwtFromRequest = (req) => {
		try {
			return req.cookies.jwt;
		} catch (error) {
			return null;
		}
	};

	// Secret um den JWT zu verifizieren und zu decoden
	opts.secretOrKey = config.jwt.secret;

	passport.use(
		// eslint-disable-next-line
		new JwtStrategy(opts, async (jwt_payload, done) => {
			try {
				// Suche den Nutzer mit der Email des JWTs in der Datenbank
				const user = (await findUserByEmail(jwt_payload.email)).get({ plain: true });
				user.userName = user.email.split('@')[0]; // eslint-disable-line
				/* Wenn der Nutzer das Flag active hat wird das Nutzerobjekt während dieses
				 * Requests unter req.user verfügbar sein. */

				if (user.active) {
					return done(null, user);
				}

				/* Wenn der Nutzer nicht das Flag active besitzt wird dieser Request mit dem
				 * HTTP Statuscode 401 beendet (der zweite Parameter 'false' gibt an, dass die
				 * Anfrage nicht autorisiert ist) */

				return done(null, false);
			} catch (error) {
				// Bei einem Fehler wird ebenfalls eine 401 an den Client gesendet
				return done(null, false);
			}
		})
	);
};
