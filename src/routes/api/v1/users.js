const express = require('express');

const router = express.Router();

router.get('/', async (req, res) => {
	console.log('auth');
	res.json({ user: req.user }).status(200);
});

module.exports = router;
