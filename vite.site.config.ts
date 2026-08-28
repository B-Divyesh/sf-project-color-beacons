import { defineConfig } from 'vite';

export default defineConfig({
  root: 'site',
  base: '/',
  build: {
    target: 'es2022',
    outDir: '../dist/site',
    emptyOutDir: true,
    sourcemap: false
  }
});
