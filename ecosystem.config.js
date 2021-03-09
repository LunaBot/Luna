module.exports = {
  apps: [
    {
      name: 'automod',
      script: 'npm start',
      time: true,
      instances: 1,
      autorestart: true,
      max_restarts: 50,
      watch: false,
      max_memory_restart: '400MB',
      env: {
        PORT: 3000
      },
    },
  ],
  deploy: {
    production: {
      user: 'xo',
      host: '165.227.220.113',
      key: '~/.ssh/deploy.key',
      ref: 'feat/v2',
      repo: 'https://github.com/automodbot/automod',
      path: '/home/xo/code/automodbot/automod',
      'post-deploy': 'npm ci',
      env: {
        NODE_ENV: 'production'
      },
    },
  },
}
