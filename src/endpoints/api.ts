import { Router } from 'express';

const api = Router();

// Root path
api.get('/api', (_req, res) => {
    res.send({
        data: {
            message: 'Welcome'
        }
    });
});

// Health
api.get('/api/health', (_req, res) => {
    res.sendStatus(200);
});

export {
    api
};
