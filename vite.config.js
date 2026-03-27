import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const jiraBase = env.JIRA_BASE_URL || 'https://healis.atlassian.net'
  const jiraCreds = Buffer.from(`${env.JIRA_EMAIL}:${env.JIRA_API_TOKEN}`).toString('base64')

  return {
    plugins: [
      react(),
      {
        name: 'jira-proxy',
        configureServer(server) {
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
