const { promises: fsp } = require('fs');
const path = require('path');
const imageController = require('./images');

class DockerfileController {
	populateDockerfile(options) {
		const { archive, runScript, mountPath, buildScript } = options;
		const buildScriptString = buildScript ? `RUN npm run ${buildScript}` : '';
		console.log({ buildScriptString });
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
    LABEL traefik.frontend.rule="Host:cloudhost.localhost;PathPrefixStrip:/${mountPath}"
    LABEL traefik.port="8080"
    CMD ["npm", "run", "${runScript}"]`;
	}

	async writeDockerfile(dir, content) {
		return fsp.writeFile(path.join(dir, 'Dockerfile'), content, 'utf-8');
	}

	async createDockerfile(user, { dir, archive, runScript, appName, buildScript }) {
		const mountPath = imageController.getMountPath(user, { appName });
		const content = this.populateDockerfile({ archive, runScript, mountPath, buildScript });
		return this.writeDockerfile(dir, content);
	}
}

module.exports = new DockerfileController();
