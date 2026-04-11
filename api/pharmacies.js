// ── Pharmacy sync endpoint ────────────────────────────────────────────────────
// Fetches all pharmacy pages from Confluence (children of a single parent page),
// parses their structured content section-by-section, and returns a normalised
// pharmacy array.  Auth reuses JIRA_EMAIL + JIRA_API_TOKEN (same Atlassian Cloud).

// ── HTML utilities ────────────────────────────────────────────────────────────

function stripHtml(str) {
  return str
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ').replace(/&#\d+;/g, '').replace(/\s+/g, ' ')
    .trim()
}

// Extract [key, value] from a single <tr> — handles both <th><td> and <td><td>
function extractKVFromRow(rowHtml) {
  const cellRegex = /<(th|td)[^>]*>([\s\S]*?)<\/\1>/gi
  const cells = []
  let m
  while ((m = cellRegex.exec(rowHtml)) !== null) {
    cells.push({ tag: m[1].toLowerCase(), text: stripHtml(m[2]) })
  }
  if (cells.length !== 2) return null                          // skip header/complex rows
  if (cells[0].tag === 'th' && cells[1].tag === 'th') return null  // skip table headers
  if (!cells[0].text || !cells[1].text) return null            // skip empty rows
  return [cells[0].text, cells[1].text]
}

// Extract all key-value pairs from all tables inside an HTML string
function extractKVPairsFromHtml(html) {
  const pairs = []
  const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi
  let rm
  while ((rm = rowRegex.exec(html)) !== null) {
    const kv = extractKVFromRow(rm[1])
    if (kv) pairs.push(kv)
  }
  return pairs
}

// Split page HTML into [{heading, html}] sections by h1–h4 tags
function splitIntoSections(html) {
  const sections = []
  const headingRegex = /<h[1-4][^>]*>([\s\S]*?)<\/h[1-4]>/gi
  const headings = []
  let hm
  while ((hm = headingRegex.exec(html)) !== null) {
    headings.push({ text: stripHtml(hm[1]), end: headingRegex.lastIndex })
  }

  if (!headings.length) return [{ heading: '_root', html }]

  // Content before first heading
  if (headings[0].end - headings[0].text.length > 0) {
    const pre = html.slice(0, html.indexOf('<h'))
    if (pre.trim()) sections.push({ heading: '_root', html: pre })
  }
  for (let i = 0; i < headings.length; i++) {
    const nextStart = headings[i + 1] ? html.indexOf('<h', headings[i].end) : html.length
    sections.push({ heading: headings[i].text, html: html.slice(headings[i].end, nextStart < 0 ? html.length : nextStart) })
  }
  return sections
}

// Classify a section heading into a parser context
function classifySection(heading) {
  const h = heading.toLowerCase()
  if (h === '_root') return 'basic'
  if (/contact|apotheek.?info|basis|algemeen|gegevens|identificat/.test(h)) return 'basic'
  if (/robot|automati|dispenseer|dispensing/.test(h)) return 'robot'
  if (/apparatuur|installat|toestel|equipment/.test(h)) return 'apparatuur'
  if (/leverancier|partner|lokale.?contact|techni/.test(h)) return 'leveranciers'
  if (/netwerk|internet|wifi|wi.fi/.test(h)) return 'netwerk'
  return 'extra'
}

// Extract rows from a multi-column table (>2 cols) → array of {col: val} objects.
// Skips placeholder values ("in te vullen", "-").
function extractEquipmentTable(html) {
  const entries = []
  const tableRegex = /<table[^>]*>([\s\S]*?)<\/table>/gi
  let tm
  while ((tm = tableRegex.exec(html)) !== null) {
    const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi
    const allRows = []
    let rm
    while ((rm = rowRegex.exec(tm[1])) !== null) {
      const cellRegex = /<(th|td)[^>]*>([\s\S]*?)<\/\1>/gi
      const cells = []
      let cm
      while ((cm = cellRegex.exec(rm[1])) !== null) cells.push(stripHtml(cm[2]))
      if (cells.length > 2) allRows.push(cells)
    }
    if (allRows.length < 2) continue
    const headers = allRows[0].map(h => h.toLowerCase().trim())
    for (let i = 1; i < allRows.length; i++) {
      const row = allRows[i]
      if (!row[0]) continue
      const entry = {}
      for (let j = 0; j < Math.min(headers.length, row.length); j++) {
        const v = row[j]
        if (v && !/^in te vullen$|^-+$|^_+$/i.test(v.trim())) entry[headers[j]] = v
      }
      if (Object.keys(entry).length > 1) entries.push(entry)
    }
  }
  return entries
}

// Map a key to a basic pharmacy field name (returns null if not a basic field)
function mapBasicKey(key) {
  const k = key.toLowerCase().replace(/\s+/g, ' ').trim()
  if (/^(alias|code|afkorting)$/.test(k))                              return 'alias'
  if (/^(naam|name|apotheek naam)$/.test(k))                           return 'name'
  if (/^(stad|gemeente|city|locatie)$/.test(k))                        return 'city'
  if (/^(telefoon|tel\.?|phone|gsm|tel apotheek|telefoon apotheek)$/.test(k)) return 'phone'
  if (/^(e-?mail|email apotheek)$/.test(k))                            return 'email'
  if (/^(provincie|province)$/.test(k))                                return 'province'
  if (/^apb/.test(k))                                                   return 'apb'
  return null
}

// Map a key to a robot sub-field
function mapRobotKey(key) {
  const k = key.toLowerCase().trim()
  if (/type|model|naam|robot|apparaat|merk/.test(k)) return 'type'
  if (/leverancier|fabrikant|vendor|firma/.test(k))  return 'leverancier'
  if (/telefoon|tel|phone/.test(k))                  return 'telefoon'
  if (/e-?mail/.test(k))                             return 'email'
  if (/contact/.test(k))                             return 'contact'
  return k.toLowerCase().replace(/[^a-z0-9]/g, '_')
}

// Map a key to a supplier type identifier
function mapLeverancierKey(key) {
  const k = key.toLowerCase().trim()
  if (/elektricien|electricien/.test(k))     return 'elektricien'
  if (/loodgieter|sanitair|installateur/.test(k)) return 'loodgieter'
  if (/^(it\b|it[-\s]support|helpdesk|informatica)/.test(k)) return 'it'
  if (/airco|hvac|verwarming|koeling/.test(k)) return 'airco'
  if (/alarm|beveiliging/.test(k))           return 'alarm'
  if (/schilder/.test(k))                    return 'schilder'
  if (/lift|elevator/.test(k))               return 'lift'
  return k.replace(/[^a-z0-9]/g, '_')
}

// Try to split "Naam Voornaam, 012/34 56 78" into { naam, telefoon }
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

// ── Main page parser ──────────────────────────────────────────────────────────

function parsePharmacyPage(title, bodyStorage) {
  const pharmacy = {}

  // Derive alias + name from page title  "AAR — Apotheek Van De Vel"
  const titleMatch = title.match(/^([A-Z]{3})\s*[-–—]\s*(.+)$/i)
  if (titleMatch) {
    pharmacy.alias = titleMatch[1].toUpperCase()
    pharmacy.name = titleMatch[2].trim()
  } else {
    pharmacy.name = title
  }

  const sections = splitIntoSections(bodyStorage)

  for (const { heading, html: sHtml } of sections) {
    const ctx = classifySection(heading)
    const pairs = extractKVPairsFromHtml(sHtml)

    for (const [rawKey, value] of pairs) {
      if (ctx === 'basic') {
        const field = mapBasicKey(rawKey)
        if (field) {
          if (field === 'alias') pharmacy.alias = value.toUpperCase()
          else pharmacy[field] = value
        } else {
          // Unknown key in basic section → extra
          if (!pharmacy.extra) pharmacy.extra = {}
          pharmacy.extra[rawKey] = value
        }

      } else if (ctx === 'robot') {
        if (!pharmacy.robot) pharmacy.robot = {}
        pharmacy.robot[mapRobotKey(rawKey)] = value

      } else if (ctx === 'leveranciers') {
        if (!pharmacy.leveranciers) pharmacy.leveranciers = {}
        const sType = mapLeverancierKey(rawKey)
        pharmacy.leveranciers[sType] = parseContactValue(value)

      } else if (ctx === 'netwerk') {
        if (!pharmacy.netwerk) pharmacy.netwerk = {}
        pharmacy.netwerk[rawKey.toLowerCase().replace(/[^a-z0-9]/g, '_')] = value

      } else {
        // 'extra' section — group by heading
        if (!pharmacy.extra) pharmacy.extra = {}
        const eKey = heading !== '_root' ? `${heading} — ${rawKey}` : rawKey
        pharmacy.extra[eKey] = value
      }
    }

    // 'apparatuur' sections use multi-column tables — parse separately
    if (ctx === 'apparatuur') {
      const equipRows = extractEquipmentTable(sHtml)
      for (const row of equipRows) {
        const typeVal = row['type'] || row['soort'] || Object.values(row)[0] || ''
        if (!typeVal) continue
        const model      = row['merk/model'] || row['model'] || row['merk']
        const leverancier = row['leverancier']
        const telefoon   = row['telefoon leverancier'] || row['telefoon']
        if (/robot/i.test(typeVal)) {
          if (!pharmacy.robot) pharmacy.robot = {}
          if (model)              pharmacy.robot.type        = model
          if (leverancier)        pharmacy.robot.leverancier = leverancier
          if (telefoon)           pharmacy.robot.telefoon    = telefoon
          if (row['serienummer']) pharmacy.robot.serienummer = row['serienummer']
        } else {
          if (!pharmacy.leveranciers) pharmacy.leveranciers = {}
          const key = typeVal.toLowerCase().replace(/[^a-z0-9]/g, '_')
          pharmacy.leveranciers[key] = {
            ...(model       ? { model }            : {}),
            ...(leverancier ? { naam: leverancier } : {}),
            ...(telefoon    ? { telefoon }          : {}),
          }
        }
      }
    }
  }

  return pharmacy
}

// ── Tiny-link / page ID resolution ───────────────────────────────────────────

async function resolveParentPageId(base, creds) {
  // Explicit override via env var
  if (process.env.CONFLUENCE_PHARMACY_PAGE_ID) return process.env.CONFLUENCE_PHARMACY_PAGE_ID

  // Known page ID for healis.atlassian.net (parent page "Apotheken — Overzicht")
  const KNOWN_ID = '32276481'
  const shortlink = process.env.CONFLUENCE_PHARMACY_SHORTLINK || 'AYDsAQ'

  // Try to resolve the tiny link dynamically (confirms the ID is still valid)
  try {
    const r1 = await fetch(`${base}/wiki/x/${shortlink}`, {
      headers: { 'Authorization': `Basic ${creds}`, 'Accept': 'text/html' },
      redirect: 'follow',
    })
    const m = r1.url.match(/\/pages\/(\d+)/)
    if (m) return m[1]
  } catch {}

  try {
    const r2 = await fetch(`${base}/wiki/x/${shortlink}`, {
      headers: { 'Authorization': `Basic ${creds}` },
      redirect: 'manual',
    })
    const loc = r2.headers.get('location') || ''
    const m = loc.match(/\/pages\/(\d+)/)
    if (m) return m[1]
  } catch {}

  return KNOWN_ID  // fallback to hardcoded known ID
}

// ── Jira custom field option sync ─────────────────────────────────────────────
// Ensures every pharmacy from Confluence has a corresponding dropdown option
// in customfield_10107. Requires the API token to have Jira admin rights.
// Fails silently — ticket creation still works, the field just won't be set.

async function syncJiraOptions(base, creds, pharmacies) {
  try {
    // 1. Fetch field context ID
    const ctxRes = await fetch(
      `${base}/rest/api/3/field/customfield_10107/context`,
      { headers: { 'Authorization': `Basic ${creds}`, 'Accept': 'application/json' } }
    )
    if (!ctxRes.ok) return []
    const ctxData = await ctxRes.json()
    const contextId = ctxData.values?.[0]?.id
    if (!contextId) return []

    // 2. Fetch existing options
    const optRes = await fetch(
      `${base}/rest/api/3/field/customfield_10107/context/${contextId}/option?maxResults=200`,
      { headers: { 'Authorization': `Basic ${creds}`, 'Accept': 'application/json' } }
    )
    if (!optRes.ok) return []
    const optData = await optRes.json()
    const existing = optData.values || []

    // 3. Determine which pharmacies have no option yet (match on alias prefix)
    const existingAliases = new Set(
      existing.map(o => o.value.split(' - ')[0].toUpperCase().trim())
    )
    const toAdd = pharmacies.filter(
      p => p.alias && p.name && !existingAliases.has(p.alias.toUpperCase())
    )

    if (!toAdd.length) return existing

    // 4. Create missing options
    const createRes = await fetch(
      `${base}/rest/api/3/field/customfield_10107/context/${contextId}/option`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${creds}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ options: toAdd.map(p => ({ value: `${p.alias} - ${p.name}` })) }),
      }
    )
    if (!createRes.ok) return existing
    const created = await createRes.json()
    return [...existing, ...(created.options || [])]
  } catch {
    return []
  }
}

// ── Vercel handler ────────────────────────────────────────────────────────────

module.exports = async function handler(req, res) {
  const base = process.env.JIRA_BASE_URL || 'https://healis.atlassian.net'
  const creds = Buffer.from(`${process.env.JIRA_EMAIL}:${process.env.JIRA_API_TOKEN}`).toString('base64')

  try {
    const parentPageId = await resolveParentPageId(base, creds)

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
      .filter(p => p.alias)

    const jiraApotheekOptions = await syncJiraOptions(base, creds, pharmacies)
    res.status(200).json({ pharmacies, fetchedAt: Date.now(), total: pharmacies.length, jiraApotheekOptions })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
