import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// Build base path. Defaults to /kaio/ for dev/preview and the production build.
// Override at build time for the beta subfolder: BASE_PATH=/kaio/beta/ npm run build
const BASE = (process.env.BASE_PATH || '/kaio/').replace(/\/+$/, '') + '/'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['kaio-mark.svg', 'kaio-logo.svg', 'kaio-logo-dark.svg', 'kaio-icon.svg'],
      manifest: {
        name: 'Kaio — Food Safety, Sorted',
        short_name: 'Kaio',
        description: 'Free MPI food safety compliance app for NZ cafes and restaurants',
        theme_color: '#16A34A',
        background_color: '#F6F8FB',
        display: 'standalone',
        orientation: 'any',
        start_url: `${BASE}#/app/today`,
        scope: BASE,
        icons: [
          {
            src: `${BASE}kaio-mark.svg`,
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'any',
          },
          {
            src: `${BASE}kaio-mark.svg`,
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
      },
    }),
  ],
  base: BASE,
  server: {
    host: '127.0.0.1',
    port: 5173,
    strictPort: true,
    open: '/kaio/',
  },
  preview: {
    host: '127.0.0.1',
    port: 5173,
    strictPort: true,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          date: ['date-fns'],
        },
      },
    },
  },
})
