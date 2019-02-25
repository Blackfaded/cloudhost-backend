module.exports = (sequelize, DataTypes) => {
	const Application = sequelize.define('Application', {
		mountPath: {
			type: DataTypes.STRING,
			allowNull: false,
			primaryKey: true
		},
		containerName: {
			type: DataTypes.STRING,
			allowNull: false
		},
		imageName: {
			type: DataTypes.STRING,
			allowNull: false
		},
		appName: {
			type: DataTypes.STRING,
			allowNull: false
		},
		repositoryName: {
			type: DataTypes.STRING,
			allowNull: false
		},
		repositoryId: {
			type: DataTypes.INTEGER,
			allowNull: false
		},
		repositoryBranch: {
			type: DataTypes.STRING,
			allowNull: false
		},
		needsMongo: {
			type: DataTypes.BOOLEAN,
			defaultValue: false
		},
		autostart: {
			type: DataTypes.BOOLEAN,
			defaultValue: true
		}
	});

	Application.associate = (models) => {
		models.Application.belongsTo(models.User, { foreignKey: 'user_id' });
	};

	return Application;
};
