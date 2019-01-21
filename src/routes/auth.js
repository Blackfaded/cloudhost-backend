import express from 'express';
import jwt from 'jsonwebtoken';
import axios from '@/config/axios';

const router = express.Router();

router.post('/', async (req, res) => {
	const { accessToken } = req.body;
	const { data: user } = await axios.get('api/v4/user', {
		headers: {
			Authorization: `Bearer ${accessToken}`
		}
	});

	// Find or create user in DB
	const userToken = {
		id: user.email,
		accessToken
	};
	const token = jwt.sign(userToken, 'secret');
	res.json({ token });
});

export default router;
