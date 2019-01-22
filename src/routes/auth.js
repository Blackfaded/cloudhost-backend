import express from 'express';
import jwt from 'jsonwebtoken';
import moment from 'moment';
import axios from '@/config/axios';
import models from '@/database/models';

console.log(models.User);

const router = express.Router();

router.post('/', async (req, res) => {
	const { accessToken } = req.body;
	const { data: user } = await axios.get('api/v4/user', {
		headers: {
			Authorization: `Bearer ${accessToken}`
		}
	});
	try {
		models.User.upsert({
			email: user.email,
			gitlabId: user.id,
			username: user.name,
			lastLogin: moment()
		});
	} catch (e) {
		console.log(e);
	}

	// Find or create user in DB
	const userToken = {
		id: user.email,
		accessToken
	};
	const token = jwt.sign(userToken, 'secret');
	res.json({ token });
});

export default router;
