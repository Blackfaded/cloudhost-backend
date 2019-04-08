const tmp = require('tmp-promise');
const path = require('path');
const fs = require('fs');
const axios = require('../../config/axios');

/** Class that controls downloads from Gitlab */
class DownloadController {
	/**
	 * Creates a temporary directory
	 * @returns {Promise.<String>} The temp dir path
	 */
	makeTempDir() {
		const dir = path.join(__dirname, '../../tmp');
		if (!fs.existsSync(dir)) {
			fs.mkdirSync(dir);
		}
		return tmp.dir({
			template: path.join(__dirname, '../../tmp/tmp-XXXXXX'),
			unsafeCleanup: true
		});
	}

	/**
	 * Fetches repository from gitlab
	 * @param {object} user The current user object
	 * @param  {object} options
	 * @param  {string} options.repositoryId The repository ID
	 * @param  {string} options.repositoryBranch The repository branch name
	 * @param  {string} options.archive The archive name
	 * @returns {Promise} The download promise
	 */
	getRepositoryArchive(user, options, socket) {
		const { repositoryId, repositoryBranch, archive } = options;
		return new Promise(async (resolve, reject) => {
			try {
				const { path: dir } = await this.makeTempDir();
				const output = fs.createWriteStream(path.join(dir, archive));

				const { data: stream } = await axios.get(
					`api/v4/projects/${repositoryId}/repository/archive?sha=${repositoryBranch}`,
					{
						headers: {
							Authorization: `Bearer ${user.gitlabAccessToken}`
						},
						responseType: 'stream'
					}
				);
				const downloadSize = Number(stream.headers['content-length']);
				let downloaded = 0;
				let oldProgress = 0;
				await new Promise((resolve, reject) => {
					stream.on('data', (chunk /* arraybuffer */) => {
						downloaded += chunk.length;
						const progress = Math.floor((downloaded / downloadSize) * 100);
						if (progress >= oldProgress + 5) {
							oldProgress = progress;
							console.log({ downloaded, downloadSize, progress });
							if (socket) {
								socket.emit('repoDownloadProgress', { progress });
							}
						}

						output.write(Buffer.from(chunk));
					});
					stream.on('end', () => resolve());
					stream.on('error', () => reject());
				});

				output.end();
				resolve(dir);
			} catch (error) {
				reject(error);
			}
		});
	}
}

module.exports = new DownloadController();
