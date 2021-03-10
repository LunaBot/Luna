module.exports = {
	apps: [
		{
			name: 'automod',
			script: 'npm start',
			time: true,
			instances: 1,
			autorestart: true,
			// eslint-disable-next-line
			max_restarts: 50,
			watch: false,
			// eslint-disable-next-line
			max_memory_restart: '400M',
			env: {
				PORT: 3000,
				LOG_LEVEL: 'debug'
			}
		}
	],
	deploy: {
		production: {
			user: 'xo',
			host: '165.227.220.113',
			key: '~/.ssh/deploy.key',
			ref: 'origin/feat/v2',
			repo: 'https://github.com/automodbot/automod',
			path: '/home/xo/code/automodbot/automod',
			'pre-deploy': 'git reset --hard',
			'post-deploy': 'pnpm install && npm run build && pm2 startOrGracefulReload ecosystem.config.js --env production',
			env: {
				NODE_ENV: 'production'
			}
		}
	}
};
