import { createVueEndpoint } from '@/utils';
import router from 'express-promise-router';
import Vue from 'vue';
import { AppError } from '@/errors';
import { Server } from '@/servers';

const frontend = router();

// Home page
frontend.get('/', (request, response) => {
    return createVueEndpoint({
        app: new Vue({
            data: {
                url: request.url
            },
            template: `<div>Coming soon...</div>`,
        }),
        context: {
            title: 'Automod',
        }
    })(request, response);
});

// Server selection
frontend.get('/dashboard', (request, response) => {
    return createVueEndpoint({
        app: new Vue({
            data: {
                url: request.url
            },
            template: `<div>Coming soon...</div>`,
        }),
        context: {
            title: 'Automod',
        }
    })(request, response);
});

// Dashboards
frontend.get('/dashboard/:serverId', async (req, res) => {
    const serverId = req.params.serverId;
    const server = await Server.find({ id: serverId });
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
