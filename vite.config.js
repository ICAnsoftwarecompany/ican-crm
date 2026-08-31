import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const enableDevHttps = process.env.npm_lifecycle_event === 'dev:https' || env.VITE_DEV_HTTPS === 'true'
  const useDevApiProxy = env.VITE_API_USE_DEV_PROXY === 'true'
  const apiProxyTarget = env.VITE_API_DEV_PROXY_TARGET || ''

  return {
    plugins: [
      react(),
      enableDevHttps
        ? basicSsl({
            name: 'ican-crm-dev',
            domains: ['test0002.127.0.0.1.nip.io', '*.127.0.0.1.nip.io'],
          })
        : null,
    ].filter(Boolean),
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      host: '0.0.0.0',
      port: 3000,
      allowedHosts: ['.nip.io'],
      proxy: useDevApiProxy && apiProxyTarget
        ? {
            '/api': {
              target: apiProxyTarget,
              changeOrigin: true,
              secure: true,
            },
          }
        : undefined,
    },
  }
})
