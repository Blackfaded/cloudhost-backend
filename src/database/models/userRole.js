module.exports = (sequelize, DataTypes) => {
	const UserRole = sequelize.define('UserRole', {
		user_id: DataTypes.INTEGER,
		role_id: DataTypes.INTEGER,
		grantedBy: DataTypes.INTEGER
	});

	return UserRole;
};
