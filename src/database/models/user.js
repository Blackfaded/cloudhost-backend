export default (sequelize, DataTypes) => {
	const User = sequelize.define('User', {
		email: {
			type: DataTypes.STRING,
			primaryKey: true
		},
		gitlabId: DataTypes.INTEGER,
		username: DataTypes.STRING,
		active: {
			type: DataTypes.BOOLEAN,
			defaultValue: true
		},

		lastLogin: DataTypes.DATE,
		mongoContainerId: DataTypes.STRING,
		mongoExpressContainerId: DataTypes.STRING
	});

	User.associate = (models) => {
		models.User.belongsToMany(models.Role, {
			through: models.UserRole,
			foreignKey: 'user_id'
		});
		models.User.belongsToMany(models.Application, {
			through: 'UserApplication'
		});
	};

	return User;
};
