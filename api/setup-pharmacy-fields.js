// One-time setup: add Apotheek E-mail + Telefoon to all Jira project screens
// Visit /api/setup-pharmacy-fields once, then delete this file.

const FIELD_IDS = ['customfield_10214', 'customfield_10215']
const PROJECT_IDS = ['10000', '10039', '10038', '10037', '10072'] // FAM, HR, IT, OPS, SJTS

module.exports = async function handler(req, res) {
  const base = process.env.JIRA_BASE_URL || 'https://healis.atlassian.net'
  const creds = Buffer.from(`${process.env.JIRA_EMAIL}:${process.env.JIRA_API_TOKEN}`).toString('base64')
  const h = { 'Authorization': `Basic ${creds}`, 'Content-Type': 'application/json', 'Accept': 'application/json' }
  const log = []

  // 1. For each field: check context and associate with all projects if not global
  for (const fieldId of FIELD_IDS) {
    const ctxRes = await fetch(`${base}/rest/api/3/field/${fieldId}/context`, { headers: h })
    if (!ctxRes.ok) { log.push(`${fieldId}: context fetch failed (${ctxRes.status})`); continue }
    const ctxData = await ctxRes.json()
    const ctx = ctxData.values?.[0]
    if (!ctx) { log.push(`${fieldId}: no context found`); continue }

    if (ctx.isGlobalContext) {
      log.push(`${fieldId}: already global context — no project mapping needed`)
    } else {
      // Associate context with all projects
      const mapRes = await fetch(`${base}/rest/api/3/field/${fieldId}/context/${ctx.id}/project`, {
        method: 'PUT', headers: h,
        body: JSON.stringify({ projectIds: PROJECT_IDS }),
      })
      log.push(`${fieldId}: project mapping → ${mapRes.status} ${mapRes.ok ? 'OK' : await mapRes.text()}`)
    }
  }

  // 2. Add fields to all screens (makes them visible in Jira UI)
  const screensRes = await fetch(`${base}/rest/api/3/screens?maxResults=100`, { headers: h })
  if (!screensRes.ok) { log.push(`screens fetch failed (${screensRes.status})`); return res.status(200).json({ log }) }
  const screens = (await screensRes.json()).values || []
  log.push(`Found ${screens.length} screens`)

  for (const screen of screens) {
    // Get first tab of each screen
    const tabsRes = await fetch(`${base}/rest/api/3/screens/${screen.id}/tabs`, { headers: h })
    if (!tabsRes.ok) continue
    const tabs = await tabsRes.json()
    const tab = Array.isArray(tabs) ? tabs[0] : tabs.values?.[0]
    if (!tab) continue

    // Get existing fields on this tab to avoid duplicates
    const existingRes = await fetch(`${base}/rest/api/3/screens/${screen.id}/tabs/${tab.id}/fields`, { headers: h })
    const existingFields = existingRes.ok ? await existingRes.json() : []
    const existingIds = new Set((Array.isArray(existingFields) ? existingFields : existingFields.values || []).map(f => f.id))

    for (const fieldId of FIELD_IDS) {
      if (existingIds.has(fieldId)) {
        log.push(`screen ${screen.id} "${screen.name}": ${fieldId} already present`)
        continue
      }
      const addRes = await fetch(`${base}/rest/api/3/screens/${screen.id}/tabs/${tab.id}/fields`, {
        method: 'POST', headers: h,
        body: JSON.stringify({ fieldId }),
      })
      log.push(`screen ${screen.id} "${screen.name}": add ${fieldId} → ${addRes.status}`)
    }
  }

  res.status(200).json({ done: true, log })
}
