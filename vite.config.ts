import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['kaio-icon.svg'],
      manifest: {
        name: 'Kaio — Food Safety, Sorted',
        short_name: 'Kaio',
        description: 'Free MPI food safety compliance app for NZ cafes and restaurants',
        theme_color: '#0a5e5e',
        background_color: '#f7f9f8',
        display: 'standalone',
        orientation: 'any',
        start_url: '/kaio/#/app/today',
        scope: '/kaio/',
        icons: [
          {
            src: 'kaio-icon.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'any',
          },
          {
            src: 'kaio-icon.svg',
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
  base: '/kaio/',
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
