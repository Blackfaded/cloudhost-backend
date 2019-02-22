const { promises: fsp } = require('fs');
const path = require('path');

class DockerfileController {
	populateDockerfile(archive, runScript, userName, mountPath) {
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
    LABEL traefik.frontend.rule="Host:cloudhost.localhost;PathPrefixStrip:/${userName}/${mountPath}"
    LABEL traefik.port="8080"
    CMD ["npm", "run", "${runScript}"]`;
	}

	async writeDockerfile(dir, content) {
		await fsp.writeFile(path.join(dir, 'Dockerfile'), content, 'utf-8');
	}

	async createDockerfile(dir, archive, runScript, userName, mountPath) {
		const content = await this.populateDockerfile(archive, runScript, userName, mountPath);
		await this.writeDockerfile(dir, content);
	}
}

module.exports = new DockerfileController();
