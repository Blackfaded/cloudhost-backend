const tmp = require('tmp-promise');
const path = require('path');
const fs = require('fs');
const axios = require('../../config/axios');

class Downloader {
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

	getRepositoryArchive(user, options, io) {
		const { repositoryId, branchName, archive } = options;
		return new Promise(async (resolve, reject) => {
			try {
				const { path: dir } = await this.makeTempDir();
				const output = fs.createWriteStream(path.join(dir, archive));

				const { data: stream } = await axios.get(
					`api/v4/projects/${repositoryId}/repository/archive?sha=${branchName}`,
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
							io.of('/applicationCreate').emit('repoDownloadProgress', { progress });
						}

						output.write(Buffer.from(chunk));
					});
					stream.on('end', () => resolve());
					stream.on('error', () => reject());
				});

				output.end();
				console.log(dir);
				resolve(dir);
			} catch (error) {
				reject(error);
			}
		});
	}
}

module.exports = new Downloader();
