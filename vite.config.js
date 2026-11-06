import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({
  base: './',
  plugins: [react()],
  build: { rollupOptions: { input: { main: 'index.html', lab: 'lab.html', demo: 'demo.html' } } },
  server: {
    host: '127.0.0.1',
    proxy: {
      '/api/players': 'http://127.0.0.1:8090',
      '/api': 'http://127.0.0.1:8080',
      '/mobile': 'http://127.0.0.1:8080',
      '/prepare': 'http://127.0.0.1:8080',
    },
  },
});
