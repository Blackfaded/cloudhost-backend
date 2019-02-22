module.exports = (sequelize, DataTypes) => {
	const Role = sequelize.define('Role', {
		name: {
			type: DataTypes.STRING,
			primaryKey: true,
			allowNull: false
		},
		description: DataTypes.STRING
	});

	Role.associate = (models) => {
		models.Role.belongsToMany(models.User, {
			through: models.UserRole,
			foreignKey: 'role_id',
			as: 'users',
			primaryKey: true
		});
	};

	return Role;
};
