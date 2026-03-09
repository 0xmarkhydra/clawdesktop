import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './',
  server: {
    allowedHosts: ['app.clawdesktop.vn', 'admin.clawdesktop.vn'],
  },
  preview: {
    allowedHosts: ['app.clawdesktop.vn', 'admin.clawdesktop.vn'],
  },
})
