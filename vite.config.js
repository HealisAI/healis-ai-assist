import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { createRequire } from 'module'

const require = createRequire(import.meta.url)

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const jiraBase = env.JIRA_BASE_URL || 'https://healis.atlassian.net'
  const jiraCreds = Buffer.from(`${env.JIRA_EMAIL}:${env.JIRA_API_TOKEN}`).toString('base64')

  // Expose non-VITE_ env vars to the serverless handlers when running locally
  for (const key of ['JIRA_EMAIL', 'JIRA_API_TOKEN', 'JIRA_BASE_URL',
                      'CONFLUENCE_PHARMACY_SHORTLINK', 'CONFLUENCE_PHARMACY_PAGE_ID']) {
    if (env[key] && !process.env[key]) process.env[key] = env[key]
  }

  return {
    plugins: [
      react(),
      {
        name: 'api-proxy',
        configureServer(server) {
          // /api/pharmacies — runs the Vercel handler directly
          // Adapt raw Node res to Express-style res.status().json() used by the handler
          const adaptRes = (res) => {
            res.status = (code) => { res.statusCode = code; return res }
            res.json = (data) => {
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify(data))
            }
            return res
          }
          const pharmaciesPath = require.resolve('./api/pharmacies.js')
          server.middlewares.use('/api/pharmacies', (req, res) => {
            // Clear require cache so file changes are picked up without restarting Vite
            delete require.cache[pharmaciesPath]
            const pharmaciesHandler = require(pharmaciesPath)
            pharmaciesHandler(req, adaptRes(res)).catch(err => {
              res.statusCode = 500
              res.end(JSON.stringify({ error: err.message }))
            })
          })

          server.middlewares.use('/api/jira', async (req, res) => {
            const url = jiraBase + req.url
            let body = ''
            for await (const chunk of req) body += chunk
            try {
              const response = await fetch(url, {
                method: req.method,
                headers: {
                  'Authorization': `Basic ${jiraCreds}`,
                  'Content-Type': 'application/json',
                  'Accept': 'application/json',
                  'X-Atlassian-Token': 'no-check',
                },
                body: req.method !== 'GET' && body ? body : undefined,
              })
              const text = await response.text()
              res.statusCode = response.status
              res.setHeader('Content-Type', 'application/json')
              res.end(text)
            } catch (err) {
              res.statusCode = 500
              res.end(JSON.stringify({ error: err.message }))
            }
          })
        },
      },
    ],
    server: {
      host: '0.0.0.0',
      allowedHosts: ['lemony-unstintingly-jonnie.ngrok-free.dev'],
      proxy: {
        '/api/anthropic': {
          target: 'https://api.anthropic.com',
          changeOrigin: true,
          rewrite: path => path.replace(/^\/api\/anthropic/, ''),
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq) => {
              proxyReq.setHeader('x-api-key', env.VITE_ANTHROPIC_API_KEY || '')
              proxyReq.setHeader('anthropic-version', '2023-06-01')
              proxyReq.removeHeader('origin')
              proxyReq.removeHeader('referer')
            })
          },
        },
      },
    },
  }
})
