const express = require('express');
const axios = require('../../../config/axios');
const userController = require('../../../controllers/user');
const { isAdmin } = require('../../../middlewares/roles');
const { appLogger } = require('../../../config/winston');

const router = express.Router();

// Hole den momentanen Nutzer
router.get('/self', async (req, res) => {
	try {
		const { user } = req;
		const modifiedUser = {
			email: user.email,
			name: user.username,
			userName: userController.getUserName(user),
			roles: user.roles.map((role) => role.name),
			profilePictureUrl: user.profilePictureUrl
		};
		res.json(modifiedUser).status(200);
	} catch (error) {
		appLogger.error(error);
		res.boom.badRequest('An error occured while getting user');
	}
});

router.get('/', isAdmin, async (req, res) => {
	try {
		const users = await userController.findAllUsers();
		const cleanedUser = users.map((user) => {
			return userController.cleanupUser(user);
		});
		res.json(cleanedUser).status(200);
	} catch (error) {
		appLogger.error(error);
		res.boom.badRequest('An error occured while getting users');
	}
});

router.get('/:email', isAdmin, async (req, res) => {
	try {
		const user = await userController.findUserByEmail(req.params.email);
		res.json(userController.cleanupUser(user)).status(200);
	} catch (error) {
		appLogger.error(error);
		res.boom.badRequest('An error occured while getting user');
	}
});

router.patch('/:email', isAdmin, async (req, res) => {
	try {
		if (
			Object.prototype.hasOwnProperty.call(req.body, 'active') &&
			req.user.email === req.params.email
		) {
			return res.boom.forbidden("You can't edit your own active status");
		}
		const user = await userController.updateUserFieldsByEmail(req.params.email, {
			...req.body
		});

		return res.json(userController.cleanupUser(user)).status(200);
	} catch (error) {
		appLogger.error(error);
		return res.boom.badRequest('An error occured while updating user');
	}
});

router.delete('/:email/roles/:rolename', isAdmin, async (req, res) => {
	const { email, rolename } = req.params;
	if (req.user.email === email) {
		res.boom.forbidden("You can't remove your own role");
	} else {
		try {
			const user = await userController.deleteUserRole(email, rolename);

			res.json(userController.cleanupUser(user)).status(200);
		} catch (error) {
			appLogger.error(error);
			res.boom.badRequest('An error occured while deleting user role');
		}
	}
});

router.post('/:email/roles', isAdmin, async (req, res) => {
	const { role } = req.body;
	const { email } = req.params;
	const grantedBy = req.user.email;

	try {
		const user = await userController.addUserRole(email, role, grantedBy);
		res.json(userController.cleanupUser(user)).status(200);
	} catch (error) {
		appLogger.error(error);
		res.boom.badRequest('An error occured while deleting user role');
	}
});

router.get('/:email/projects', async (req, res) => {
	try {
		const user = (await userController.findUserByEmail(req.params.email)).get({ plain: true });
		const { data: projects } = await axios.get(`api/v4/users/${user.gitlabId}/projects`, {
			headers: {
				Authorization: `Bearer ${user.gitlabAccessToken}`
			}
		});
		const resProjects = projects.map((project) => {
			return {
				id: project.id,
				path: project.path,
				path_with_namespace: project.path_with_namespace
			};
		});
		res.json(resProjects).status(200);
	} catch (error) {
		appLogger.error(error);
		res.boom.badRequest('An error occured while getting user');
	}
});

module.exports = router;
