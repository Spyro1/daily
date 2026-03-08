import { defineConfig } from 'vitest/config'
import { loadEnv } from 'vite'
import viteReact from '@vitejs/plugin-react'
import { TanStackRouterVite } from '@tanstack/router-plugin/vite'
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
    plugins: [TanStackRouterVite({ autoCodeSplitting: true }), viteReact()],
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
