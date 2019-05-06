module.exports = (sequelize, DataTypes) => {
	const User = sequelize.define('User', {
		// Email-Adresse des Nutzers
		email: {
			type: DataTypes.STRING,
			primaryKey: true,
			allowNull: false
		},
		// Gitlab-ID des Nutzers
		gitlabId: {
			type: DataTypes.INTEGER,
			allowNull: false
		},
		// Gitlab-Access-Token des Nutzers
		gitlabAccessToken: {
			type: DataTypes.STRING,
			allowNull: false
		},
		// Name des Nutzers
		username: {
			type: DataTypes.STRING,
			allowNull: false
		},
		// Indikator, ob der Nutzer aktiv ist
		active: {
			type: DataTypes.BOOLEAN,
			defaultValue: true
		},
		// Letzter Login des Nutzers
		lastLogin: DataTypes.DATE,
		// Indikator, ob der Nutzer eine Mongo-Datenbank hat
		hasMongoDB: {
			type: DataTypes.BOOLEAN,
			defaultValue: false
		},
		// Profilbild des Nutzers
		profilePictureUrl: DataTypes.STRING
	});

	// Beziehungen
	User.associate = (models) => {
		/* Ein Nutzer kann mehreren Rollen zugehörig sein
		 * Das primaryKey: true Flag sagt aus, dass in der Realationstabelle
		 * der Fremdschlüssel user_id in Kombination mit noch einem Fremdschlüssel
		 * aus der Relationstabelle zusammen einen Primärschlüssel ergeben.
		 * Sprich: Die Schlüssel user_id und role_id in der Relationstabelle
		 * ergeben dern Primärschlüssel der Relationstabelle
		 */
		models.User.belongsToMany(models.Role, {
			through: models.UserRole,
			foreignKey: 'user_id',
			as: 'roles',
			primaryKey: true
		});
		// Ein Nutzer kann mehrere Applikationen haben
		models.User.hasMany(models.Application, { foreignKey: 'user_id' });
	};

	return User;
};
