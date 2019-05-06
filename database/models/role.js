module.exports = (sequelize, DataTypes) => {
	const Role = sequelize.define('Role', {
		// Name der Rolle
		name: {
			type: DataTypes.STRING,
			primaryKey: true,
			allowNull: false
		},
		// Beschreibung der Rolle, optional
		description: DataTypes.STRING
	});

	// Beziehungen
	Role.associate = (models) => {
		/* Eine Rolle kann mehreren Nutzern zugehörig sein
		 * Das primaryKey: true Flag sagt aus, dass in der Realationstabelle
		 * der Fremdschlüssel role_id in Kombination mit noch einem Fremdschlüssel
		 * aus der Relationstabelle zusammen einen Primärschlüssel ergeben.
		 * Sprich: Die Schlüssel user_id und role_id in der Relationstabelle
		 * ergeben dern Primärschlüssel der Relationstabelle
		 */
		models.Role.belongsToMany(models.User, {
			through: models.UserRole,
			foreignKey: 'role_id',
			as: 'users',
			primaryKey: true
		});
	};

	return Role;
};
