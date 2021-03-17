const commonDeploy = {
	user: 'xo',
	host: '165.227.220.113',
	key: '~/.ssh/deploy.key',
	ref: 'origin/main',
	repo: 'https://github.com/lunabot/luna',
	path: '/home/xo/code/lunabot/luna/dev',
	'pre-deploy': 'git reset --hard',
	'post-deploy': 'pnpm install && npm run build && pm2 startOrGracefulReload ecosystem.config.js --env dev'
};

module.exports = {
	apps: [
		{
			name: 'luna',
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
				LOG_LEVEL: 'debug'
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
			...commonDeploy,
			path: '/home/xo/code/lunabot/luna/dev',
			'post-deploy': 'pnpm install && npm run build && pm2 startOrGracefulReload ecosystem.config.js --env dev'
		},
		free: {
			...commonDeploy,
			path: '/home/xo/code/lunabot/luna/free',
			'post-deploy': 'pnpm install && npm run build && pm2 startOrGracefulReload ecosystem.config.js --env free'
		},
		premium: {
			...commonDeploy,
			path: '/home/xo/code/lunabot/luna/premium',
			'post-deploy': 'pnpm install && npm run build && pm2 startOrGracefulReload ecosystem.config.js --env premium'
		}
	}
};
