const express = require('express');
const axios = require('../../../config/axios');
const { appLogger } = require('../../../config/winston');

const router = express.Router();

router.get('/:repositoryId/branches', async (req, res) => {
	try {
		const { data: branches } = await axios.get(
			`api/v4/projects/${req.params.repositoryId}/repository/branches`,
			{
				headers: {
					Authorization: `Bearer ${req.user.gitlabAccessToken}`
				}
			}
		);
		return res.json(branches.map((branch) => branch.name)).status(200);
	} catch (error) {
		appLogger.error(error);
		return res.boom.badRequest('An error occured while getting the branch');
	}
});

router.get('/:repositoryId/branches/:branchName/runScripts', async (req, res) => {
	try {
		const { data } = await axios.get(
			`api/v4/projects/${req.params.repositoryId}/repository/files/package.json/raw?ref=${
				req.params.branchName
			}`,
			{
				headers: {
					Authorization: `Bearer ${req.user.gitlabAccessToken}`
				}
			}
		);
		const runScripts = Object.keys(data.scripts);
		return res.json(runScripts).status(200);
	} catch (error) {
		appLogger.error(error);
		return res.boom.badRequest('An error occured while getting the branch');
	}
});

module.exports = router;
