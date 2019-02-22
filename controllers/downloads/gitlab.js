const tmp = require('tmp-promise');
const path = require('path');
const fs = require('fs');
const axios = require('../../config/axios');

class Downloader {
	makeTempDir() {
		return tmp.dir({
			template: path.join(__dirname, '../../tmp/tmp-XXXXXX'),
			unsafeCleanup: true
		});
	}

	getRepositoryArchive(user, repositoryId, branchName, archive) {
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
				const downloadSize = stream._readableState.length; // eslint-disable-line

				let downloaded = 0;
				await new Promise((resolve, reject) => {
					stream.on('data', (chunk /* arraybuffer */) => {
						downloaded += chunk.length;

						output.write(Buffer.from(chunk));
					});
					stream.on('end', () => resolve());
					stream.on('error', () => reject());
				});
				console.log(downloaded);
				output.end();
				resolve(dir);
			} catch (error) {
				reject(error);
			}
		});
	}
}

module.exports = new Downloader();
