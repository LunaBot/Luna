import express, { Router } from 'express';
import { envs } from '../envs';
import { log } from '../log';

export const api = () => {
    const app = express();
    const port = envs.API.PORT || 0;
    const router = Router();

    // Root path
    router.get('/', (_req, res) => {
        res.send({
            data: {
                message: 'Welcome'
            }
        });
    });

    // Health
    router.get('/health', (_req, res) => {
        res.sendStatus(200);
    });

    // Mount router
    app.use('/api', router);

    // Start server
    return app.listen(port, () => {
        log.debug(`API started at http://localhost:${port}/api/`);
    });
};
