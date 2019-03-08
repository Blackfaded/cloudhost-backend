const express = require('express');
const jwt = require('jsonwebtoken');
const axios = require('../../../config/axios');
const config = require('../../../config/connections');
const createOrUpdateUser = require('../../../controllers/user/createOrUpdateUser');

const router = express.Router();

router.post('/', async (req, res) => {
	console.log('yfd');
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
			console.log('ok');
			const token = jwt.sign(userToken, config.jwt.secret);

			res.json({ token });
		} catch (error) {
			console.log(error);
			res.boom.unauthorized('An error occured while creating or updating the user');
		}
	} catch (e) {
		res.boom.unauthorized('Invalid Credentials');
	}
});

router.get('/mongoexpress', (req, res) => {
	try {
		const decoded = jwt.verify(req.cookies.jwt, config.jwt.secret);
		const user = decoded.email.split('@')[0];
		console.log(req.headers);
		const accessedUser = req.headers['x-forwarded-uri'].split('/')[2];
		if (user === accessedUser) {
			console.log('user matches');
			return res.status(200).send();
		}
		return res.boom.unauthorized();
	} catch (error) {
		return res.boom.unauthorized();
	}
});

module.exports = router;
