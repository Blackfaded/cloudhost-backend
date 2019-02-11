module.exports = (sequelize, DataTypes) => {
	const UserRole = sequelize.define('UserRole', {
		user_id: DataTypes.INTEGER,
		role_id: DataTypes.INTEGER,
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
