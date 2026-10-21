import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({ plugins:[react()], build:{rollupOptions:{input:{main:'index.html',lab:'lab.html'}}}, server:{host:'127.0.0.1',proxy:{'/api':'http://127.0.0.1:8090'}} });
