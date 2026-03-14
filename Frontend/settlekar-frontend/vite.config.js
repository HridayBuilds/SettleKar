import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/oauth2/authorize': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/oauth2/callback': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
})
