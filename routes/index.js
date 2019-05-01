const express = require('express');
const api = require('./api/v1');

const router = express.Router();

router.use('/', api);

module.exports = router;
