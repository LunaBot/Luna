import router from 'express-promise-router';

const frontend = router();

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
