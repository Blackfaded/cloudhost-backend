const express = require('express');
const api = require('./api/v1');
const auth = require('./auth');

const router = express.Router();

router.use('/auth', auth);
router.use('/api/v1', api);

module.exports = router;
