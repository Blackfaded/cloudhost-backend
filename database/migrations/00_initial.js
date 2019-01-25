module.exports = {
	// eslint-disable-next-line
	up: (queryInterface) => {
		return queryInterface.bulkInsert(
			'Roles',
			[
				{
					name: 'admin',
					description: 'The user has admin rights',
					createdAt: new Date(),
					updatedAt: new Date()
				},
				{
					name: 'user',
					description: 'The user no special rights',
					createdAt: new Date(),
					updatedAt: new Date()
				}
			],
			{}
		);
	},

	// eslint-disable-next-line
	down: (queryInterface) => {
		return queryInterface.bulkDelete('Roles', null, {});
	}
};
