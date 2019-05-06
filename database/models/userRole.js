module.exports = (sequelize, DataTypes) => {
	const UserRole = sequelize.define('UserRole', {
		// ID des Nutzers, der die Rolle zugewiesen hat
		grantedBy_id: {
			type: DataTypes.STRING,
			references: {
				model: 'Users',
				key: 'email'
			}
		}
	});

	return UserRole;
};
