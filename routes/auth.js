const express = require('express');
const jwt = require('jsonwebtoken');
const axios = require('../config/axios');
const config = require('../config/connections');
const createOrUpdateUser = require('../controllers/user/createOrUpdateUser');

console.log(config);
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
			console.log(user);
			user.accessToken = accessToken;

			const updatedOrCreatedUser = (await createOrUpdateUser(user)).get({ plain: true });

			// Find or create user in DB
			const userToken = {
				email: updatedOrCreatedUser.email
			};

			const token = jwt.sign(userToken, 'secret');
			res.json({ token });
		} catch (error) {
			res.boom.unauthorized('An error occured while creating or updating the user');
		}
	} catch (e) {
		res.boom.unauthorized('Invalid Credentials');
	}
});

module.exports = router;
