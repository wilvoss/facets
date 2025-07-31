import { defineConfig } from 'vite';
import fs from 'fs';
import path from 'path';

export default defineConfig({
  server: {
    host: 'facets.local',
    port: 5173,
    https: {
      key: fs.readFileSync('/etc/apache2/ssl/tmp.local+12-key.pem'),
      cert: fs.readFileSync('/etc/apache2/ssl/tmp.local+12.pem'),
    },
    open: true,
  },
  build: {
    rollupOptions: {
      input: {
        'game/index': path.resolve(__dirname, 'game/index.html'),
        'game/stats': path.resolve(__dirname, 'game/stats.html'),
        main: path.resolve(__dirname, 'index.html'),
        generate: path.resolve(__dirname, 'generate.html'),
      },
    },
  },
});
