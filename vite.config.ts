import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  root: './src', // Set the root directory to "src"
  build: {
    outDir: '../dist', // Output directory for build
    emptyOutDir: true, // Clear the output directory before each build
    rollupOptions: {
      input: './src/index.html', // Specify the entry point
    },
  },
  resolve: {
    extensions: ['.js', '.ts', '.jsx', '.tsx'], // Handle TypeScript and JavaScript files
  },
});
