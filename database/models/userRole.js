module.exports = (sequelize, DataTypes) => {
	const UserRole = sequelize.define('UserRole', {
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
