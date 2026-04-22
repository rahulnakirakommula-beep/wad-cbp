import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// import { VitePWA } from 'vite-plugin-pwa' // Disabled — incompatible with Vite 8

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // VitePWA disabled — incompatible with Vite 8. Re-enable when updated.
  ],
})
