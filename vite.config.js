import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: [
      'unsighted-kristi-underivatively.ngrok-free.dev'
    ],
    hmr: {
      clientPort: 443 // Forces HMR to use the ngrok default HTTPS port instead of 5173
    },
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false
      }
    }
  }
})
