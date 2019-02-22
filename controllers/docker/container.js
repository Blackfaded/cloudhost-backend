const docker = require('./index');

class ContainerController {
	async removeContainer(imageName) {
		try {
			const oldContainer = await docker.getContainer(imageName);
			await oldContainer.remove({ force: true });
		} catch (error) {
			if (error.statusCode === 404) {
				Promise.resolve();
			} else {
				Promise.reject();
			}
		}
	}

	async startContainer(imageName) {
		const createContainerOpts = {
			Image: imageName,
			name: imageName,
			Hostconfig: {
				NetworkMode: 'traefik'
			}
		};

		const container = await docker.createContainer(createContainerOpts);
		await container.start();
	}
}

module.exports = new ContainerController();
