const { promises: fsp } = require('fs');
const path = require('path');

class DockerfileController {
	populateDockerfile(options) {
		const { archive, runScript, mountPath } = options;
		return `\
    FROM node:carbon-alpine
    WORKDIR /app
    ADD ${archive} .
    RUN mv */* .
    RUN npm install
    ENV PORT=8080
    EXPOSE 8080
    LABEL traefik.enable=true
    LABEL traefik.backend="testapp"
    LABEL traefik.network="traefik"
    LABEL traefik.frontend.rule="Host:cloudhost.localhost;PathPrefixStrip:/${mountPath}"
    LABEL traefik.port="8080"
    CMD ["npm", "run", "${runScript}"]`;
	}

	async writeDockerfile(dir, content) {
		return fsp.writeFile(path.join(dir, 'Dockerfile'), content, 'utf-8');
	}

	async createDockerfile(options) {
		const { dir, archive, runScript, mountPath } = options; // eslint-disable-line
		const content = this.populateDockerfile({ archive, runScript, mountPath });
		return this.writeDockerfile(dir, content);
	}
}

module.exports = new DockerfileController();
