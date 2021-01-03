import { createVueEndpoint } from '@/utils';
import router from 'express-promise-router';
import Vue from 'vue';

const profile = router();

// Your own profile
profile.get('/profile', (request, response) => {
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

// User profile
profile.get('/profile/:userId', (request, response) => {
    return createVueEndpoint({
        app: new Vue({
            data: {
                url: request.url
            },
            template: `<div>Coming soon...</div>`,
        }),
        context: {
            title: 'Automod - Profile',
        }
    })(request, response);
});

export {
    profile
};
