const Docker = require('dockerode');

const docker = new Docker();

function dockerfile(archive, runScript) {
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
  LABEL traefik.frontend.rule="Host:cloudhost.localhost;PathPrefixStrip:/rene.heinen/testapp"
  LABEL traefik.port="8080"
  CMD ["npm", "run", "${runScript}"]`;
}

module.exports = {
	dockerfile,
	docker
};
