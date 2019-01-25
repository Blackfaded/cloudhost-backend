const axios = require('axios');
const connections = require('./connections');

const instance = axios.create({
	baseURL: connections.gitlab.domain
});

module.exports = instance;
