const docker = require('./index');
const { appLogger } = require('../../config/winston');

class NetworkController {
	async createNetwork(network) {
		try {
			const foundNetwork = await docker.getNetwork(network);
			appLogger.info(`network ${network} already exists. Skipping creation.`);
			return foundNetwork;
		} catch (error) {
			if (error.statusCode === 404) {
				const createdNetwork = await docker.createNetwork({
					Name: network
				});
				appLogger.info(`network ${createdNetwork} created.`);
				return createdNetwork;
			}
			throw error;
		}
	}

	async createNetworks(networks) {
		return networks.reduce(async (promise, network) => {
			// This line will wait for the last async function to finish.
			// The first iteration uses an already resolved Promise
			// so, it will immediately continue.
			try {
				await promise;
				await this.createNetwork(network);
			} catch (error) {
				Promise.reject(error);
			}
		}, Promise.resolve());
	}

	async attachContainerToNetwork({ containerName, networkName }) {
		console.log({ containerName, networkName });
		const network = await docker.getNetwork(networkName);
		const inspectedNetwork = await network.inspect();
		const containerIsNotInNetwork = !Object.values(inspectedNetwork.Containers).some((container) => {
			return container.Name === containerName;
		});

		if (containerIsNotInNetwork) {
			return network.connect({
				Container: containerName
			});
		}
		return network;
	}

	async attachContainerToNetworks({ containerName, networkNames }) {
		return networkNames.reduce(async (promise, networkName) => {
			// This line will wait for the last async function to finish.
			// The first iteration uses an already resolved Promise
			// so, it will immediately continue.
			await promise;
			await this.attachContainerToNetwork({ containerName, networkName });
		}, Promise.resolve());
	}
}

module.exports = new NetworkController();
