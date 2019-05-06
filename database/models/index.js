const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const config = require('../../config/connections');

// Hole Datenbank-Name, Nutzer und Passwort aus der Konfigurationsdatei
const {
	db: { name, user, password }
} = config;

const basename = path.basename(__filename);

const db = {};

// Initialisiere Sequelize mit Konfiguration
const sequelize = new Sequelize(name, user, password, {
	host: 'mysql',
	dialect: 'mysql'
});

/* Lese alle Dateien im momentanen Verzeichnis und Filtere die index.js und
 * Dateien, die nicht auf .js enden heraus */

fs
	.readdirSync(__dirname)
	.filter((file) => file.indexOf('.') !== 0 && file !== basename && file.slice(-3) === '.js')
	.forEach((file) => {
		// Importiere Models in Sequelize
		const model = sequelize.import(path.join(__dirname, file));
		db[model.name] = model;
	});

// Stelle Beziehungen der Models her
Object.keys(db).forEach((modelName) => {
	if (db[modelName].associate) {
		db[modelName].associate(db);
	}
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
