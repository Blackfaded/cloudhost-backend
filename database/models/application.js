module.exports = (sequelize, DataTypes) => {
	const Application = sequelize.define('Application', {
		// Pfad unter dem die App erreichbar sein soll
		mountPath: {
			type: DataTypes.STRING,
			allowNull: false,
			primaryKey: true
		},
		// Name der App
		appName: {
			type: DataTypes.STRING,
			allowNull: false
		},
		// Name des Repositories, aus dem die App gebau wird
		repositoryName: {
			type: DataTypes.STRING,
			allowNull: false
		},
		// ID des Repositories, aus dem die App gebau wird
		repositoryId: {
			type: DataTypes.INTEGER,
			allowNull: false
		},
		// Branch des Repositories, aus dem die App gebau wird
		repositoryBranch: {
			type: DataTypes.STRING,
			allowNull: false
		},
		// Script aus der Package.json, das gestartet werden soll.
		runScript: {
			type: DataTypes.STRING,
			allowNull: false
		},
		// Optionales Script aus der Package.json, das während der Buildzeit ausgeführt wird
		buildScript: {
			type: DataTypes.STRING,
			allowNull: true
		},
		// Indikator, ob die Applikation läuft
		running: {
			type: DataTypes.BOOLEAN,
			defaultValue: true
		}
	});

	// Beziehungen
	Application.associate = (models) => {
		// Eine Applikation gehört zu genau einem Nutzer
		models.Application.belongsTo(models.User, { foreignKey: 'user_id' });
	};

	return Application;
};
