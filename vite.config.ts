import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dotenv from 'dotenv';

// Load environment variables from the .env file
dotenv.config();

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
  define: {
    'process.env': process.env, // Expose environment variables to the client
  },
});
