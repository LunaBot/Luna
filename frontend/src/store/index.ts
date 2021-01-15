import VuexPersistence from 'vuex-persist';
import { createDirectStore } from 'direct-vuex';
import * as modules from './modules';

const { store, rootActionContext, moduleActionContext } = createDirectStore({
  modules,
  state: {
    loading: true
  },
  mutations: {
    setLoading(state, loading: true | false) {
      state.loading = loading;
    }
  },
  actions: {
    setLoading(context, loading: true | false) {
      context.commit('setLoading', loading);
    }
  },
  plugins: [new VuexPersistence().plugin]
});

// Export the direct-store instead of the classic Vuex store.
export default store;

// The following exports will be used to enable types in the
// implementation of actions.
export { rootActionContext, moduleActionContext };

// The following lines enable types in the injected store '$store'.
export type AppStore = typeof store;
declare module 'vuex' {
  // We pass <S> to maintain the same types
  // as the original interface
  // @ts-ignore
  interface Store<S> {
    direct: AppStore
  }
};
