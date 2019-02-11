module.exports = (sequelize, DataTypes) => {
	const User = sequelize.define('User', {
		email: {
			type: DataTypes.STRING,
			primaryKey: true,
			allowNull: false
		},
		gitlabId: {
			type: DataTypes.INTEGER,
			allowNull: false
		},
		gitlabAccessToken: {
			type: DataTypes.STRING,
			allowNull: false
		},
		username: {
			type: DataTypes.STRING,
			allowNull: false
		},
		active: {
			type: DataTypes.BOOLEAN,
			defaultValue: true
		},

		lastLogin: DataTypes.DATE,
		mongoContainerId: DataTypes.STRING,
		mongoExpressContainerId: DataTypes.STRING,
		profilePictureUrl: DataTypes.STRING
	});

	User.associate = (models) => {
		models.User.belongsToMany(models.Role, {
			through: models.UserRole,
			foreignKey: 'user_id',
			as: 'roles'
		});
		models.User.hasMany(models.Application, { foreignKey: 'user_id' });
	};

	return User;
};