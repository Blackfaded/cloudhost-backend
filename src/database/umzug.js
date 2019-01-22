import path from 'path';
import Umzug from 'umzug';
import db from './models';

const umzug = new Umzug({
	storage: 'sequelize',
	storageOptions: {
		sequelize: db.sequelize
	},
	migrations: {
		params: [
			db.sequelize.getQueryInterface(), // queryInterface
			db.Sequelize.constructor // DataTypes
		],
		path: path.join(__dirname, './migrations'),
		pattern: /\.js$/
	}
});

export default umzug;
