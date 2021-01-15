import { sleep } from '@/utils';
import router from 'express-promise-router';
import passport from 'passport';

const auth = router();

// Authentication
auth.get('/discord', passport.authenticate('discord'));
auth.get('/discord/redirect', passport.authenticate('discord', {
    failureRedirect: '/'
}), (_request, response) => {
    response.redirect('/dashboard');
});

// Logout
auth.get('/logout', async function(req, res) {
    // Drop our session
    req.logout();

    // Wait for session to be dropped
    await sleep(1);

    // Send us back to the home page
    res.redirect('/');
});

export {
    auth
}
