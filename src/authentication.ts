import { Profile } from 'passport';
import passport from 'passport';
import DiscordConnector from 'passport-discord';
import { envs } from './envs';
import { AppError } from './errors';

export const loadAuthentication = () => {
    if (!envs.CLIENT.ID || !envs.CLIENT.SECRET || !envs.CLIENT.CALLBACK_URL) {
        throw new AppError('Missing CLIENT_ID, CLIENT_SECRET or CLIENT_CALLBACK_URL env.');
    }

    const discord = new DiscordConnector({
        clientID: envs.CLIENT.ID,
        clientSecret: envs.CLIENT.SECRET,
        callbackURL: envs.CLIENT.CALLBACK_URL,
        scope: ['guilds', 'identify']
    }, (_accessToken, _refreshToken, profile, done) => {
        // For now let's not keep their tokens
        done(null, profile);
    });

    passport.use(discord);

    passport.serializeUser(function(user, done) {
        done(null, user);
    });
    
    passport.deserializeUser(function(user, done) {
        done(null, user as Profile);
    });
};
