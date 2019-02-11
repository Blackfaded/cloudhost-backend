const {
	GITLAB_DOMAIN,
	GITLAB_TOKEN,
	GITLAB_APP_ID,
	GITLAB_APP_SECRET,
	MYSQL_DATABASE,
	MYSQL_USER,
	MYSQL_PASSWORD,
	JWT_SECRET
} = process.env;

module.exports = {
	gitlab: {
		domain: GITLAB_DOMAIN,
		token: GITLAB_TOKEN,
		app_id: GITLAB_APP_ID,
		app_secret: GITLAB_APP_SECRET
	},
	db: {
		name: MYSQL_DATABASE,
		user: MYSQL_USER,
		password: MYSQL_PASSWORD
	},
	jwt: {
		secret: JWT_SECRET
	}
};
