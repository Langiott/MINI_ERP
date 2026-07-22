import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Le chiamate a /api vengono inoltrate al backend su :3000,
    // cosi' nel codice React scrivi fetch('/api/dipendenti') senza CORS.
    proxy: {
      '/api': 'http://localhost:3000',
    },
  },
});
