module.exports = async function handler(req, res) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
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
