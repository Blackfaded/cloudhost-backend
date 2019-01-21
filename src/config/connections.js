export default {
	development: {
		gitlab: {
			domain: process.env.GITLAB_DOMAIN,
			token: process.env.GITLAB_TOKEN,
			app_id: process.env.GITLAB_APP_ID,
			redirect_uri: process.env.GITLAB_REDIRECT_URI
		}
	},
	production: {
		gitlab: {
			domain: process.env.GITLAB_DOMAIN,
			token: process.env.GITLAB_TOKEN,
			app_id: process.env.GITLAB_APP_ID,
			redirect_uri: process.env.GITLAB_REDIRECT_URI
		}
	}
}[process.env.NODE_ENV];
