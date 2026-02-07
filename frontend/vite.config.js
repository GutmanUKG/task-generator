import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  server : {
    host: '0.0.0.0', //Разрешить доступ извне (не только localhost)
    allowedHosts: ['.ngrok-free.dev', '.ngrok.io'], // Разрешить запросы через ngrok
    proxy: {
      '/api' : {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  }
})
