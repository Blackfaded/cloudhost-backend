const { promises: fsp } = require('fs');
const path = require('path');
const imageController = require('./images');
const { host } = require('../../config/connections');

/** Class that controls the Dockerfile creation */
class DockerfileController {
	/**
	 * Creates a Dockerfile with given parameters
	 * @param  {object} options
	 * @param  {string} options.archive the downloaded archive name // see download controller
	 * @param  {string} options.runScript The runscript from package.json
	 * @param  {string} options.mountPath The apps mountpath
	 * @param  {string} [options.buildScript] The buildscript from package.json
	 * @returns {string} The Dockerfile content
	 */
	// eslint-disable-next-line
	populateDockerfile({ archive, runScript, mountPath, buildScript }) {
		const buildScriptString = buildScript ? `RUN npm run ${buildScript}` : '';
		return `\
    FROM node:carbon-alpine
    WORKDIR /app
    ADD ${archive} .
    RUN cp -r */. .
    RUN npm install
    ${buildScriptString}
    ENV PORT=8080
    EXPOSE 8080
    LABEL traefik.enable=true
    LABEL traefik.backend="${mountPath}"
    LABEL traefik.docker.network="traefik"
    LABEL traefik.frontend.rule="Host:${host};PathPrefixStrip:/${mountPath}"
    LABEL traefik.port="8080"
		CMD ["npm", "run", "${runScript}"]
		USER node`;
	}

	/**
	 * Writes the content to a Dockerfile at given directory
	 * @param  {string} dir directory to be written at
	 * @param  {string} content Dockerfile content
	 * @returns {Promise} The fs write promise
	 */
	async writeDockerfile(dir, content) {
		return fsp.writeFile(path.join(dir, 'Dockerfile'), content, 'utf-8');
	}

	/**
	 * Helper function to create and write Dockerfile to filesystem
	 * @param {object} user The current user object
	 * @param  {object} options
	 * @param  {string} options.dir directory to be written at
	 * @param  {string} options.archive the downloaded archive name // see download controller
	 * @param  {string} options.runScript The runscript from package.json
	 * @param  {string} options.appName The apps name
	 * @param  {string} [options.buildScript] The buildscript from package.json
	 * @returns {Promise} The fs write promise
	 */
	// eslint-disable-next-line
	async createDockerfile(user, { dir, archive, runScript, appName, buildScript }) {
		const mountPath = imageController.getMountPath(user, appName);
		// eslint-disable-next-line
		const content = this.populateDockerfile({ archive, runScript, mountPath, buildScript });
		return this.writeDockerfile(dir, content);
	}
}

module.exports = new DockerfileController();
