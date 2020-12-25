import router from 'express-promise-router';
import { config } from '../config';
import { envs } from '../envs';
import { AppError } from '../errors';

const api = router();

// Root path
api.get('/api', (_req, res) => {
    res.send({
        data: {
            message: 'Welcome',
        },
    });
});

// Health
api.get('/api/health', (_req, res) => {
    res.sendStatus(200);
});

api.get('/api/dump', (req, res) => {
    if (req.query.apiKey !== config.ADMIN_API_KEY) {
        throw new AppError('Invalid API key!');
    }

    res.send({
        config,
        envs,
    });
});

export {
    api,
};
