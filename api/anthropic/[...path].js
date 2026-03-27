export default async function handler(req, res) {
  const segments = req.query.path || []
  const url = `https://api.anthropic.com/${segments.join('/')}`

  const response = await fetch(url, {
    method: req.method,
    headers: {
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: req.method !== 'GET' ? JSON.stringify(req.body) : undefined,
  })

  const data = await response.json()
  res.status(response.status).json(data)
}
