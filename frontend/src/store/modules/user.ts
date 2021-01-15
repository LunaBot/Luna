import { defineModule } from 'direct-vuex';
import store from '../../store';
import type { Profile } from 'passport-discord';
import { fetch } from '../../fetch';

type User = Profile;

interface State {
    loading: true | false,
    error?: Error;
    user?: User;
    impersonator?: User;
}

interface ApiError {
    status: {
        code: number;
        message: string;
    }
    error: {
        message: string;
        name: string;
        stacktrace: string;
    }
}

const isApiError = (response: unknown): response is ApiError => {
    if (typeof response !== 'object' || response === null) return false;
    const keys = Object.keys(response);
    return keys.includes('status') && keys.includes('error');
};
const createState = (): State => ({
    loading: false,
    error: undefined,
    user: undefined,
    impersonator: undefined,
});
export const user = defineModule({
    namespaced: true as true,
    state: createState(),
    getters: {
        guilds: state => state.user?.guilds
    },
    mutations: {
        resetState(state) {
            Object.assign(state, createState());
        },
        setLoading(state, loading: true | false) {
            state.loading = loading;
        },
        setError(state, error: Error | string) {
            if (typeof error === 'string') {
                error = new Error(error);
            }

            state.error = error;
            return state;
        },
        clearError(state) {
            state.error = undefined;
        },
        setUser(state, user: User) {
            state.user = user;
        },
        clearUser(state) {
            state.user = undefined;
        },
        impersonate(state, user: User) {
            state.impersonator = state.user;
            state.user = user;
        },
        clearImpersonation(state) {
            state.user = state.impersonator;
            state.impersonator = undefined;
        }
    },
    actions: {
        /**
         * At the start we get the logged in user
         * If this is a AutoMod staff member then we can use the staff endpoints
         * to enable user impersonation mode to assist a customer this will result in
         * state.user = customer "user"
         * state.impersonator = staff "user"
         */
        async fetchIntialData() {
            try {
                // Start loading
                store.commit.user.setLoading(true);

                // Get currently logged in user's profile
                const response = await fetch(`/api/users/@me`, {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                // Non OK response
                if (!response.ok) return;

                // Get data
                const data = await response.json();

                // Set data
                store.commit.user.setUser(data);

                // Finish loading
                store.commit.user.setLoading(false);
            } catch {}
        },
    }
});