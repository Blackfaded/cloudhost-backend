const express = require('express');
const jwt = require('jsonwebtoken');
const axios = require('../config/axios');
const createOrUpdateUser = require('../controllers/user/createOrUpdateUser');

const router = express.Router();

router.post('/', async (req, res) => {
	const { accessToken } = req.body;
	const { data: user } = await axios.get('api/v4/user', {
		headers: {
			Authorization: `Bearer ${accessToken}`
		}
	});

	user.accessToken = accessToken;

	try {
		const updatedOrCreatedUser = (await createOrUpdateUser(user)).get({ plain: true });

		// Find or create user in DB
		const userToken = {
			email: updatedOrCreatedUser.email,
			roles: updatedOrCreatedUser.roles.map((role) => role.name)
		};

		console.log(userToken.roles);
		const token = jwt.sign(userToken, 'secret');
		res.json({ token });
	} catch (error) {
		console.log(error);
	}
});

module.exports = router;
