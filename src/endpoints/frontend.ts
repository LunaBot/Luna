import express from 'express';
import { envs } from '../envs';
import { log } from '../log';

export const frontend = () => {
    const app = express();
    const port = envs.FRONTEND.PORT || 0;

    // Home page
    app.get('/', (_req, res) => {
        res.send('Coming soon...');
    });

    return app.listen(port, () => {
        log.debug(`Frontend started at http://localhost:${port}/`);
    });
};
