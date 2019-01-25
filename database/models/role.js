module.exports = (sequelize, DataTypes) => {
	const Role = sequelize.define('Role', {
		name: DataTypes.STRING,
		description: DataTypes.STRING
	});

	Role.associate = (models) => {
		models.Role.belongsToMany(models.User, {
			through: models.UserRole,
			foreignKey: 'role_id',
			as: 'users'
		});
	};

	return Role;
};
