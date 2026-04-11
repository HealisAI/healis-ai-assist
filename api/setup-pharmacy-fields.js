// ── One-time setup: create "Apotheek E-mail" and "Apotheek Telefoon" custom fields ──
// Visit /api/setup-pharmacy-fields once in the browser to create the fields in Jira.
// After running, note the field IDs in the response and delete this file.

module.exports = async function handler(req, res) {
  const base = process.env.JIRA_BASE_URL || 'https://healis.atlassian.net'
  const creds = Buffer.from(`${process.env.JIRA_EMAIL}:${process.env.JIRA_API_TOKEN}`).toString('base64')
  const headers = {
    'Authorization': `Basic ${creds}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }

  const results = {}

  // 1. Fetch all existing custom fields to check if ours already exist
  const allFieldsRes = await fetch(`${base}/rest/api/3/field`, { headers })
  const allFields = allFieldsRes.ok ? await allFieldsRes.json() : []
  const existing = {}
  for (const f of allFields) {
    if (f.name === 'Apotheek E-mail')   existing.email   = f
    if (f.name === 'Apotheek Telefoon') existing.telefoon = f
  }

  // 2. Create "Apotheek E-mail" if missing
  if (existing.email) {
    results.apotheek_email = { status: 'already_exists', id: existing.email.id, name: existing.email.name }
  } else {
    const r = await fetch(`${base}/rest/api/3/field`, {
      method: 'POST', headers,
      body: JSON.stringify({
        name: 'Apotheek E-mail',
        description: 'E-mailadres apotheek — automatisch ingevuld vanuit Confluence bij ticket-aanmaak',
        type: 'com.atlassian.jira.plugin.system.customfieldtypes:textfield',
        searcherKey: 'com.atlassian.jira.plugin.system.customfieldtypes:textsearcher',
      }),
    })
    const d = await r.json()
    results.apotheek_email = r.ok
      ? { status: 'created', id: d.id, name: d.name }
      : { status: 'error', httpStatus: r.status, body: d }
  }

  // 3. Create "Apotheek Telefoon" if missing
  if (existing.telefoon) {
    results.apotheek_telefoon = { status: 'already_exists', id: existing.telefoon.id, name: existing.telefoon.name }
  } else {
    const r = await fetch(`${base}/rest/api/3/field`, {
      method: 'POST', headers,
      body: JSON.stringify({
        name: 'Apotheek Telefoon',
        description: 'Telefoonnummer apotheek — automatisch ingevuld vanuit Confluence bij ticket-aanmaak',
        type: 'com.atlassian.jira.plugin.system.customfieldtypes:textfield',
        searcherKey: 'com.atlassian.jira.plugin.system.customfieldtypes:textsearcher',
      }),
    })
    const d = await r.json()
    results.apotheek_telefoon = r.ok
      ? { status: 'created', id: d.id, name: d.name }
      : { status: 'error', httpStatus: r.status, body: d }
  }

  res.status(200).json({
    message: 'Kopieer de field IDs hieronder en geef ze door aan Claude.',
    results,
  })
}
