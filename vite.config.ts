import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dotenv from 'dotenv';

dotenv.config();

export default defineConfig({
  root: 'src/web',
  base: './',
  build: {
    outDir: '../../webroot',
    emptyOutDir: true,
    rollupOptions: {
      input: 'src/web/index.html',
    },
  },
  plugins: [react()],
  resolve: {
    extensions: ['.js', '.ts', '.jsx', '.tsx'],
  },
  define: {
    'process.env': process.env,
  },
});
