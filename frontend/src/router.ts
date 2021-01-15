import { createRouter, createWebHistory } from 'vue-router';
import Home from './pages/home.vue';
import Dashboard from './pages/dashboard.vue';
// import Settings from './pages/settings.vue';
import ModuleSettings from './pages/module-settings.vue';
import Modules from './pages/modules.vue';
import NotFound from './pages/http/not-found.vue';
import Loading from './pages/loading.vue';
import store from './store';

const routerHistory = createWebHistory();

export const router = createRouter({
    history: routerHistory,
    routes: [{
        name: 'Home',
        path: '/',
        component: Home
    }, {
        name: 'Dashboard',
        path: '/dashboard',
        component: Dashboard,
        meta: {
            requiresAuth: true
        }
    // }, {
    //     name: 'Settings',
    //     path: '/dashboard/:serverId/settings',
    //     component: Settings,
    //     props: true
    }, {
        name: 'Modules',
        path: '/dashboard/:serverId/settings/modules',
        component: Modules,
        props: true,
        meta: {
            requiresAuth: true
        }
    }, {
        name: 'ModuleSettings',
        path: '/dashboard/:serverId/settings/modules/:moduleName',
        component: ModuleSettings,
        props: true,
        meta: {
            requiresAuth: true
        }
    }, {
        name: 'Loading',
        path: '/loading',
        component: Loading,
    }, {
        name: 'Login',
        path: '/login',
        beforeEnter() {
            location.href = '/auth/discord'
        },
        component: Loading,
    }, {
        name: 'Logout',
        path: '/logout',
        beforeEnter() {
            // If we're logging out then clear vuex store
            localStorage.clear();
            location.href = '/auth/logout'
        },
        component: Loading
    }, {
        path: "/:catchAll(.*)",
        component: NotFound,
    }]
});

router.beforeEach(async (to, _from, next) => {
    // If atleast one matched route requires auth then let's check we're loggedin
    // If we're not then redirect to the current auth endpoint
    if (to.matched.some(route => route.meta.requiresAuth)) {
        // Try and get user's data
        // If we fail then redirect them to the auth page
        await store.dispatch.user.fetchIntialData().catch(() => {
            return next({
                name: 'Login'
            });
        });
    }

    return next();
});