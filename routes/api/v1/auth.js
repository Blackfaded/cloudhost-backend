const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const axios = require('../../../config/axios');
const config = require('../../../config/connections');
const userController = require('../../../controllers/user');
const { isAdmin } = require('../../../middlewares/roles');
const { appLogger } = require('../../../config/winston');

const router = express.Router();

router.post('/', async (req, res) => {
	const { username, password } = req.body;
	try {
		// Usertoken von Gitlab holen
		const {
			data: { access_token: accessToken }
		} = await axios.post('oauth/token', {
			grant_type: 'password',
			client_id: config.gitlab.app_id,
			client_secret: config.gitlab.app_secret,
			username,
			password
		});

		// User mit Token von Gitlab holen
		try {
			const { data: user } = await axios.get('api/v4/user', {
				headers: {
					Authorization: `Bearer ${accessToken}`
				}
			});
			user.accessToken = accessToken;

			// Finde oder erstelle Nutzer
			const updatedOrCreatedUser = await userController.createOrUpdateUser(user);

			// Erstelle Nutzertoken
			const userToken = {
				email: updatedOrCreatedUser.email
			};

			// Signiere Nutzertoken
			const token = jwt.sign(userToken, config.jwt.secret);

			// Wenn Nutzer aktiv ist sende Token zum Client
			if (updatedOrCreatedUser.active) {
				return res.json({ token });
			}

			// Ansonsten 401
			return res.boom.unauthorized('Your account is not active');
		} catch (error) {
			// Bei einem Fehler sende 401
			appLogger.error(error);
			return res.boom.unauthorized('An error occured while creating or updating the user');
		}
	} catch (e) {
		// Bei einem Fehler sende 401
		appLogger.error(e);
		return res.boom.unauthorized('Invalid Credentials');
	}
});

// passport liest den Nutzer aus dem Cookie (siehe Passport)
router.get('/mongoexpress', passport.authenticate('jwt', { session: false }), (req, res) => {
	try {
		// Nutzername des Clients der anfragt
		const user = req.user.email.split('@')[0];

		/* Nutzername des angefragenten Nutzers. Die URL, die angefragt wurde wird von Traefik in den
		 * x-forwarded-uri Header geschrieben, z.B.: cloudhost.hsrw.eu/mongo/john.doe
		 * in der Variablen accessedUser steht nun 'john.doe' */
		const accessedUser = req.headers['x-forwarded-uri'].split('/')[2];

		// Wenn die Nutzernamen übereinstimmen wird ein HTTP Statuscode 200 gesendet.
		if (user === accessedUser) {
			return res.status(200).send();
		}

		/* Bei Nichtübereinstimmung wird eine 401 gesendet und Traefik leitet diesen weiter an den Client,
		 * der nun keinen Zugriff auf den Mongo-Express Service bekommt */
		return res.boom.unauthorized();
	} catch (error) {
		appLogger.error(error);
		// Tritt ein Fehler auf wird der Request ebenfalls nicht weiter ausgeführt
		return res.boom.unauthorized();
	}
});

/* Zuerst wird über passport.authenticate der Nutzer authentifiziert und über die Middleware 'isAdmin' geprüft,
 * ob dieser Berechtigt ist auf die Portainer Instanz zuzugreifen.
 */
router.get('/portainer', passport.authenticate('jwt', { session: false }), isAdmin, (req, res) => {
	try {
		return res.status(200).send();
	} catch (error) {
		appLogger.error(error);
		return res.boom.unauthorized();
	}
});

module.exports = router;
