import router from 'express-promise-router';
import { AppError } from '../errors';
import { Server } from '../servers';

const frontend = router();

// Home page
frontend.get('/', (_req, res) => {
    res.send('Coming soon...');
});

// User profile
frontend.get('/profile/:userId', (_req, res) => {
    res.send('Coming soon...');
});

// Server selection
frontend.get('/dashboard', (_req, res) => {
    res.send('Coming soon...');
});

// Dashboards
frontend.get('/dashboard/:serverId', async (req, res) => {
    const serverId = req.params.serverId;
    const server = await Server.Find({ id: serverId });
    if (!server) {
        throw new AppError('Invalid server ID');
    }

    res.send(`Welcome to ${serverId}`);
});

// Health
frontend.get('/health', (_req, res) => {
    res.send('OK');
});

export {
    frontend
};
