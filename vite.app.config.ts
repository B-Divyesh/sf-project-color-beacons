import { defineConfig } from 'vite';

export default defineConfig({
  root: 'app',
  clearScreen: false,
  server: { port: 1420, strictPort: true },
  envPrefix: ['VITE_', 'TAURI_'],
  build: {
    target: 'es2022',
    outDir: '../dist/app',
    emptyOutDir: true,
    sourcemap: true
  }
});
