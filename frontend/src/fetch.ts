import { attach } from 'interception';
import { router } from './router';

const { register, fetch } = attach(window.fetch);

register({
    request: function (url, config) {
        // Modify the url or config here
        return [url, config];
    },
    requestError: function (error) {
        // Called when an error occured during another 'request' interceptor call
        return Promise.reject(error);
    },
    response: function (response) {
        // Response is "OK"
        if (response.ok) {
            return response;
        }

        // Re-authenticate
        if (response.status === 401 || response.status === 403) {
            router.push({
                name: 'Logout',
                params: {
                    redirect: '/auth/discord'
                }
            });
        } else {
            // Goto homepage
            router.push({
                name: 'Home'
            });
        }

        // Return response
        return response;
    },
    responseError: function (error) {
        // Handle a fetch error
        return Promise.reject(error);
    }
});

export {
    fetch
};
