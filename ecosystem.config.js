module.exports = {
	apps: [
		{
			name: 'automod',
			script: 'npm start',
			time: true,
			// eslint-disable-next-line
			append_env_to_name: true,
			instances: 1,
			autorestart: true,
			// eslint-disable-next-line
			max_restarts: 50,
			watch: false,
			// eslint-disable-next-line
			max_memory_restart: '250M',
			env: {
				LOG_LEVEL: 'debug'
			},
			// eslint-disable-next-line
			env_dev: {
				LOG_LEVEL: 'info'
			},
			// eslint-disable-next-line
			env_free: {
				LOG_LEVEL: 'info'
			},
			// eslint-disable-next-line
			env_premium: {
				LOG_LEVEL: 'info'
			}
		}
	],
	deploy: {
		dev: {
			user: 'xo',
			host: '165.227.220.113',
			key: '~/.ssh/deploy.key',
			ref: 'origin/main',
			repo: 'https://github.com/automodbot/automod',
			path: '/home/xo/code/automodbot/automod/dev',
			'pre-deploy': 'git reset --hard',
			'post-deploy': 'pnpm install && npm run build && pm2 startOrGracefulReload ecosystem.config.js --env dev'
		},
		free: {
			user: 'xo',
			host: '165.227.220.113',
			key: '~/.ssh/deploy.key',
			ref: 'origin/main',
			repo: 'https://github.com/automodbot/automod',
			path: '/home/xo/code/automodbot/automod/free',
			'pre-deploy': 'git reset --hard',
			'post-deploy': 'pnpm install && npm run build && pm2 startOrGracefulReload ecosystem.config.js --env free'
		},
		premium: {
			user: 'xo',
			host: '165.227.220.113',
			key: '~/.ssh/deploy.key',
			ref: 'origin/main',
			repo: 'https://github.com/automodbot/automod',
			path: '/home/xo/code/automodbot/automod/premium',
			'pre-deploy': 'git reset --hard',
			'post-deploy': 'pnpm install && npm run build && pm2 startOrGracefulReload ecosystem.config.js --env premium'
		}
	}
};
