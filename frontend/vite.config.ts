import { defineConfig } from '@lovable.dev/vite-tanstack-config';

export default defineConfig({
  vite: {
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: 'http://localhost:3001',
          changeOrigin: true,
        },
      },
    },
  },
});
