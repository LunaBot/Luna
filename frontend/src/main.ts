import { createApp } from 'vue';
import App from './app.vue';
import { router } from './router';
import store from './store';
import './index.css'

const app = createApp(App);

// Add store
app.use(store.original);

// Add router
app.use(router);

// Mount to page
app.mount('#app');
