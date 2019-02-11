const express = require('express');
const axios = require('../../../config/axios');

const router = express.Router();

router.get('/:id/branches', async (req, res) => {
	try {
		const { data: branches } = await axios.get(
			`api/v4/projects/${req.params.id}/repository/branches`,
			{
				headers: {
					Authorization: `Bearer ${req.user.gitlabAccessToken}`
				}
			}
		);
		res.json(branches).status(200);
	} catch (error) {
		console.log(error);
		res.boom.badRequest('An error occured while getting the branch');
	}
});

router.get('/:id/branches/:branchId/runScripts', async (req, res) => {
	try {
		const { data } = await axios.get(
			`api/v4/projects/${req.params.id}/repository/files/package.json/raw?ref=${req.params.branchId}`,
			{
				headers: {
					Authorization: `Bearer ${req.user.gitlabAccessToken}`
				}
			}
		);
		const runScripts = Object.keys(data.scripts);
		res.json(runScripts).status(200);
	} catch (error) {
		console.log(error);
		res.boom.badRequest('An error occured while getting the branch');
	}
});

module.exports = router;
