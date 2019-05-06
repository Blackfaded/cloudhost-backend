const axios = require('axios');
const connections = require('./connections');

// Setze die Base-URL auf die Adresse der Gitlab Domain
const instance = axios.create({
	baseURL: connections.gitlab.domain
});

module.exports = instance;
