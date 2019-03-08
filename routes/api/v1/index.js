const express = require('express');
const passport = require('passport');
const auth = require('./auth');
const users = require('./users');
const repositories = require('./repositories');
const applications = require('./applications');

const router = express.Router();

router.get('/', async (req, res) => {
	res.json({ api: 'v1' }).status(200);
});

router.use('/auth', auth);

router.use(passport.authenticate('jwt', { session: false }));

router.use('/users', users);
router.use('/repositories', repositories);
router.use('/applications', applications);

module.exports = router;
