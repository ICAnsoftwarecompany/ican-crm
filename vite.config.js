import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl'
import path from 'path'
import { fileURLToPath } from 'url'
import http from 'http'
import https from 'https'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const IGNORED_TENANT_HOSTS = new Set(['www', 'app', 'crm', 'dashboard', 'localhost'])

function trimDomain(value = '') {
  return String(value).trim().replace(/^https?:\/\//i, '').replace(/\/+$/, '').toLowerCase()
}

function normalizeScheme(value = '', fallback = 'https') {
  return String(value || fallback).trim().replace(/:$/, '') || fallback
}

function resolveTenantFromDevHost(host = '', rootDomain = '') {
  const hostname = String(host || '').split(':')[0].toLowerCase()
  const normalizedRootDomain = trimDomain(rootDomain)

  if (!hostname || hostname === 'localhost' || hostname === '0.0.0.0' || hostname.startsWith('127.')) {
    return ''
  }

  const subdomainPart = normalizedRootDomain && hostname.endsWith(`.${normalizedRootDomain}`)
    ? hostname.slice(0, -(normalizedRootDomain.length + 1))
    : hostname
  const tenant = subdomainPart.split('.').filter(Boolean)[0] || ''

  return IGNORED_TENANT_HOSTS.has(tenant) ? '' : tenant
}

function resolveDevProxyTarget(req, env) {
  const configuredTarget = String(env.VITE_API_DEV_PROXY_TARGET || '').trim()
  const rootDomain = trimDomain(env.VITE_API_ROOT_DOMAIN || '3s-export.com')
  const scheme = normalizeScheme(env.VITE_API_SCHEME || 'https')
  const tenant = resolveTenantFromDevHost(req.headers.host, rootDomain)

  if (tenant && rootDomain) {
    return `${scheme}://${tenant}.${rootDomain}`
  }

  return configuredTarget
}

function tenantApiDevProxy(env) {
  if (env.VITE_API_USE_DEV_PROXY !== 'true') return null

  return {
    name: 'tenant-api-dev-proxy',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (!req.url?.startsWith('/api')) {
          next()
          return
        }

        const targetBase = resolveDevProxyTarget(req, env)
        if (!targetBase) {
          next()
          return
        }

        const targetUrl = new URL(req.url, targetBase)
        const isSecure = targetUrl.protocol === 'https:'
        const request = isSecure ? https.request : http.request
        const proxyReq = request(
          targetUrl,
          {
            method: req.method,
            headers: {
              ...req.headers,
              host: targetUrl.host,
              origin: `${targetUrl.protocol}//${targetUrl.host}`,
            },
            rejectUnauthorized: env.VITE_API_DEV_PROXY_SECURE !== 'false',
          },
          (proxyRes) => {
            res.writeHead(proxyRes.statusCode || 500, proxyRes.headers)
            proxyRes.pipe(res)
          }
        )

        proxyReq.on('error', (error) => {
          server.config.logger.error(`Tenant API proxy error: ${error.message}`)
          if (!res.headersSent) {
            res.writeHead(502, { 'Content-Type': 'text/plain' })
          }
          res.end('Tenant API proxy error')
        })

        req.pipe(proxyReq)
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const enableDevHttps = process.env.npm_lifecycle_event === 'dev:https' || env.VITE_DEV_HTTPS === 'true'

  return {
    plugins: [
      react(),
      enableDevHttps
        ? basicSsl({
            name: 'ican-crm-dev',
            domains: ['test0002.127.0.0.1.nip.io', '*.127.0.0.1.nip.io'],
          })
        : null,
      tenantApiDevProxy(env),
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
      proxy: undefined,
    },
  }
})
