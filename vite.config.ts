import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import electron from 'vite-plugin-electron'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'node:path'

const isGitHubPages = !!process.env.GITHUB_PAGES

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon-192.png', 'icon-512.png', 'apple-touch-icon.png'],
      manifest: {
        name: 'PixelPal — AI Companion',
        short_name: 'PixelPal',
        description: 'Your personal AI companion with memory, personality, and proactive assistance',
        theme_color: '#9B7FD4',
        background_color: '#0A0514',
        display: 'standalone',
        orientation: 'portrait-primary',
        scope: '/pixel-pal-web/',
        start_url: '/pixel-pal-web/',
        icons: [
          {
            src: 'icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable',
          },
          {
            src: 'icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
        ],
      },
    }),
    ...(isGitHubPages ? [] : [
      electron([
        {
          entry: 'electron/main.ts',
          onstart(args) {
            args.startup();
          },
          vite: {
            build: {
              outDir: 'dist/main',
              rollupOptions: {
                external: ['electron'],
              },
            },
          },
        },
        {
          entry: 'electron/preload.ts',
          onstart(args) {
            args.reload();
          },
          vite: {
            build: {
              outDir: 'dist/main',
              rollupOptions: {
                external: ['electron'],
              },
            },
          },
        },
      ]),
    ]),
  ],
  build: {
    outDir: 'dist/renderer',
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: '127.0.0.1',
    port: 5173,
  },
  base: isGitHubPages ? '/pixel-pal-web/' : './',
})
