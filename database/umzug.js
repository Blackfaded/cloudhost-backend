const path = require('path');
const Umzug = require('umzug');
const db = require('./models');

const umzug = new Umzug({
	storage: 'sequelize',
	storageOptions: {
		sequelize: db.sequelize
	},

	// Optionen der Migrationen
	migrations: {
		params: [
			db.sequelize.getQueryInterface(), // queryInterface
			db.Sequelize.constructor // DataTypes
		],
		path: path.join(__dirname, './migrations'),
		pattern: /\.js$/
	}
});

module.exports = umzug;
