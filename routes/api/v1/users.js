const express = require('express');
const {
	findUserByEmailPlain,
	findAllUsers,
	updateUserFieldsByEmail,
	deleteUserRole,
	addUserRole
} = require('../../../controllers/user');
const { isAdmin } = require('../../../middlewares/roles');

const router = express.Router();

router.get('/', async (req, res) => {
	try {
		const users = await findAllUsers();
		res.json(users).status(200);
	} catch (error) {
		res.boom.badRequest('An error occured while getting users');
	}
});

router.get('/self', async (req, res) => {
	try {
		const user = await findUserByEmailPlain(req.user.email);
		console.log(user);
		const modifiedUser = {
			email: user.email,
			name: user.username,
			roles: user.roles.map((role) => role.name),
			profilePictureUrl: user.profilePictureUrl
		};
		res.json(modifiedUser).status(200);
	} catch (error) {
		res.boom.badRequest('An error occured while getting user');
	}
});

router.get('/:email', isAdmin, async (req, res) => {
	try {
		const user = await findUserByEmailPlain(req.params.email);
		res.json(user).status(200);
	} catch (error) {
		res.boom.badRequest('An error occured while getting user');
	}
});

router.patch('/:email', isAdmin, async (req, res) => {
	try {
		const user = (await updateUserFieldsByEmail(req.params.email, {
			...req.body
		})).get({ plain: true });

		res.json(user).status(200);
	} catch (error) {
		res.boom.badRequest('An error occured while updating user');
	}
});

router.delete('/:email/roles/:rolename', isAdmin, async (req, res) => {
	try {
		const user = (await deleteUserRole(req.params.email, req.params.rolename)).get({
			plain: true
		});

		res.json(user).status(200);
	} catch (error) {
		res.boom.badRequest('An error occured while deleting user role');
	}
});

router.post('/:email/roles', isAdmin, async (req, res) => {
	const { role } = req.body;
	const { email } = req.params;
	try {
		const user = (await addUserRole(email, role)).get({
			plain: true
		});
		res.json(user).status(200);
	} catch (error) {
		res.boom.badRequest('An error occured while deleting user role');
	}
});

module.exports = router;
