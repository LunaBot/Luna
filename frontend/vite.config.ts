import type { UserConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

const config: UserConfig = {
  plugins: [
    vue(),
  ],
  optimizeDeps: {
    plugins: [
      vue()
    ]
  },
  server: {
    proxy: {
      '/api': 'http://localhost:52952/',
      '/auth': 'http://localhost:52952/',
    },
  },
}

export default config;