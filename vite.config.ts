import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@api':        fileURLToPath(new URL('./src/api',        import.meta.url)),
      '@components': fileURLToPath(new URL('./src/components', import.meta.url)),
      '@domain':     fileURLToPath(new URL('./src/domain',     import.meta.url)),
      '@hooks':      fileURLToPath(new URL('./src/hooks',      import.meta.url)),
      '@mocks':      fileURLToPath(new URL('./src/mocks',      import.meta.url)),
      '@page':       fileURLToPath(new URL('./src/pages',      import.meta.url)),
      '@query':      fileURLToPath(new URL('./src/query',      import.meta.url)),
      '@state':      fileURLToPath(new URL('./src/state',      import.meta.url)),
      '@styles':     fileURLToPath(new URL('./src/styles',     import.meta.url)),
    },
  },
});