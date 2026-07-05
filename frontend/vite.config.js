import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/build/',
  build: {
    outDir: '../backend/public/build',
    emptyOutDir: true,
  },
  server: {
    allowedHosts: ['turbofan-depth-bruising.ngrok-free.dev'],
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:7000',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://127.0.0.1:7000',
        changeOrigin: true,
      },
      '/images': {
        target: 'http://127.0.0.1:7000',
        changeOrigin: true,
      }
    }
  }
})
