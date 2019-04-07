const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const axios = require('../../../config/axios');
const config = require('../../../config/connections');
const createOrUpdateUser = require('../../../controllers/user/createOrUpdateUser');
const { isAdmin } = require('../../../middlewares/roles');

const router = express.Router();

router.post('/', async (req, res) => {
	const { username, password } = req.body;
	try {
		const {
			data: { access_token: accessToken }
		} = await axios.post('oauth/token', {
			grant_type: 'password',
			client_id: config.gitlab.app_id,
			client_secret: config.gitlab.app_secret,
			username,
			password
		});

		try {
			const { data: user } = await axios.get('api/v4/user', {
				headers: {
					Authorization: `Bearer ${accessToken}`
				}
			});
			user.accessToken = accessToken;

			const updatedOrCreatedUser = await createOrUpdateUser(user);

			// Find or create user in DB
			const userToken = {
				email: updatedOrCreatedUser.email
			};
			const token = jwt.sign(userToken, config.jwt.secret);

			if (updatedOrCreatedUser.active) {
				return res.json({ token });
			}
			return res.boom.unauthorized('Your account is not active');
		} catch (error) {
			console.log(error);
			return res.boom.unauthorized('An error occured while creating or updating the user');
		}
	} catch (e) {
		return res.boom.unauthorized('Invalid Credentials');
	}
});

router.get('/mongoexpress', passport.authenticate('jwt', { session: false }), (req, res) => {
	try {
		const user = req.user.email.split('@')[0];
		const accessedUser = req.headers['x-forwarded-uri'].split('/')[2];
		if (user === accessedUser) {
			return res.status(200).send();
		}
		return res.boom.unauthorized();
	} catch (error) {
		return res.boom.unauthorized();
	}
});

router.get('/portainer', passport.authenticate('jwt', { session: false }), isAdmin, (req, res) => {
	try {
		return res.status(200).send();
	} catch (error) {
		return res.boom.unauthorized();
	}
});

module.exports = router;
