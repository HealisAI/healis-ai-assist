// ── Pharmacy sync endpoint ────────────────────────────────────────────────────
// Fetches all pharmacy pages from Confluence (children of a single parent page),
// parses their structured content, and returns a normalised pharmacy array.
// Auth reuses JIRA_EMAIL + JIRA_API_TOKEN (same Atlassian Cloud instance).

function stripHtml(str) {
  return str
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#\d+;/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

// Extract [key, value] pairs from <th>...</th><td>...</td> table rows
function extractKeyValuePairs(html) {
  const pairs = []
  const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi
  let rowMatch
  while ((rowMatch = rowRegex.exec(html)) !== null) {
    const row = rowMatch[1]
    const thMatch = /<th[^>]*>([\s\S]*?)<\/th>/i.exec(row)
    const tdMatch = /<td[^>]*>([\s\S]*?)<\/td>/i.exec(row)
    if (thMatch && tdMatch) {
      const key = stripHtml(thMatch[1])
      const value = stripHtml(tdMatch[1])
      if (key && value) pairs.push([key, value])
    }
  }
  return pairs
}

// Split "Jan Pieters, 053/77 74 60" into { naam, telefoon }
function parseContactValue(value) {
  const phoneRegex = /(\b[\d\s\/\.\-]{8,}\b)/
  const match = value.match(phoneRegex)
  if (match) {
    const telefoon = match[1].trim()
    const naam = value.replace(match[0], '').replace(/[,;:]+/g, '').trim() || undefined
    return naam ? { naam, telefoon } : { telefoon }
  }
  return { naam: value }
}

function parsePharmacyPage(title, bodyStorage) {
  const pairs = extractKeyValuePairs(bodyStorage)
  const pharmacy = {}

  // Try to extract alias and name from page title "AAA - Apotheek Name"
  const titleAliasMatch = title.match(/^([A-Z]{3})\s*[-–—]\s*(.+)$/i)
  if (titleAliasMatch) {
    pharmacy.alias = titleAliasMatch[1].toUpperCase()
    pharmacy.name = titleAliasMatch[2].trim()
  } else {
    pharmacy.name = title
  }

  for (const [rawKey, value] of pairs) {
    const key = rawKey.toLowerCase().trim()

    if (/^(alias|code|afkorting)$/.test(key)) {
      pharmacy.alias = value.toUpperCase()
    } else if (/^(naam|name)$/.test(key)) {
      pharmacy.name = value
    } else if (/^(stad|gemeente|city)$/.test(key)) {
      pharmacy.city = value
    } else if (/^(telefoon|tel\.?|phone|gsm)$/.test(key)) {
      pharmacy.phone = value
    } else if (/^email$/.test(key)) {
      pharmacy.email = value.toLowerCase()
    } else if (/^(provincie|province)$/.test(key)) {
      pharmacy.province = value
    } else if (/^apb/.test(key)) {
      pharmacy.apb = value
    } else if (/robot/.test(key)) {
      if (!pharmacy.robot) pharmacy.robot = {}
      if (/type|model/.test(key))         pharmacy.robot.type = value
      else if (/leverancier/.test(key))   pharmacy.robot.leverancier = value
      else if (/telefoon|tel/.test(key))  pharmacy.robot.telefoon = value
      else if (!pharmacy.robot.type)      pharmacy.robot.type = value
      else                                pharmacy.robot[rawKey] = value
    } else if (/elektricien|electricien/.test(key)) {
      if (!pharmacy.leveranciers) pharmacy.leveranciers = {}
      pharmacy.leveranciers.elektricien = parseContactValue(value)
    } else if (/loodgieter|sanitair/.test(key)) {
      if (!pharmacy.leveranciers) pharmacy.leveranciers = {}
      pharmacy.leveranciers.loodgieter = parseContactValue(value)
    } else if (/^(it\b|it[-\s]support|helpdesk|informatica)/.test(key)) {
      if (!pharmacy.leveranciers) pharmacy.leveranciers = {}
      pharmacy.leveranciers.it = parseContactValue(value)
    } else {
      if (!pharmacy.extra) pharmacy.extra = {}
      pharmacy.extra[rawKey] = value
    }
  }

  return pharmacy
}

async function resolveParentPageId(base, creds, shortlink) {
  // If CONFLUENCE_PHARMACY_PAGE_ID is set directly, use it
  if (process.env.CONFLUENCE_PHARMACY_PAGE_ID) {
    return process.env.CONFLUENCE_PHARMACY_PAGE_ID
  }

  // Resolve the tiny link — try following the redirect to extract the page ID
  const url = `${base}/wiki/x/${shortlink}`
  try {
    const res = await fetch(url, {
      headers: { 'Authorization': `Basic ${creds}`, 'Accept': 'text/html' },
      redirect: 'follow',
    })
    const pageMatch = res.url.match(/\/pages\/(\d+)/)
    if (pageMatch) return pageMatch[1]
  } catch {}

  // Fallback: manual redirect
  try {
    const res = await fetch(`${base}/wiki/x/${shortlink}`, {
      headers: { 'Authorization': `Basic ${creds}` },
      redirect: 'manual',
    })
    const location = res.headers.get('location') || ''
    const locMatch = location.match(/\/pages\/(\d+)/)
    if (locMatch) return locMatch[1]
  } catch {}

  return null
}

module.exports = async function handler(req, res) {
  const base = process.env.JIRA_BASE_URL || 'https://healis.atlassian.net'
  const creds = Buffer.from(`${process.env.JIRA_EMAIL}:${process.env.JIRA_API_TOKEN}`).toString('base64')
  const shortlink = process.env.CONFLUENCE_PHARMACY_SHORTLINK || 'AYDsAQ'

  try {
    const parentPageId = await resolveParentPageId(base, creds, shortlink)
    if (!parentPageId) {
      return res.status(500).json({ error: 'Could not resolve Confluence parent page ID. Set CONFLUENCE_PHARMACY_PAGE_ID to override.' })
    }

    const childRes = await fetch(
      `${base}/wiki/rest/api/content/${parentPageId}/child/page?limit=100&expand=body.storage,title`,
      { headers: { 'Authorization': `Basic ${creds}`, 'Accept': 'application/json' } }
    )

    if (!childRes.ok) {
      const err = await childRes.text()
      return res.status(childRes.status).json({ error: `Confluence API error: ${err}` })
    }

    const childData = await childRes.json()
    const pages = childData.results || []

    const pharmacies = pages
      .map(page => parsePharmacyPage(page.title, page.body?.storage?.value || ''))
      .filter(p => p.alias) // Only include pages with a resolvable alias

    res.status(200).json({ pharmacies, fetchedAt: Date.now(), total: pharmacies.length })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
