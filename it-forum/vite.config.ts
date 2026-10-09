import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // npm run dev (5173) + npm run dev:api (8787) қатар жұмыс істегенде
    proxy: { '/api': 'http://localhost:8787' },
  },
});
