const { findUserByEmail } = require('../user');
const models = require('../../database/models');
const imagesController = require('../docker/images');

/** Class that controls Applications in Database */
class ApplicationController {
	/**
	 * Creates an application in MySql
	 * @example
	 * const user = req.user
	 * const options = {
	 * appName = "myTemplate",
	 * repositoryId: 2,
	 * repositoryBranch: "master",
	 * repositoryName: "mytemplate",
	 * runscript: "start"
	 * }
	 * @param  {object} user The current user object
	 * @param  {object} options
	 * @param  {string} options.appName Apps name
	 * @param  {number} options.repositoryId Gitlab Repository ID
	 * @param  {string} options.repositoryBranch Gitlab Repository Branch Name
	 * @param  {string} options.repositoryName Gitlab Repository Name
	 * @param  {string} options.runScript Runscript from package.json
	 * @param  {string} [options.buildScript] Buildscript from package.json
	 * @returns {object} Sequelize application model
	 */
	async createApplication(
		user,
		// eslint-disable-next-line
		{ appName, repositoryId, repositoryBranch, repositoryName, runScript, buildScript }
	) {
		const mountPath = imagesController.getMountPath(user, appName);
		const foundUser = await findUserByEmail(user.email);
		try {
			const app = await models.Application.create({
				mountPath,
				appName,
				repositoryId,
				repositoryBranch,
				repositoryName,
				runScript,
				buildScript: buildScript || null
			});
			await foundUser.addApplication(app);
			return app;
		} catch (error) {
			console.log({ error });
			throw error;
		}
	}

	/**
	 * @example
	 * const options = {email: 'foo@bar.baz'}
	 * @param  {object} [options]
	 * @returns {Array.<Object>}
	 */
	findAll(options = {}) {
		return models.Application.findAll(options);
	}

	/**
	 * Returns all running containers
	 * @returns {Array.<Object>}
	 */
	findAllRunningContainers() {
		return this.findAll({
			where: {
				running: true
			}
		});
	}

	/**
	 * Returns all running containers
	 * @example
	 * const user = req.user
	 * @param {object} user
	 * @returns {Array.<Object>}
	 */
	findAllByUser(user) {
		const { email } = user;
		return models.Application.findAll({
			where: {
				user_id: email
			}
		});
	}

	/**
	 * Updates an application in the database
	 * @example
	 * const user = req.user
	 * const appName = "mytemplate"
	 * const values = {
	 * running: false
	 * }
	 * @param  {object} user The current user object
	 * @param  {string} appName The applications name
	 * @param  {object} values Values to be updated
	 * @returns {object} Sequelize application model
	 */
	update(user, appName, values) {
		const { email } = user;
		return models.Application.update(values, { returning: true, where: { user_id: email, appName } });
	}

	/**
	 * Returns all Apps from database from user with given name
	 * @param  {object} user The current user object
	 * @param  {string} appName The applications name
	 * @returns {Array.<Object>} Sequelize application model
	 */
	async findByAppName(user, appName) {
		const { email } = user;
		const foundUser = await findUserByEmail(email);
		return foundUser.getApplications({
			where: {
				appName
			}
		});
	}

	/**
	 * Destroys all Apps from database from user with given name
	 * @param  {object} user The current user object
	 * @param  {string} appName The applications name
	 */
	async destroyByAppName(user, appName) {
		const { email } = user;
		const foundUser = await findUserByEmail(email);
		const foundApps = await foundUser.getApplications({
			where: {
				appName
			}
		});
		if (foundApps.length) {
			await foundApps.reduce(async (promise, app) => {
				await promise;
				await app.destroy();
			}, Promise.resolve());
		}
	}

	/**
	 * Destroys all Apps from database from user with given name
	 * @param  {string} userId The users id
	 * @param  {string} appName The applications name
	 */
	async destroyByContainerName(userId, appName) {
		const foundApps = await this.findAll({
			where: {
				appName,
				user_id: userId
			}
		});
		if (foundApps.length) {
			await foundApps.reduce(async (promise, app) => {
				await promise;
				await app.destroy();
			}, Promise.resolve());
		}
	}
}

module.exports = new ApplicationController();
