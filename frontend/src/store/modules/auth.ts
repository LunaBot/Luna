import { defineModule } from 'direct-vuex';

interface State {
    loading: true | false,
    error?: Error;
}

const createState = (): State => ({
    loading: false,
    error: undefined,
});

export const auth = defineModule({
    namespaced: true as true,
    state: createState(),
    getters: {
        isAuthenticated: (_state, _getters, rootState, _rootGetters) => {
            return rootState.user.user !== undefined;
        }
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
        }
    },
    actions: {
        resetState() {
            
        }
    }
});