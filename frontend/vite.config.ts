import { defineConfig } from 'vitest/config'
import { loadEnv } from 'vite'
import viteReact from '@vitejs/plugin-react'
import { TanStackRouterVite } from '@tanstack/router-plugin/vite'
import { VitePWA } from 'vite-plugin-pwa'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const repoRoot = resolve(__dirname, '..')

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, repoRoot, '')
  const apiTarget = env.VITE_API_BASE_URL || 'http://localhost:8000'

  return {
    envDir: repoRoot,
    plugins: [
      TanStackRouterVite({ autoCodeSplitting: true }),
      viteReact(),
      VitePWA({
        registerType: 'prompt',
        includeAssets: ['logo.png', 'brand/happy-wallet-logo-nobg.png'],
        manifest: {
          name: 'Daily',
          short_name: 'Daily',
          description: 'Daily — Personal Finance Tracker',
          theme_color: '#000000',
          background_color: '#ffffff',
          display: 'standalone',
          start_url: '/',
          icons: [
            {
              src: 'logo.png',
              sizes: '192x192',
              type: 'image/png',
            },
            {
              src: 'logo.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: 'logo.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
          globIgnores: ['**/env.js'],
          navigateFallback: 'index.html',
          navigateFallbackDenylist: [/^\/api/],
          runtimeCaching: [
            {
              urlPattern: /\/api\/v1\//,
              handler: 'NetworkFirst',
              options: {
                cacheName: 'api-cache',
                expiration: {
                  maxEntries: 100,
                  maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
                networkTimeoutSeconds: 3,
              },
            },
            {
              urlPattern: /\/env\.js$/,
              handler: 'NetworkFirst',
              options: {
                cacheName: 'env-config',
                expiration: {
                  maxEntries: 1,
                  maxAgeSeconds: 60 * 60 * 24,
                },
              },
            },
          ],
        },
      }),
    ],
    define: {
      'import.meta.env.VITE_API_BASE_URL': JSON.stringify(apiTarget),
    },
    server: {
      watch: {
        usePolling: true, // Required for Docker on Windows/macOS to detect changes
      },
      host: true,
      allowedHosts: true,
      proxy: {
        '/api': {
          target: apiTarget,
          changeOrigin: true,
        },
      },
    },
    test: {
      globals: true,
      environment: 'jsdom',
    },
    resolve: {
      alias: {
        '@': resolve(__dirname, './src'),
      },
    },
  }
})
