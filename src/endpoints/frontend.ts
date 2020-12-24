import { Router } from 'express';

const frontend = Router();

// Home page
frontend.get('/', (_req, res) => {
    res.send('Coming soon...');
});

// Health
frontend.get('/health', (_req, res) => {
    res.send('OK');
});

export {
    frontend
};
