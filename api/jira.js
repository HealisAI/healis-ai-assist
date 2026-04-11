module.exports = async function handler(req, res) {
  const base = process.env.JIRA_BASE_URL || 'https://healis.atlassian.net'
  const creds = Buffer.from(`${process.env.JIRA_EMAIL}:${process.env.JIRA_API_TOKEN}`).toString('base64')

  // PUT with { issueKey, fields } → update existing issue
  // POST with { fields, ... } → create new issue
  let url = `${base}/rest/api/3/issue`
  let body = req.body
  if (req.method === 'PUT' && req.body?.issueKey) {
    url = `${base}/rest/api/3/issue/${req.body.issueKey}`
    const { issueKey, ...rest } = req.body
    body = rest
  }

  const response = await fetch(url, {
    method: req.method,
    headers: {
      'Authorization': `Basic ${creds}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-Atlassian-Token': 'no-check',
    },
    body: req.method !== 'GET' ? JSON.stringify(body) : undefined,
  })
  const data = await response.json().catch(() => ({}))
  res.status(response.status).json(data)
}
