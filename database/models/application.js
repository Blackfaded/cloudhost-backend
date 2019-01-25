module.exports = (sequelize, DataTypes) => {
	const Application = sequelize.define('Application', {
		repositoryName: DataTypes.STRING,
		repositoryId: DataTypes.STRING,
		repositoryBranch: DataTypes.STRING,
		commitHash: DataTypes.STRING,
		needsMongo: DataTypes.BOOLEAN,
		autostart: DataTypes.BOOLEAN
	});

	Application.associate = (models) => {
		models.Application.belongsToMany(models.User, {
			through: 'UserApplication'
		});
	};

	return Application;
};
