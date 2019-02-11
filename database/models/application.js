module.exports = (sequelize, DataTypes) => {
	const Application = sequelize.define('Application', {
		repositoryName: {
			type: DataTypes.STRING,
			allowNull: false
		},
		repositoryId: {
			type: DataTypes.STRING,
			allowNull: false
		},
		repositoryBranch: {
			type: DataTypes.STRING,
			allowNull: false
		},
		commitHash: DataTypes.STRING,
		needsMongo: {
			type: DataTypes.BOOLEAN,
			defaultValue: false
		},
		autostart: DataTypes.BOOLEAN
	});

	Application.associate = (models) => {
		models.Application.belongsTo(models.User, { foreignKey: 'user_id' });
	};

	return Application;
};
