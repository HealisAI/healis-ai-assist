module.exports = async function handler(req, res) {
  const base = process.env.JIRA_BASE_URL || 'https://healis.atlassian.net'
  const creds = Buffer.from(`${process.env.JIRA_EMAIL}:${process.env.JIRA_API_TOKEN}`).toString('base64')

  const response = await fetch(`${base}/rest/api/3/issue`, {
    method: req.method,
    headers: {
      'Authorization': `Basic ${creds}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-Atlassian-Token': 'no-check',
    },
    body: req.method !== 'GET' ? JSON.stringify(req.body) : undefined,
  })
  const data = await response.json()
  res.status(response.status).json(data)
}
