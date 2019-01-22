export default {
	development: {
		gitlab: {
			domain: process.env.GITLAB_DOMAIN,
			token: process.env.GITLAB_TOKEN,
			app_id: process.env.GITLAB_APP_ID
		},
		db: {
			name: process.env.MYSQL_DATABASE,
			user: process.env.MYSQL_USER,
			password: process.env.MYSQL_PASSWORD
		}
	},
	production: {
		gitlab: {
			domain: process.env.GITLAB_DOMAIN,
			token: process.env.GITLAB_TOKEN,
			app_id: process.env.GITLAB_APP_ID
		},
		db: {
			name: process.env.MYSQL_DATABASE,
			user: process.env.MYSQL_USER,
			password: process.env.MYSQL_PASSWORD
		}
	}
}[process.env.NODE_ENV];
