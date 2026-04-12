import { useState, useRef, useCallback, useEffect } from "react";
import { Analytics } from '@vercel/analytics/react';

const API_HEADERS = { "Content-Type": "application/json" };

// ── PHARMACY DATA ─────────────────────────────────────────────────────────────
const PHARMACIES = [
  { alias:"AAA", name:"Apotheek Jongen",            city:"Aalst",               phone:"053/77 74 60", email:"apotheek.jongen@healis.be",           province:"Oost-Vlaanderen", apb:"APB 410201" },
  { alias:"AAG", name:"Apotheek Roosevelt",          city:"Antwerpen",           phone:"03/233 54 53", email:"apotheek.roosevelt@healis.be",        province:"Antwerpen",       apb:"APB 110271" },
  { alias:"AAJ", name:"Apotheek Sint-Jacob",         city:"Antwerpen",           phone:"03/231 93 74", email:"apotheek.sintjacob@healis.be",        province:"Antwerpen",       apb:"APB 110219" },
  { alias:"AAK", name:"Apotheek Van Ghyseghem",      city:"Antwerpen",           phone:"03/238 57 59", email:"apotheek.kloosterstraat@healis.be",   province:"Antwerpen",       apb:"APB 110315" },
  { alias:"AAR", name:"Apotheek Van De Vel",         city:"Ardooie",             phone:"051/74 40 17", email:"apotheek.vandevel@healis.be",         province:"West-Vlaanderen", apb:"APB 360101" },
  { alias:"AAS", name:"Apotheek Vandenweghe",        city:"Ardooie",             phone:"051/74 41 91", email:"apotheek.vandenweghe@healis.be",      province:"West-Vlaanderen", apb:"APB 360102" },
  { alias:"AAT", name:"Apotheek Broeckx",            city:"Antwerpen",           phone:"03/233 60 65", email:"apotheek.broeckx@healis.be",          province:"Antwerpen",       apb:"APB 110248" },
  { alias:"ABB", name:"Kruispuntapotheek",           city:"Baal",                phone:"016/53 53 01", email:"kruispuntapotheek@healis.be",         province:"Vlaams Brabant",  apb:"APB 240602" },
  { alias:"ABE", name:"Apotheek Poppe",              city:"Beernem",             phone:"050/78 88 99", email:"apotheek.poppe@healis.be",            province:"West-Vlaanderen", apb:"APB 310302" },
  { alias:"ABO", name:"Apotheek Boeykens",           city:"Bornem",              phone:"03/889 06 21", email:"apotheek.bornem@healis.be",           province:"Brussel",         apb:"APB 120701" },
  { alias:"ABP", name:"Apotheek Baal",               city:"Baal",                phone:"016/53 00 42", email:"apotheek.baal@healis.be",             province:"Vlaams Brabant",  apb:"APB 240601" },
  { alias:"ABV", name:"Apotheek Vandekerckhove",     city:"Roeselare-Beveren",   phone:"051/25 00 90", email:"apotheek.vandekerckhove@healis.be",   province:"West-Vlaanderen", apb:"APB 361518" },
  { alias:"AGE", name:"Apotheek Thiels",             city:"Geel",                phone:"014/58 85 75", email:"apotheek.thiels@healis.be",           province:"Antwerpen",       apb:"APB 130801" },
  { alias:"AHI", name:"Apotheek Hildegard",          city:"Evere (Brussel)",     phone:"02/215 37 12", email:"hildegard@healis.be",                 province:"Brussel",         apb:"APB 211406" },
  { alias:"AHO", name:"Apotheek Houthalen",          city:"Houthalen",           phone:"011/52 27 55", email:"apotheek.houthalen@healis.be",        province:"Limburg",         apb:"APB 721505" },
  { alias:"AKD", name:"Apotheek Kermt",              city:"Kermt",               phone:"011/25 24 52", email:"apotheek.kermt@healis.be",            province:"Limburg",         apb:"APB 712902" },
  { alias:"AKK", name:"Apotheek Engelen",            city:"Kermt",               phone:"011/25 53 05", email:"apotheek.engelen@healis.be",          province:"Limburg",         apb:"APB 712901" },
  { alias:"AKN", name:"Apotheek Demarez",            city:"Knokke-Heist",        phone:"050/60 26 51", email:"apotheek.demarez@healis.be",          province:"West-Vlaanderen", apb:"APB 311402" },
  { alias:"ALA", name:"Apotheek Landen",             city:"Landen",              phone:"011/88 38 51", email:"apotheek.vanbrabant@healis.be",       province:"Vlaams Brabant",  apb:"APB 246002" },
  { alias:"ALD", name:"Apotheek Lummen",             city:"Lummen",              phone:"013/53 11 53", email:"apotheek.lummen@healis.be",           province:"Limburg",         apb:"APB 713701" },
  { alias:"ALG", name:"Apotheek Genenbos",           city:"Lummen",              phone:"011/42 16 85", email:"apotheek.genenbos@healis.be",         province:"Limburg",         apb:"APB 713703" },
  { alias:"AOO", name:"Apotheek Piers",              city:"Oostende",            phone:"059/70 28 25", email:"apotheek.piers@healis.be",            province:"West-Vlaanderen", apb:"APB 351314" },
  { alias:"ARK", name:"Apotheek Desloovere",         city:"Rollegem-Kapelle",    phone:"056/50 66 30", email:"apotheek.desloovere@healis.be",       province:"West-Vlaanderen", apb:"APB 361003" },
  { alias:"ARU", name:"Apotheek Vierstraete",        city:"Roeselare-Rumbeke",   phone:"051/20 22 67", email:"apotheek.vierstraete@healis.be",      province:"West-Vlaanderen", apb:"APB 361703" },
  { alias:"ASL", name:"Apotheek Bollengier",         city:"Sleidinge",           phone:"09/357 35 24", email:"apotheek.bollengier@healis.be",       province:"Oost-Vlaanderen", apb:"APB 446602" },
  { alias:"ATR", name:"Apotheek Tremelo",            city:"Tremelo",             phone:"016/53 00 31", email:"apotheek.tremelo@healis.be",          province:"Vlaams Brabant",  apb:"APB 263502" },
  { alias:"AVO", name:"Pharmacie Place Saint-Denis", city:"Brussel-Vorst",       phone:"02/378 36 74", email:"pharmacie.placesaintdenis@healis.be", province:"Brussel",         apb:"APB 211619" },
  { alias:"AWE", name:"Apotheek Cools",              city:"Wenduine",            phone:"050/41 15 96", email:"apotheek.cools@healis.be",            province:"West-Vlaanderen", apb:"APB 313901" },
  { alias:"AWR", name:"Apotheek Vlamynck",           city:"Westrozebeke",        phone:"051/78 05 06", email:"apotheek.westrozebeke@healis.be",     province:"West-Vlaanderen", apb:"APB 362001" },
  { alias:"AZE", name:"Apotheek Zedelgem",           city:"Zedelgem",            phone:"050/20 94 41", email:"apotheek.zedelgem@healis.be",         province:"West-Vlaanderen", apb:"APB 314102" },
  { alias:"AZU", name:"Apotheek Martens",            city:"Zutendaal",           phone:"089/61 16 74", email:"apotheek.thoen@healis.be",            province:"Limburg",         apb:"APB 716701" },
];

function matchPharmacy(text, list = PHARMACIES) {
  if (!text) return null;
  const t = text.toLowerCase();
  return (
    list.find(p => p.alias && t.includes(p.alias.toLowerCase())) ||
    list.find(p => p.name && p.name.toLowerCase().split(" ").filter(w => w.length > 3).some(w => t.includes(w))) ||
    list.find(p => { if (!p.city) return false; const c = p.city.toLowerCase().replace(/\d+\s*/g,"").trim(); return c.length > 3 && t.includes(c); }) ||
    null
  );
}

// ── HELPERS ───────────────────────────────────────────────────────────────────

// Merge Confluence data onto the hard-coded list so basic fields (city, phone,
// email, apb, province) always come from PHARMACIES, while Confluence-only
// fields (robot, leveranciers, extra) are added on top.
// New pharmacies only in Confluence (not yet hard-coded) are appended as-is.
function mergePharmacyData(confluenceList) {
  const enriched = PHARMACIES.map(base => {
    const cp = confluenceList.find(c => c.alias === base.alias);
    if (!cp) return base;
    return {
      ...base,
      // Only override basic fields if Confluence actually has a value
      name:     cp.name     || base.name,
      city:     cp.city     || base.city,
      phone:    cp.phone    || base.phone,
      email:    cp.email    || base.email,
      province: cp.province || base.province,
      apb:      cp.apb      || base.apb,
      // Confluence-specific enrichment fields
      ...(cp.robot        ? { robot:        cp.robot }        : {}),
      ...(cp.leveranciers ? { leveranciers: cp.leveranciers } : {}),
      ...(cp.extra        ? { extra:        cp.extra }        : {}),
    };
  });
  // Append pharmacies only in Confluence (not yet in hard-coded list)
  const hardCodedAliases = new Set(PHARMACIES.map(p => p.alias));
  const onlyInConfluence = confluenceList.filter(cp => !hardCodedAliases.has(cp.alias));
  return [...enriched, ...onlyInConfluence];
}

function formatSyncAge(ts) {
  if (!ts) return "";
  const mins = Math.floor((Date.now() - ts) / 60000);
  if (mins < 1)  return "zojuist";
  if (mins < 60) return `${mins} min geleden`;
  const hrs = Math.floor(mins / 60);
  return hrs === 1 ? "1 uur geleden" : `${hrs} uur geleden`;
}

function buildAIPharmacyContext(pharmacy, inputText) {
  if (!pharmacy) return inputText;
  const lines = [];
  if (pharmacy.robot?.type) {
    let r = `Robot: ${pharmacy.robot.type}`;
    if (pharmacy.robot.leverancier) r += ` (leverancier: ${pharmacy.robot.leverancier}${pharmacy.robot.telefoon ? `, tel: ${pharmacy.robot.telefoon}` : ""})`;
    lines.push(r);
  }
  if (pharmacy.leveranciers) {
    for (const [type, c] of Object.entries(pharmacy.leveranciers)) {
      if (c.naam || c.telefoon) {
        const label = type.charAt(0).toUpperCase() + type.slice(1);
        lines.push(`${label}: ${c.naam || ""}${c.telefoon ? ` (${c.telefoon})` : ""}`.trim());
      }
    }
  }
  if (pharmacy.netwerk) {
    for (const [k, v] of Object.entries(pharmacy.netwerk)) lines.push(`Netwerk ${k}: ${v}`);
  }
  if (pharmacy.extra) {
    for (const [k, v] of Object.entries(pharmacy.extra)) lines.push(`${k}: ${v}`);
  }
  if (!lines.length) return inputText;
  return `[Apotheek-specifieke info ${pharmacy.alias}:\n${lines.join("\n")}]\n\n${inputText}`;
}

// ── JIRA OPTION MAPS ──────────────────────────────────────────────────────────
const JIRA_APOTHEEK_MAP = {
  AAA:"AAA - Apotheek Jongen",       AAG:"AAG - Apotheek Roosevelt",
  AAJ:"AAJ - Apotheek Sint-Jacob",   AAK:"AAK - Apotheek Kloosterstraat",
  AAR:"AAR - Apotheek Van De Vel",   AAS:"AAS - Apotheek Vandenweghe",
  AAT:"AAT - Apotheek Broeckx",      ABB:"ABB - Kruispuntapotheek",
  ABE:"ABE - Apotheek Poppe",        ABO:"ABO - Apotheek Boeykens",
  ABP:"ABP - Apotheek Baal",         ABV:"ABV - Apotheek Vandekerckhove",
  AGE:"AGE - Apotheek Thiels",       AHI:"AHI - Apotheek Hildegard",
  AHO:"AHO - Apotheek Houthalen",    AKD:"AKD - Apotheek Kermt",
  AKK:"AKK - Apotheek Engelen",      AKN:"AKN - Apotheek Demarez",
  ALA:"ALA - Apotheek Landen",       ALD:"ALD - Apotheek Lummen",
  ALG:"ALG - Apotheek Genenbos",     AOO:"AOO - Apotheek Piers",
  ARK:"ARK - Apotheek Desloovere",   ARU:"ARU - Apotheek Vierstraete",
  ASL:"ASL - Apotheek Bollengier",   ATR:"ATR - Apotheek Tremelo",
  AVO:"AVO - Pharmacie Place Saint-Denis", AWE:"AWE - Apotheek Cools",
  AWR:"AWR - Apotheek Vlamynck",     AZE:"AZE - Apotheek Zedelgem",
  AZU:"AZU - Apotheek Martens",
};
const IT_CATEGORIE_MAP   = { Internet:"Internet (Wi-Fi, Netwerk, ...)", Software:"Software (Farmad, Microsoft, ...)", Hardware:"Hardware (Computer, Kassa, Betaalterminal, ...)", Account:"Account (Paswoord, Access, ...)", Andere:"Andere" };
const GEBOUW_TYPE_MAP    = { Deuren:"Deuren, sloten, badges, rolluiken", Elektriciteit:"Elektriciteit, zekeringen, stopcontacten", Verwarming:"Verwarming, airco, ventilatie", Water:"Water, lekkage, vocht, geur", Alarm:"Alarm, camera's, noodverlichting", Schoonmaak:"Schoonmaak, verlichting, ramen", Andere:"Andere" };
const APOTHEEK_TYPE_MAP  = { Toonbank:"Toonbank, kasten, schappen, laden", Stoelen:"Stoelen, tafels, consultruimte", Koelmeubels:"Koelmeubels/koelkasten (in apotheek)", Signalisatie:"Signalisatie, displays, etalageframes", Rekken:"Rekken, trolleys, klein materiaal", Labomateriaal:"Labomateriaal (weegschalen, mortieren, geluliers, zalfmolens,...)", Bureaumateriaal:"Klein bureaumateriaal (papier, pennen, toner, \u2026)", Andere:"Andere" };
const HR_PLANNING_MAP    = { Bezetting:"Bezetting & planning", Vacatures:"Vacatures & vervanging", Teamafspraken:"Teamafspraken & samenwerking", Evaluaties:"Evaluaties & feedback", Escalaties:"Escalaties & personeeldossiers", Andere:"Andere" };
const HR_MEDEWERKER_MAP  = { Onboarding:"Onboarding & offboarding", Loon:"Loon, attesten, correcties", Verlof:"Verlof, ziekte, afwezigheden", Opleiding:"Opleiding, certificaten", Welzijn:"Welzijn, conflict ", Andere:"Andere" };
const KLACHT_MAP         = { Service:"Service & wachttijd", Medicatie:"Medicatie & advies", Prijs:"Prijs & terugbetaling", Voorraad:"Voorraad & bestelling", Privacy:"Privacy & administratie", Andere:"Andere" };

// ── STAGE & CATEGORY META ─────────────────────────────────────────────────────
const STAGE = { HUB:"hub", SELECT:"select", IDLE:"idle", RECORDING:"recording", TRANSCRIBING:"transcribing", PROCESSING:"processing", REVIEW:"review", CREATING:"creating", DONE:"done" };

const CAT_META = {
  IT:           { label:"IT Support",         color:"#E8F5EC", tx:"#008624", br:"#7AC483", project:"IT",  issueType:"Support" },
  Gebouwbeheer: { label:"Facility · Gebouw",  color:"#FFF4E5", tx:"#854F0B", br:"#EF9F27", project:"FAM", issueType:"Incident" },
  Apotheek:     { label:"Facility · Apotheek",color:"#E1F5EE", tx:"#008624", br:"#5DCAA5", project:"FAM", issueType:"Service Request" },
  HR_Medewerker:{ label:"HR · Medewerker",    color:"#F0EEFF", tx:"#6B63C9", br:"#B8B3EE", project:"HR",  issueType:"Issue" },
  HR_Planning:  { label:"HR · Planning",      color:"#F0EEFF", tx:"#6B63C9", br:"#B8B3EE", project:"HR",  issueType:"Issue" },
  Klacht:       { label:"Operations · Klacht",color:"#FCEBEB", tx:"#A32D2D", br:"#F09595", project:"OPS", issueType:"Task" },
};
const PRIORITY_META = {
  "Business Critical":{ color:"#FCEBEB", tx:"#A32D2D", br:"#F09595", dot:"🔴" },
  "High":             { color:"#FFF4E5", tx:"#854F0B", br:"#EF9F27", dot:"🟠" },
  "Medium":           { color:"#E8F5EC", tx:"#008624", br:"#7AC483", dot:"🟡" },
  "Low":              { color:"#F1EFE8", tx:"#5F5E5A", br:"#B4B2A9", dot:"⚪" },
  "Lowest":           { color:"#F1EFE8", tx:"#5F5E5A", br:"#B4B2A9", dot:"⚪" },
};

// ── SHARED UI COMPONENTS ──────────────────────────────────────────────────────
function HealisLogo({ width = 110 }) {
  const h = Math.round(width * 168.53 / 593.26);
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 593.26 168.53" width={width} height={h} aria-label="Healis">
      <path fill="#008624" d="M0 75.31h64.23V85H0zM75.88 97.22h9.69v64.23h-9.69zM75.88 0h9.69v64.23h-9.69z"/>
      <path fill="#8c84e3" d="M97.22 75.88h64.23v9.69H97.22zM173.1 0h9.69v161.45h-9.69z"/>
      <g fill="#008624">
        <path d="M566.66 122.66c15.18 0 26.6-6.94 26.6-18.48 0-10.71-10.12-16.12-24.01-18.01-12.83-1.77-19.77-4.12-19.77-8.12 0-4.24 7.06-7.18 17.07-7.18s17.42 3.41 17.42 8.24h8.24c0-11.18-10.59-19.3-25.66-19.3-14.12 0-25.19 6.59-25.19 17.77 0 10.36 9.42 16.01 23.3 18.01 13.06 1.77 20.36 3.88 20.36 8.36s-7.41 7.65-18.24 7.65-18.48-3.77-18.48-9.06h-8c0 11.53 10.83 20.13 26.36 20.13M519 121.24h8V61.22h-8zm4-71.91c4.24 0 7.41-2.82 7.41-6.36s-3.18-6.47-7.41-6.47-7.41 2.82-7.41 6.47 3.18 6.36 7.41 6.36m-29.18 71.91h8V36.51h-8v84.74zm-48.73-10c-13.54 0-23.54-8.59-23.54-20.01s10-20.01 23.54-20.01 23.54 8.59 23.54 20.01-10.12 20.01-23.54 20.01m23.54-50.02v15.42c-4.47-10.12-13.77-16.83-25.42-16.83-17.18 0-30.01 13.53-30.01 31.42s12.83 31.42 30.01 31.42c11.65 0 20.95-6.71 25.42-16.83v15.42h8V61.22zm-96.86 10.12c11.77 0 21.3 6.36 23.42 15.54h-46.84c2.24-9.18 11.53-15.54 23.42-15.54m31.9 20.13c0-18.24-13.77-31.66-31.9-31.66s-32.01 13.53-32.01 31.42 13.77 31.42 32.13 31.42c14.01 0 25.54-7.41 30.48-18.71h-9.77c-4.12 4.35-11.89 7.18-20.6 7.18-12.24 0-21.42-6.47-23.66-15.65h55.08c.12-1.3.24-2.71.24-4m-86.85-51.43v34.13h-49.43V40.04h-8.71v81.21h8.71v-34.6h49.43v34.6h8.71V40.04z"/>
      </g>
    </svg>
  );
}

function HealisLogoWhite({ width = 110 }) {
  const h = Math.round(width * 168.53 / 593.26);
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 593.26 168.53" width={width} height={h} aria-label="Healis">
      <path fill="#ffffff" d="M0 75.31h64.23V85H0zM75.88 97.22h9.69v64.23h-9.69zM75.88 0h9.69v64.23h-9.69z"/>
      <path fill="#c4bff5" d="M97.22 75.88h64.23v9.69H97.22zM173.1 0h9.69v161.45h-9.69z"/>
      <g fill="#ffffff">
        <path d="M566.66 122.66c15.18 0 26.6-6.94 26.6-18.48 0-10.71-10.12-16.12-24.01-18.01-12.83-1.77-19.77-4.12-19.77-8.12 0-4.24 7.06-7.18 17.07-7.18s17.42 3.41 17.42 8.24h8.24c0-11.18-10.59-19.3-25.66-19.3-14.12 0-25.19 6.59-25.19 17.77 0 10.36 9.42 16.01 23.3 18.01 13.06 1.77 20.36 3.88 20.36 8.36s-7.41 7.65-18.24 7.65-18.48-3.77-18.48-9.06h-8c0 11.53 10.83 20.13 26.36 20.13M519 121.24h8V61.22h-8zm4-71.91c4.24 0 7.41-2.82 7.41-6.36s-3.18-6.47-7.41-6.47-7.41 2.82-7.41 6.47 3.18 6.36 7.41 6.36m-29.18 71.91h8V36.51h-8v84.74zm-48.73-10c-13.54 0-23.54-8.59-23.54-20.01s10-20.01 23.54-20.01 23.54 8.59 23.54 20.01-10.12 20.01-23.54 20.01m23.54-50.02v15.42c-4.47-10.12-13.77-16.83-25.42-16.83-17.18 0-30.01 13.53-30.01 31.42s12.83 31.42 30.01 31.42c11.65 0 20.95-6.71 25.42-16.83v15.42h8V61.22zm-96.86 10.12c11.77 0 21.3 6.36 23.42 15.54h-46.84c2.24-9.18 11.53-15.54 23.42-15.54m31.9 20.13c0-18.24-13.77-31.66-31.9-31.66s-32.01 13.53-32.01 31.42 13.77 31.42 32.13 31.42c14.01 0 25.54-7.41 30.48-18.71h-9.77c-4.12 4.35-11.89 7.18-20.6 7.18-12.24 0-21.42-6.47-23.66-15.65h55.08c.12-1.3.24-2.71.24-4m-86.85-51.43v34.13h-49.43V40.04h-8.71v81.21h8.71v-34.6h49.43v34.6h8.71V40.04z"/>
      </g>
    </svg>
  );
}

function Badge({ color, tx, br, children }) {
  return <span style={{display:"inline-flex",alignItems:"center",gap:4,background:color,color:tx,border:`0.5px solid ${br}`,borderRadius:6,padding:"2px 9px",fontSize:12,fontWeight:500}}>{children}</span>;
}
function PriorityBadge({ priority }) {
  const m = PRIORITY_META[priority] || PRIORITY_META["Medium"];
  return <Badge color={m.color} tx={m.tx} br={m.br}>{m.dot} {priority}</Badge>;
}
function CatBadge({ category }) {
  const m = CAT_META[category] || { label:category||"Support", color:"#F1EFE8", tx:"#5F5E5A", br:"#B4B2A9" };
  return <Badge color={m.color} tx={m.tx} br={m.br}>{m.label}</Badge>;
}
function Spinner({ size=18, color="#008624" }) {
  return <span style={{display:"inline-block",width:size,height:size,border:`2.5px solid var(--color-border-tertiary)`,borderTopColor:color,borderRadius:"50%",animation:"hspin .75s linear infinite",flexShrink:0}} />;
}
function CriticalAlertIcon({ size=28 }) {
  return (
    <span style={{display:"inline-flex",alignItems:"center",justifyContent:"center",width:size,height:size,borderRadius:size/2,background:"#FFFFFF",flexShrink:0}}>
      <span style={{fontFamily:"Arial,Helvetica,sans-serif",fontSize:Math.round(size*0.64),lineHeight:`${size}px`,fontWeight:800,color:"#B42318"}}>!</span>
    </span>
  );
}
function FieldRow({ label, value, editable, onChange, mono }) {
  return (
    <div style={{display:"grid",gridTemplateColumns:"160px 1fr",gap:8,alignItems:"start",padding:"7px 0",borderBottom:"0.5px solid var(--color-border-tertiary)"}}>
      <span style={{fontSize:12,color:"var(--color-text-secondary)",paddingTop:editable?7:2,fontWeight:500}}>{label}</span>
      {editable
        ? <input value={value||""} onChange={e=>onChange(e.target.value)} style={{fontSize:13,padding:"4px 8px",borderRadius:6,border:"0.5px solid var(--color-border-secondary)",background:"var(--color-background-secondary)",color:"var(--color-text-primary)",width:"100%",boxSizing:"border-box",fontFamily:mono?"var(--font-mono)":"var(--font-sans)"}} />
        : <span style={{fontSize:13,color:"var(--color-text-primary)",lineHeight:1.5,fontFamily:mono?"var(--font-mono)":"inherit"}}>{value||<span style={{color:"var(--color-text-tertiary)",fontStyle:"italic"}}>Niet gedetecteerd</span>}</span>
      }
    </div>
  );
}

function BrandingPanel() {
  return (
    <div className="select-left">
      <div style={{position:"relative",zIndex:1,display:"flex",flexDirection:"column",height:"100%"}}>
        <div style={{fontSize:12,fontWeight:600,color:"rgba(255,255,255,0.55)",letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:14}}>Healis Assist</div>
        <div style={{fontSize:22,fontWeight:700,color:"#fff",lineHeight:1.35,marginBottom:10}}>
          Samen sterk in zorg,<br/>persoonlijk en dichtbij.
        </div>
        <div style={{fontSize:13,color:"rgba(255,255,255,0.78)",lineHeight:1.75,marginBottom:32}}>
          Meld een probleem, stel een vraag of zoek informatie op — via spraak of tekst. AI verwerkt uw melding en maakt automatisch de juiste tickets aan voor het betrokken team.
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:18,marginBottom:32}}>
          {[
            { icon:"🎙️", title:"Spraak of tekst", desc:"Meld in uw eigen woorden, in het Nederlands" },
            { icon:"🤖", title:"AI-verwerking", desc:"AI detecteert categorie, prioriteit en dienst automatisch" },
            { icon:"🎫", title:"Automatische tickets", desc:"Rechtstreeks aangemaakt in Jira — IT, Facility, HR of Operations" },
            { icon:"🚨", title:"Business Critical herkenning", desc:"Urgente meldingen worden onmiddellijk geflagd en doorgestuurd" },
          ].map(({icon,title,desc}) => (
            <div key={title} style={{display:"flex",gap:12,alignItems:"flex-start"}}>
              <span style={{fontSize:18,lineHeight:"22px",flexShrink:0,marginTop:1}}>{icon}</span>
              <div>
                <div style={{fontSize:13,fontWeight:700,color:"#fff",marginBottom:2}}>{title}</div>
                <div style={{fontSize:12,color:"rgba(255,255,255,0.65)",lineHeight:1.55}}>{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AppHeader({ onLogoClick }) {
  return (
    <div style={{background:"var(--color-background-primary)",borderBottom:"0.5px solid var(--color-border-tertiary)",flexShrink:0}}>
      <div style={{height:4,background:"linear-gradient(90deg,#8c84e3,#6b63c9)"}} />
      <div style={{padding:"10px 24px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <button onClick={onLogoClick} style={{display:"flex",alignItems:"baseline",gap:7,background:"none",border:"none",cursor:onLogoClick?"pointer":"default",padding:0,fontFamily:"inherit"}}>
          <HealisLogo width={110} />
          <span style={{fontSize:13,fontWeight:500,color:"#8c84e3",letterSpacing:"-0.2px"}}>Assist</span>
        </button>
        <span style={{fontSize:11,color:"var(--color-text-tertiary)",fontWeight:500}}>Apotheek Support · Jira</span>
      </div>
    </div>
  );
}

function AppFooter() {
  return (
    <footer style={{background:"#2a2a2a",color:"#aaa",padding:"18px 24px",flexShrink:0}}>
      <div style={{maxWidth:900,margin:"0 auto",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:8}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 162 162" width={22} height={22} aria-hidden>
            <path fill="#008624" d="M0 71h61V81H0zM72 92h10v61H72zM72 0h10v61H72z"/>
            <path fill="#8c84e3" d="M92 72h61v10H92z"/>
          </svg>
          <span style={{fontSize:12,color:"#ccc",fontWeight:500}}>Healis Assist</span>
        </div>
        <div style={{fontSize:11,color:"#888"}}>
          Intern gebruik · Apotheekmedewerkers
        </div>
        <div style={{fontSize:11,color:"#666"}}>© {new Date().getFullYear()} Healis</div>
      </div>
    </footer>
  );
}

// ── PHARMACY CONTEXT COLLECTOR ────────────────────────────────────────────────
function collectPharmacyContext(d, p) {
  if (!p) return [];
  const mention = [d.summary, d.symptomen, d.subcategory_gebouw, d.subcategory_apotheek]
    .filter(Boolean).join(' ').toLowerCase();
  const lines = [];

  const isRobot   = /robot|automat|dispenseer|dispensing/i.test(mention);
  const isKoeling = /koel|bevrie|fridge|koelkast|koelmeubel/i.test(mention) || d.subcategory_apotheek === 'Koelmeubels';
  const isElec    = /elektric|stroom|zekering|bedrading|stopcontact/i.test(mention) || d.subcategory_gebouw === 'Elektriciteit';
  const isWater   = /water|lekkage|loodgieter|sanitair|vocht/i.test(mention) || d.subcategory_gebouw === 'Water';
  const isAlarm   = /alarm|beveilig|camera/i.test(mention) || d.subcategory_gebouw === 'Alarm';
  const isAirco   = /airco|hvac|verwarm|ventilat/i.test(mention) || d.subcategory_gebouw === 'Verwarming';
  const isIT      = d.category === 'IT';

  // Robot — dump all sub-fields only when it's actually a robot issue
  if (p.robot && Object.keys(p.robot).length && isRobot) {
    lines.push('Robot / Automaat:');
    for (const [k, v] of Object.entries(p.robot)) {
      if (v) lines.push(`  ${k}: ${v}`);
    }
  }

  // Leveranciers — per detected topic
  const addL = (key, label) => {
    const c = p.leveranciers?.[key];
    if (c) lines.push(`${label}: ${c.naam || '—'}${c.telefoon ? ` — ${c.telefoon}` : ''}`);
  };
  if (isIT && !isRobot) addL('it',    'IT Support');
  if (isElec)    addL('elektricien',  'Elektricien');
  if (isWater)   addL('loodgieter',   'Loodgieter');
  if (isAlarm)   addL('alarm',        'Alarm/beveiliging');
  if (isAirco)   addL('airco',        'Airco/HVAC');

  // Scan p.extra for keys matching detected topics
  if (p.extra) {
    const matchers = [
      ...(isRobot   ? [/robot|automat|dispenseer/i]         : []),
      ...(isKoeling ? [/koel|bevrie|fridge/i]               : []),
      ...(isElec    ? [/elektric|stroom/i]                  : []),
      ...(isWater   ? [/water|lekkage|sanitair/i]           : []),
      ...(isAlarm   ? [/alarm|beveilig/i]                   : []),
      ...(isAirco   ? [/airco|hvac|verwarm|ventilat/i]      : []),
      ...(isIT && !isRobot ? [/it[-\s]support|helpdesk/i]   : []),
    ];
    if (matchers.length) {
      const extraMatched = Object.entries(p.extra)
        .filter(([k]) => matchers.some(rx => rx.test(k)))
        .map(([k, v]) => `${k}: ${v}`);
      if (extraMatched.length) {
        lines.push('Extra info uit Confluence:');
        lines.push(...extraMatched);
      }
    }
  }

  return lines;
}

// ── JIRA FIELD MAPPING ────────────────────────────────────────────────────────
function getSubcategoryDisplay(d) {
  switch (d.category) {
    case "IT":           return ["IT Categorie",     IT_CATEGORIE_MAP[d.subcategory_it]            || d.subcategory_it];
    case "Gebouwbeheer": return ["Type Probleem",    GEBOUW_TYPE_MAP[d.subcategory_gebouw]          || d.subcategory_gebouw];
    case "Apotheek":     return ["Type Inrichting",  APOTHEEK_TYPE_MAP[d.subcategory_apotheek]      || d.subcategory_apotheek];
    case "HR_Medewerker":return ["Thema",            HR_MEDEWERKER_MAP[d.subcategory_hr_medewerker] || d.subcategory_hr_medewerker];
    case "HR_Planning":  return ["Thema",            HR_PLANNING_MAP[d.subcategory_hr_planning]     || d.subcategory_hr_planning];
    case "Klacht":       return ["Categorie Klacht", KLACHT_MAP[d.subcategory_klacht]               || d.subcategory_klacht];
    default: return null;
  }
}

function buildJiraFields(d, p, inputText, apotheekOptions = []) {
  let pharmaFieldValue = null;
  if (p) {
    if (apotheekOptions.length) {
      const opt = apotheekOptions.find(o =>
        o.value?.toUpperCase().startsWith(p.alias) ||
        o.value?.toLowerCase().includes((p.name || '').toLowerCase())
      );
      // If found in live list use exact value; otherwise fall through to fallbacks below
      if (opt) pharmaFieldValue = { value: opt.value };
    }
    if (!pharmaFieldValue) {
      // Try hard-coded map, then construct from alias+name (matches syncJiraOptions format)
      const hardcoded = JIRA_APOTHEEK_MAP[p.alias];
      pharmaFieldValue = { value: hardcoded || `${p.alias} - ${p.name}` };
    }
  }
  const alias = p ? p.alias : (d.alias_hint || "");
  const pharmaLabel = p ? `${p.alias} - ${p.name}` : (d.apotheek_hint || "Onbekende apotheek");
  const summary = `[${alias || "?"}] ${d.summary || "Support issue"}`.substring(0, 255);

  const mkPara = t => ({ type:"paragraph", content:[{ type:"text", text:String(t) }] });
  const mkLabel = (icon, label, value) => mkPara(`${icon} ${label}: ${String(value)}`);
  const subDisplay = getSubcategoryDisplay(d);

  const contextLines = collectPharmacyContext(d, p);

  const description = {
    type:"doc", version:1,
    content:[
      ...(d.priority==="Business Critical" ? [mkPara("🚨 Business Critical — Directe interventie vereist")] : []),
      mkLabel("📋", "Categorie", `${CAT_META[d.category]?.label || d.category || "Support"}${subDisplay ? ` › ${subDisplay[1]}` : ""}`),
      ...(d.werknemer_naam ? [mkLabel("👤", "Medewerker", d.werknemer_naam)] : []),
      mkLabel("🔍", "Probleem", d.symptomen || "Zie originele melding"),
      ...(d.foutcode ? [mkLabel("🔢", "Foutcode", d.foutcode)] : []),
      mkLabel("✅", "Actie", d.gewenste_actie || "Zie beschrijving"),
      ...contextLines.map(t => mkPara(`🏪 ${String(t).trim()}`)),
      mkPara(`📝 ${inputText}`),
      mkPara(`Healis AI · ${new Date().toLocaleString("nl-BE")} · confidence ${d.confidence != null ? Math.round(d.confidence*100)+"%" : "n/a"}`),
    ]
  };

  const base = {
    summary, description,
    priority: { name: d.priority || "Medium" },
    ...(pharmaFieldValue ? { customfield_10107: pharmaFieldValue } : {}),
    ...(p?.email    ? { customfield_10214: p.email    } : {}),
    ...(p?.phone    ? { customfield_10215: p.phone    } : {}),
    ...(p?.manager  ? { customfield_10248: p.manager  } : {}),
  };

  switch (d.category) {
    case "IT":
      return { project:{key:"IT"}, issuetype:{name:"Support"}, ...base,
        ...(d.subcategory_it && IT_CATEGORIE_MAP[d.subcategory_it] ? { customfield_10109:{ value:IT_CATEGORIE_MAP[d.subcategory_it] } } : {}) };
    case "Gebouwbeheer":
      return { project:{key:"FAM"}, issuetype:{name:"Incident"}, ...base,
        ...(d.subcategory_gebouw && GEBOUW_TYPE_MAP[d.subcategory_gebouw] ? { customfield_10177:{ value:GEBOUW_TYPE_MAP[d.subcategory_gebouw] } } : {}) };
    case "Apotheek":
      return { project:{key:"FAM"}, issuetype:{name:"Service Request"}, ...base,
        ...(d.subcategory_apotheek && APOTHEEK_TYPE_MAP[d.subcategory_apotheek] ? { customfield_10178:{ value:APOTHEEK_TYPE_MAP[d.subcategory_apotheek] } } : {}) };
    case "HR_Medewerker":
      return { project:{key:"HR"}, issuetype:{name:"Issue"}, ...base,
        ...(d.werknemer_naam ? { customfield_10143:d.werknemer_naam } : {}),
        ...(d.subcategory_hr_medewerker && HR_MEDEWERKER_MAP[d.subcategory_hr_medewerker] ? { customfield_10180:{ value:HR_MEDEWERKER_MAP[d.subcategory_hr_medewerker] } } : {}) };
    case "HR_Planning":
      return { project:{key:"HR"}, issuetype:{name:"Issue"}, ...base,
        ...(d.werknemer_naam ? { customfield_10143:d.werknemer_naam } : {}),
        ...(d.subcategory_hr_planning && HR_PLANNING_MAP[d.subcategory_hr_planning] ? { customfield_10179:{ value:HR_PLANNING_MAP[d.subcategory_hr_planning] } } : {}) };
    case "Klacht":
      return { project:{key:"OPS"}, issuetype:{name:"Task"}, ...base,
        ...(d.subcategory_klacht && KLACHT_MAP[d.subcategory_klacht] ? { customfield_10181:{ value:KLACHT_MAP[d.subcategory_klacht] } } : {}) };
    default:
      return { project:{key:"FAM"}, issuetype:{name:"Support"}, ...base };
  }
}

// ── MAIN COMPONENT ────────────────────────────────────────────────────────────
export default function HealisApp() {
  const [stage,           setStage]           = useState(STAGE.HUB);
  const [pickSearch,      setPickSearch]      = useState("");
  const [pickSelected,    setPickSelected]    = useState(null);   // pharmacy on select screen
  const [inputText,       setInputText]       = useState("");
  const [processingMsg,   setProcessingMsg]   = useState("");
  const [ticketDrafts,    setTicketDrafts]    = useState([]);
  const [matchedPharmacy, setMatchedPharmacy] = useState(null);
  const [createdTickets,  setCreatedTickets]  = useState([]);
  const [appError,        setAppError]        = useState(null);
  const [editModes,       setEditModes]       = useState({});
  const [pharmSearch,     setPharmSearch]     = useState("");
  const [showPicker,      setShowPicker]      = useState(false);
  const [showTips,        setShowTips]        = useState(false);
  const [showTextInput,   setShowTextInput]   = useState(false);
  const [recSeconds,      setRecSeconds]      = useState(0);
  const [pharmacies,      setPharmacies]      = useState(PHARMACIES);
  const [pharmSyncTime,   setPharmSyncTime]   = useState(null);
  const [pharmSyncLoading,setPharmSyncLoading]= useState(false);
  const [jiraApotheekOptions, setJiraApotheekOptions] = useState([]);

  const srRef    = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => () => { clearInterval(timerRef.current); srRef.current?.stop(); }, []);

  // ── CONFLUENCE PHARMACY SYNC ──────────────────────────────────────────────
  useEffect(() => {
    const CACHE_KEY = "healis_pharmacies_cache_v2";
    const CACHE_TTL = 60 * 60 * 1000; // 1 hour
    const load = async () => {
      // Use cached data immediately (even if stale) for fast render
      try {
        const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || "null");
        if (cached?.pharmacies?.length) {
          const hasComplete = cached.pharmacies.some(p => p.city);
          if (hasComplete) {
            setPharmacies(cached.pharmacies);
            setPharmSyncTime(cached.fetchedAt);
            if (cached.jiraApotheekOptions?.length) setJiraApotheekOptions(cached.jiraApotheekOptions);
            if (Date.now() - cached.fetchedAt < CACHE_TTL) return; // fresh — skip API call
          } else {
            localStorage.removeItem(CACHE_KEY); // stale pre-merge cache — force refresh
          }
        }
      } catch {}
      // Fetch fresh data from Confluence (also syncs Jira custom field options)
      setPharmSyncLoading(true);
      try {
        const res = await fetch("/api/pharmacies");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (data.pharmacies?.length) {
          const merged = mergePharmacyData(data.pharmacies);
          setPharmacies(merged);
          const now = Date.now();
          setPharmSyncTime(now);
          if (data.jiraApotheekOptions?.length) setJiraApotheekOptions(data.jiraApotheekOptions);
          localStorage.setItem(CACHE_KEY, JSON.stringify({
            pharmacies: merged,
            jiraApotheekOptions: data.jiraApotheekOptions || [],
            fetchedAt: now,
          }));
        }
      } catch {
        // Silent fallback — cached or hard-coded list already in state
      } finally {
        setPharmSyncLoading(false);
      }
    };
    load();
  }, []);

  // ── JIRA FIELD OPTIONS ────────────────────────────────────────────────────────
  // Fetch current dropdown options for customfield_10107 directly from Jira on
  // every app load — independent of the pharmacy cache so newly added pharmacies
  // appear immediately without a manual refresh.
  useEffect(() => {
    const base = '/api/jira/rest/api/3/field/customfield_10107';
    fetch(`${base}/context`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        const contextId = data?.values?.[0]?.id;
        if (!contextId) return null;
        return fetch(`${base}/context/${contextId}/option?maxResults=200`);
      })
      .then(r => r?.ok ? r.json() : null)
      .then(data => {
        const opts = data?.values;
        if (opts?.length) setJiraApotheekOptions(opts);
      })
      .catch(() => {});
  }, []);

  const fmtTime = s => `${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;

  // ── RECORDING ────────────────────────────────────────────────────────────────
  const startRecording = useCallback(() => {
    setAppError(null);
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { setAppError("Spraakherkenning niet ondersteund. Gebruik Chrome."); return; }
    const sr = new SR();
    sr.lang = "nl-BE"; sr.continuous = true; sr.interimResults = false;
    sr.onresult = e => {
      let chunk = "";
      for (let i = e.resultIndex; i < e.results.length; i++)
        if (e.results[i].isFinal) chunk += e.results[i][0].transcript + " ";
      if (chunk) setInputText(prev => prev ? `${prev}${chunk}` : chunk);
    };
    sr.onerror = e => {
      if (e.error === "not-allowed") setAppError("Microfoon geweigerd. Sta toegang toe via het slotje in de adresbalk.");
      else if (e.error !== "aborted") setAppError(`Spraakherkenning fout: ${e.error}`);
      clearInterval(timerRef.current); setStage(STAGE.IDLE);
    };
    sr.onend = () => { clearInterval(timerRef.current); setShowTextInput(true); setStage(s => [STAGE.RECORDING, STAGE.TRANSCRIBING].includes(s) ? STAGE.IDLE : s); };
    sr.start(); srRef.current = sr;
    setRecSeconds(0); setStage(STAGE.RECORDING);
    timerRef.current = setInterval(() => setRecSeconds(s => s + 1), 1000);
  }, []);

  const stopRecording = useCallback(() => {
    clearInterval(timerRef.current); setStage(STAGE.TRANSCRIBING); srRef.current?.stop(); srRef.current = null;
  }, []);

  // ── AI EXTRACTION ─────────────────────────────────────────────────────────
  const processIssue = useCallback(async () => {
    if (!inputText.trim()) return;
    setStage(STAGE.PROCESSING); setAppError(null);
    setProcessingMsg("AI analyseert uw melding…");
    const MAX_RETRIES = 3;
    let lastErr;
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
    const res = await fetch("/api/anthropic", {
        method:"POST", headers:API_HEADERS,
        body: JSON.stringify({
          model:"claude-sonnet-4-6", max_tokens:1800,
          system:`Je bent Healis AI Support. Extraheer gestructureerde ticketdata uit een melding van een apothekersmedewerker.
Retourneer een JSON-array met 1 of meer ticketobjecten. Maak meerdere aparte tickets wanneer de melding duidelijk meerdere afzonderlijke problemen beschrijft die naar verschillende departementen gaan (bijv. een IT-probleem ÉN een Facility-probleem). Normaal gezien is dit 1 ticket.
Antwoord ALLEEN met een geldige JSON-array — geen markdown, geen uitleg. Dus altijd: [{...}] of [{...},{...}]

Categorieën (kies 1 per ticket):
- "IT": Wi-Fi/netwerk, PC/scanner/kassa/betaalterminal, printer/labelprinter, login/account, software/apps
- "Gebouwbeheer": deuren/sloten/badges/rolluiken, elektriciteit/zekeringen, verwarming/airco, water/lekkage/geur, alarm/camera/noodverlichting, schoonmaak/verlichting/ramen
- "Apotheek": toonbank/kasten/schappen, stoelen/tafels/consultruimte, koelmeubels/koelkasten, signalisatie/displays/etalageframes, rekken/trolleys, labomateriaal/weegschalen/mortieren, bureaumateriaal/papier/toner/leveranciers
- "HR_Medewerker": onboarding/offboarding, loon/attesten/correcties, verlof/ziekte/afwezigheid, opleiding/certificaten, welzijn/conflict
- "HR_Planning": bezetting/planning, vacatures/vervanging, teamafspraken/samenwerking, evaluaties/feedback, escalaties/personeelsdossiers
- "Klacht": klacht van KLANT over service/wachttijd, medicatie/advies, prijs/terugbetaling, voorraad/bestelling, privacy/administratie

Prioriteiten:
- "Business Critical": apotheek volledig geblokkeerd, patiëntveiligheid in gevaar, alle medewerkers getroffen, koeling kritiek, betalingsproblemen (betaalterminal, kassa, pinnen werkt niet, betalingen falen)
- "High": grote verstoring, meerdere medewerkers getroffen, geen workaround
- "Medium": workaround beschikbaar, beperkte impact
- "Low": kleine hinder
- "Lowest": informatief

{
  "summary": "max 80 tekens, in het Nederlands",
  "category": "IT|Gebouwbeheer|Apotheek|HR_Medewerker|HR_Planning|Klacht",
  "subcategory_it": "Internet|Software|Hardware|Account|Andere",
  "subcategory_gebouw": "Deuren|Elektriciteit|Verwarming|Water|Alarm|Schoonmaak|Andere",
  "subcategory_apotheek": "Toonbank|Stoelen|Koelmeubels|Signalisatie|Rekken|Labomateriaal|Bureaumateriaal|Andere",
  "subcategory_hr_medewerker": "Onboarding|Loon|Verlof|Opleiding|Welzijn|Andere",
  "subcategory_hr_planning": "Bezetting|Vacatures|Teamafspraken|Evaluaties|Escalaties|Andere",
  "subcategory_klacht": "Service|Medicatie|Prijs|Voorraad|Privacy|Andere",
  "priority": "Business Critical|High|Medium|Low|Lowest",
  "apotheek_hint": "apotheeknaam, stad of alias of null",
  "alias_hint": "3-letter alias bv. AAA of null",
  "werknemer_naam": "naam van de medewerker voor HR-tickets of null",
  "foutcode": "foutcode of null",
  "symptomen": "korte beschrijving symptomen",
  "gewenste_actie": "gevraagde actie",
  "confidence": 0.0
}`,
          messages:[{ role:"user", content:buildAIPharmacyContext(matchedPharmacy, inputText) }]
        })
      });
      const data = await res.json();
      if (data.error) {
        const isOverloaded = res.status === 529 || data.error?.type === "overloaded_error";
        if (isOverloaded && attempt < MAX_RETRIES) {
          setProcessingMsg(`AI is even druk, opnieuw proberen… (${attempt}/${MAX_RETRIES})`);
          await new Promise(r => setTimeout(r, 2000 * attempt));
          lastErr = new Error("AI tijdelijk overbelast. Probeer het over een moment opnieuw.");
          continue;
        }
        throw new Error(isOverloaded ? "AI tijdelijk overbelast. Probeer het over een moment opnieuw." : data.error.message);
      }
      let extracted;
      try {
        const raw = (data.content?.[0]?.text || "[]").replace(/```json|```/g,"").trim();
        const parsed = JSON.parse(raw);
        extracted = Array.isArray(parsed) ? parsed : [parsed];
        // Certain keywords always force Business Critical regardless of AI priority
        const FORCE_BC_RE = /betaal|betaling|pin(nen)?|kassa|terminal|payment|dringend|urgent|spoed|noodgeval/i;
        extracted = extracted.map(d =>
          FORCE_BC_RE.test(inputText + ' ' + (d.summary || '') + ' ' + (d.symptomen || ''))
            ? { ...d, priority: 'Business Critical' }
            : d
        );
      } catch { throw new Error("AI parsing mislukt. Probeer opnieuw."); }
      await new Promise(r => setTimeout(r, 200));
      // Prefer the pre-selected pharmacy; otherwise detect from text
      const detected = matchPharmacy(extracted[0]?.alias_hint || extracted[0]?.apotheek_hint || inputText, pharmacies);
      setMatchedPharmacy(matchedPharmacy || detected);
      setTicketDrafts(extracted);
      setEditModes({});
      setStage(STAGE.REVIEW);
      return;
      } catch(err) { lastErr = err; if (attempt < MAX_RETRIES) { setProcessingMsg(`Fout, opnieuw proberen… (${attempt}/${MAX_RETRIES})`); await new Promise(r => setTimeout(r, 1500)); } }
    }
    setAppError(lastErr?.message || "Onbekende fout."); setStage(STAGE.IDLE);
  }, [inputText, matchedPharmacy, pharmacies]);

  // ── JIRA CREATION ─────────────────────────────────────────────────────────
  const createTickets = useCallback(async () => {
    setStage(STAGE.CREATING);
    const results = [];
    try {
      for (const draft of ticketDrafts) {
        const fields = buildJiraFields(draft, matchedPharmacy, inputText, jiraApotheekOptions);
        let res = await fetch("/api/jira", {
          method:"POST", headers:API_HEADERS, body:JSON.stringify({ fields })
        });
        let data = await res.json();
        // If Jira rejects contact fields explicitly, retry the POST without them
        if (!res.ok && data.errors &&
            (data.errors.customfield_10214 || data.errors.customfield_10215)) {
          const { customfield_10214, customfield_10215, ...fieldsWithoutContact } = fields;
          res = await fetch("/api/jira", {
            method:"POST", headers:API_HEADERS, body:JSON.stringify({ fields: fieldsWithoutContact })
          });
          data = await res.json();
        }
        if (!res.ok) throw new Error(data.errorMessages?.[0] || JSON.stringify(data.errors) || `HTTP ${res.status}`);
        results.push({ key:data.key, url:`https://healis.atlassian.net/browse/${data.key}`, summary:fields.summary, project:fields.project.key, issueType:fields.issuetype.name, priority:draft.priority, category:draft.category });
        // ALWAYS PUT contact fields — team-managed projects silently drop unknown fields
        // on create (HTTP 200 but field stays empty), so the PUT is the only reliable path
        if (data.key && matchedPharmacy) {
          const contactFields = {
            ...(matchedPharmacy.email   ? { customfield_10214: matchedPharmacy.email   } : {}),
            ...(matchedPharmacy.phone   ? { customfield_10215: matchedPharmacy.phone   } : {}),
            ...(matchedPharmacy.manager ? { customfield_10248: matchedPharmacy.manager } : {}),
          };
          if (Object.keys(contactFields).length) {
            try {
              const upRes = await fetch("/api/jira", {
                method: "PUT", headers: API_HEADERS,
                body: JSON.stringify({ issueKey: data.key, fields: contactFields }),
              });
              if (!upRes.ok) {
                const upErr = await upRes.json().catch(() => ({}));
                results[results.length - 1].contactFieldWarning =
                  `Contactvelden niet ingevuld (${upRes.status}): ${JSON.stringify(upErr.errors || upErr.errorMessages || upErr)}`;
              }
            } catch { /* PUT failure blocks nothing */ }
          }
        }
      }
      setCreatedTickets(results);
      setStage(STAGE.DONE);
    } catch(err) { setAppError("Jira fout: " + err.message); setStage(STAGE.REVIEW); }
  }, [ticketDrafts, matchedPharmacy, inputText, jiraApotheekOptions]);

  const reset = () => {
    setStage(STAGE.SELECT); setInputText(""); setTicketDrafts([]);
    setMatchedPharmacy(null); setCreatedTickets([]); setAppError(null);
    setEditModes({}); setShowPicker(false); setPharmSearch("");
    setPickSearch(""); setPickSelected(null); setShowTextInput(false); setShowTips(false);
  };

  const confirmPharmacySelection = () => {
    setMatchedPharmacy(pickSelected);  // may be null (anonymous)
    setStage(STAGE.IDLE);
  };

  const refreshPharmacies = useCallback(async () => {
    localStorage.removeItem("healis_pharmacies_cache_v2");
    setPharmSyncLoading(true);
    try {
      const res = await fetch("/api/pharmacies");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.pharmacies?.length) {
        const merged = mergePharmacyData(data.pharmacies);
        setPharmacies(merged);
        const now = Date.now();
        setPharmSyncTime(now);
        if (data.jiraApotheekOptions?.length) setJiraApotheekOptions(data.jiraApotheekOptions);
        localStorage.setItem("healis_pharmacies_cache_v2", JSON.stringify({
          pharmacies: merged, fetchedAt: now,
          jiraApotheekOptions: data.jiraApotheekOptions || [],
        }));
      }
    } catch {
      // Silently keep existing list
    } finally {
      setPharmSyncLoading(false);
    }
  }, []);

  const filteredPick = pharmacies.filter(p =>
    !pickSearch || `${p.alias} ${p.name} ${p.city}`.toLowerCase().includes(pickSearch.toLowerCase())
  );
  const filteredPharma = pharmacies.filter(p =>
    !pharmSearch || `${p.alias} ${p.name} ${p.city}`.toLowerCase().includes(pharmSearch.toLowerCase())
  );
  const busy = [STAGE.RECORDING, STAGE.TRANSCRIBING, STAGE.PROCESSING, STAGE.CREATING].includes(stage);
  const isBC = ticketDrafts.some(d => d.priority === "Business Critical");

  return (
    <div style={{fontFamily:"var(--font-sans)",background:"var(--color-background-tertiary)",minHeight:"100dvh",display:"flex",flexDirection:"column"}}>
      <style>{`
        @keyframes hfade{from{opacity:0;transform:translateY(7px)}to{opacity:1;transform:none}}
        @keyframes hspin{to{transform:rotate(360deg)}}
        @keyframes hrecblink{0%,100%{opacity:1}50%{opacity:.3}}
        @keyframes hrecpulse{0%,100%{box-shadow:0 0 0 0 rgba(163,45,45,.5)}70%{box-shadow:0 0 0 14px rgba(163,45,45,0)}}
        @keyframes hmicglow{0%,100%{box-shadow:0 6px 24px rgba(220,60,90,.35),0 0 0 0 rgba(220,60,90,.25)}70%{box-shadow:0 6px 24px rgba(220,60,90,.35),0 0 0 16px rgba(220,60,90,0)}}
        @keyframes hmicpulse{0%,100%{box-shadow:0 6px 24px rgba(163,45,45,.4),0 0 0 0 rgba(163,45,45,.4)}70%{box-shadow:0 6px 24px rgba(163,45,45,.4),0 0 0 20px rgba(163,45,45,0)}}
        .hfade{animation:hfade .25s ease forwards}
        .hcard{background:var(--color-background-primary);border:0.5px solid var(--color-border-tertiary);border-radius:12px;padding:1.3rem}
        .hbtn{display:inline-flex;align-items:center;gap:6px;padding:7px 15px;border-radius:8px;border:0.5px solid var(--color-border-secondary);background:var(--color-background-primary);color:var(--color-text-primary);font-size:13px;font-weight:500;cursor:pointer;transition:background .12s,transform .1s;font-family:var(--font-sans)}
        .hbtn:hover:not(:disabled){background:var(--color-background-secondary)}
        .hbtn:active:not(:disabled){transform:scale(.97)}
        .hbtn:disabled{opacity:.4;cursor:not-allowed}
        .hbtn-primary{background:#008624;color:#fff;border-color:#008624}
        .hbtn-primary:hover:not(:disabled){background:#006B1D}
        .hbtn-success{background:#008624;color:#fff;border-color:#008624}
        .hbtn-success:hover:not(:disabled){background:#006B1D}
        .hbtn-rec{background:#FCEBEB;color:#A32D2D;border-color:#F09595}
        .hbtn-rec:hover:not(:disabled){background:#f8d8d8}
        .hbtn-rec-active{background:#F7C1C1;color:#A32D2D;border-color:#E08080;animation:hrecpulse 1.4s ease-in-out infinite}
        .hrecdot{width:9px;height:9px;border-radius:50%;background:#A32D2D;animation:hrecblink 1s ease-in-out infinite;flex-shrink:0}
        .hmicbtn{width:84px;height:84px;border-radius:50%;background:#DC3C5A;color:#fff;border:none;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;transition:transform .15s,background .15s;animation:hmicglow 2s ease-in-out infinite;flex-shrink:0}
        .hmicbtn:hover{transform:scale(1.07);background:#C4304C}
        .hmicbtn:active{transform:scale(.94)}
        .hmicbtn-rec{background:#A32D2D;animation:hmicpulse 1.2s ease-in-out infinite}
        .hmicbtn-rec:hover{background:#7A2020}
        .pharm-card{background:var(--color-background-primary);border:1.5px solid var(--color-border-tertiary);border-radius:10px;padding:11px 13px;cursor:pointer;transition:border-color .13s,background .13s}
        .pharm-card:hover{border-color:#7AC483;background:#f8fdf8}
        .pharm-card.selected{border-color:#008624;background:#E8F5EC}
        @keyframes hhubtile{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
        .hub-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;width:100%}
        .hub-tile{background:var(--color-background-primary);border-radius:14px;border:1px solid var(--color-border-tertiary);padding:24px 22px;display:flex;flex-direction:column;gap:10px;position:relative;overflow:hidden;transition:box-shadow .18s,transform .18s}
        .hub-tile-active{cursor:pointer;border-top:3px solid #008624}
        .hub-tile-active:hover{box-shadow:0 6px 28px rgba(0,134,36,.13);transform:translateY(-3px)}
        .hub-tile-active:active{transform:translateY(-1px)}
        .hub-tile-locked{opacity:0.48;cursor:not-allowed}
        .hub-badge-active{display:inline-flex;align-items:center;gap:5px;background:#E8F5EC;color:#008624;border:0.5px solid #7AC483;border-radius:20px;padding:3px 10px;font-size:11px;font-weight:600}
        .hub-badge-soon{display:inline-flex;align-items:center;gap:5px;background:var(--color-background-secondary);color:var(--color-text-tertiary);border:0.5px solid var(--color-border-secondary);border-radius:20px;padding:3px 10px;font-size:11px;font-weight:500}
        @media(max-width:600px){.hub-grid{grid-template-columns:1fr}}
        .select-layout{display:flex;flex:1;min-height:0}
        .select-left{flex:0 0 360px;background:linear-gradient(160deg,#005A18 0%,#008624 55%,#1a9e3a 100%);padding:44px 38px;display:flex;flex-direction:column;position:relative;overflow:hidden}
        .select-left::before{content:"";position:absolute;inset:0;background:url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");pointer-events:none}
        .select-right{flex:1;padding:36px 36px 28px;overflow-x:hidden;overflow-y:auto;display:flex;flex-direction:column;position:relative}
        input,textarea{font-size:16px}
        @media(max-width:780px){.select-layout{flex-direction:column-reverse;min-height:auto;flex:none}.select-left{flex:none;padding:24px 20px}.select-right{flex:none;padding:24px 16px;overflow-y:visible}}
        @keyframes hwave{0%,100%{height:5px}50%{height:28px}}
        .hwavebar{width:4px;border-radius:2px;background:#A32D2D;animation:hwave .9s ease-in-out infinite;align-self:center}
        @keyframes htipsattract{0%,100%{box-shadow:0 1px 6px rgba(0,0,0,.09);transform:scale(1)}50%{box-shadow:0 0 0 7px rgba(140,132,227,.25),0 1px 6px rgba(0,0,0,.09);transform:scale(1.12)}}
        .htips-btn{position:absolute;top:14px;right:14px;width:40px;height:40px;border-radius:50%;background:var(--purple-light);border:1.5px solid var(--purple-border);color:var(--purple-dark);cursor:pointer;display:flex;align-items:center;justify-content:center;z-index:20;transition:transform .3s,box-shadow .3s,background .3s,color .3s;box-shadow:0 1px 6px rgba(0,0,0,.09);padding:0;font-size:19px;font-weight:700;line-height:1;font-family:var(--font-sans);animation:htipsattract 1.4s ease 1.2s 3}
        .htips-btn:hover{transform:scale(1.12);box-shadow:0 4px 16px rgba(140,132,227,.4);background:var(--purple);color:#fff}
        .htips-drawer{position:absolute;top:0;right:0;bottom:0;width:min(290px,88%);background:var(--color-background-primary);border-left:0.5px solid var(--color-border-secondary);z-index:19;transform:translateX(100%);transition:transform .28s cubic-bezier(.4,0,.2,1);box-shadow:-6px 0 24px rgba(0,0,0,.08);display:flex;flex-direction:column;overflow:hidden}
        .htips-drawer.open{transform:translateX(0)}
        .hmode-card{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:11px;padding:24px 14px;border-radius:12px;border:1.5px solid var(--color-border-secondary);background:var(--color-background-primary);cursor:pointer;transition:border-color .15s,background .15s,transform .13s,box-shadow .13s;text-align:center;font-family:var(--font-sans);outline:none}
        .hmode-card:hover{transform:translateY(-3px);box-shadow:0 6px 20px rgba(0,0,0,.09)}
        .hmode-card:active{transform:translateY(-1px)}
      `}</style>

      <AppHeader onLogoClick={() => setStage(STAGE.HUB)} />

      <main style={{flex:1,display:"flex",flexDirection:"column"}}>

        {/* ── HUB SCREEN ── */}
        {stage === STAGE.HUB && (
          <div className="hfade select-layout">

            {/* Left: branding panel */}
            <BrandingPanel />

            {/* Right: module grid */}
            <div className="select-right">
              <div style={{maxWidth:560,width:"100%",margin:"0 auto",flex:1,display:"flex",flexDirection:"column",justifyContent:"center",gap:24}}>

                <div>
                  <div style={{fontSize:20,fontWeight:700,color:"var(--color-text-primary)",marginBottom:4}}>Welkom bij Healis Assist</div>
                  <div style={{fontSize:13,color:"var(--color-text-secondary)"}}>Kies een module om aan de slag te gaan.</div>
                </div>

                <div className="hub-grid">

                  {/* 1 — Probleem melden (active) */}
                  <div className="hub-tile hub-tile-active" onClick={() => setStage(STAGE.SELECT)}
                    style={{animationName:"hhubtile",animationDuration:".3s",animationFillMode:"both",animationDelay:"0ms"}}>
                    <div style={{width:42,height:42,borderRadius:10,background:"#E8F5EC",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#008624" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                        <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                      </svg>
                    </div>
                    <div>
                      <div style={{fontSize:15,fontWeight:700,color:"var(--color-text-primary)",marginBottom:4}}>Probleem melden</div>
                      <div style={{fontSize:12,color:"var(--color-text-secondary)",lineHeight:1.6}}>Meld een technisch of operationeel probleem via spraak of tekst. AI verwerkt uw melding automatisch.</div>
                    </div>
                    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginTop:4}}>
                      <span className="hub-badge-active">
                        <svg width="9" height="9" viewBox="0 0 10 10"><circle cx="5" cy="5" r="5" fill="#008624"/></svg>
                        Actief
                      </span>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#008624" strokeWidth="2" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                    </div>
                  </div>

                  {/* 2 — Kennisbank (coming soon) */}
                  <div className="hub-tile hub-tile-locked" style={{borderTop:"3px solid #6B63C9",animationName:"hhubtile",animationDuration:".3s",animationFillMode:"both",animationDelay:"60ms"}}>
                    <div style={{width:42,height:42,borderRadius:10,background:"#F0EEFF",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#6B63C9" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                      </svg>
                    </div>
                    <div>
                      <div style={{fontSize:15,fontWeight:700,color:"var(--color-text-primary)",marginBottom:4}}>Kennisbank</div>
                      <div style={{fontSize:12,color:"var(--color-text-secondary)",lineHeight:1.6}}>Magistrale bereidingen, protocollen en farmaceutische procedures raadplegen en aanmaken.</div>
                    </div>
                    <span className="hub-badge-soon">Binnenkort beschikbaar</span>
                  </div>

                  {/* 3 — Onboarding (coming soon) */}
                  <div className="hub-tile hub-tile-locked" style={{borderTop:"3px solid #EF9F27",animationName:"hhubtile",animationDuration:".3s",animationFillMode:"both",animationDelay:"120ms"}}>
                    <div style={{width:42,height:42,borderRadius:10,background:"#FFF4E5",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#EF9F27" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/>
                      </svg>
                    </div>
                    <div>
                      <div style={{fontSize:15,fontWeight:700,color:"var(--color-text-primary)",marginBottom:4}}>Onboarding</div>
                      <div style={{fontSize:12,color:"var(--color-text-secondary)",lineHeight:1.6}}>Een warm welkom voor nieuwe collega's — zodat iedereen zich snel thuis voelt binnen het Healis-team.</div>
                    </div>
                    <span className="hub-badge-soon">Binnenkort beschikbaar</span>
                  </div>

                  {/* 4 — Kwaliteitshandboek (coming soon) */}
                  <div className="hub-tile hub-tile-locked" style={{borderTop:"3px solid #0077B6",animationName:"hhubtile",animationDuration:".3s",animationFillMode:"both",animationDelay:"180ms"}}>
                    <div style={{width:42,height:42,borderRadius:10,background:"#E8F4FD",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0077B6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                        <polyline points="9 12 11 14 15 10"/>
                      </svg>
                    </div>
                    <div>
                      <div style={{fontSize:15,fontWeight:700,color:"var(--color-text-primary)",marginBottom:4}}>Kwaliteitshandboek</div>
                      <div style={{fontSize:12,color:"var(--color-text-secondary)",lineHeight:1.6}}>Kwaliteitsborging, procedures en compliance documentatie voor uw apotheek.</div>
                    </div>
                    <span className="hub-badge-soon">Binnenkort beschikbaar</span>
                  </div>

                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── PHARMACY SELECT SCREEN ── */}
        {stage === STAGE.SELECT && (
          <div className="hfade select-layout">

            {/* ── Left: branding panel ── */}
            <BrandingPanel />

            {/* ── Right: pharmacy selector ── */}
            <div className="select-right">
              <div style={{maxWidth:560,width:"100%",margin:"0 auto",flex:1,display:"flex",flexDirection:"column"}}>
                <button onClick={() => setStage(STAGE.HUB)} style={{display:"inline-flex",alignItems:"center",gap:6,background:"none",border:"none",cursor:"pointer",color:"var(--color-text-tertiary)",fontSize:12,fontFamily:"var(--font-sans)",padding:"0 0 16px 0",marginBottom:4}}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
                  Terug naar startscherm
                </button>
                <div style={{marginBottom:20}}>
                  <div style={{fontSize:18,fontWeight:700,color:"var(--color-text-primary)",marginBottom:4}}>Selecteer uw apotheek</div>
                  <div style={{fontSize:13,color:"var(--color-text-secondary)"}}>
                    Kies uw apotheek zodat we uw melding automatisch kunnen koppelen.
                  </div>
                  {/* Confluence sync status */}
                  <div style={{display:"flex",alignItems:"center",gap:6,marginTop:6}}>
                    {pharmSyncLoading ? (
                      <span style={{display:"inline-flex",alignItems:"center",gap:5,fontSize:11,color:"var(--color-text-tertiary)"}}>
                        <Spinner size={10} /> Lijst verversen via Confluence…
                      </span>
                    ) : pharmSyncTime ? (
                      <>
                        <span style={{fontSize:11,color:"var(--color-text-tertiary)"}}>Confluence sync: {formatSyncAge(pharmSyncTime)}</span>
                        <button
                          onClick={refreshPharmacies}
                          title="Ververs apothekenlijst vanuit Confluence"
                          style={{fontSize:12,color:"#008624",background:"none",border:"none",cursor:"pointer",padding:0,lineHeight:1}}
                        >↻</button>
                      </>
                    ) : null}
                  </div>
                </div>

                {/* Search */}
                <div style={{position:"relative",marginBottom:14}}>
                  <svg style={{position:"absolute",left:11,top:"50%",transform:"translateY(-50%)",pointerEvents:"none"}} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                  <input
                    placeholder="Zoek op naam, alias of stad…"
                    value={pickSearch}
                    onChange={e => setPickSearch(e.target.value)}
                    autoFocus
                    style={{width:"100%",boxSizing:"border-box",padding:"10px 12px 10px 34px",fontSize:14,borderRadius:9,border:"0.5px solid var(--color-border-secondary)",background:"var(--color-background-primary)",color:"var(--color-text-primary)",fontFamily:"var(--font-sans)"}}
                  />
                </div>

                {/* Pharmacy grid */}
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:8,marginBottom:18,maxHeight:"38vh",overflowY:"auto",paddingRight:2,flex:1}}>
                  {filteredPick.map(p => (
                    <div
                      key={p.alias}
                      className={`pharm-card${pickSelected?.alias === p.alias ? " selected" : ""}`}
                      onClick={() => setPickSelected(prev => prev?.alias === p.alias ? null : p)}
                    >
                      <div style={{display:"flex",alignItems:"baseline",gap:7,marginBottom:3}}>
                        <span style={{fontSize:15,fontWeight:700,color:"#008624",fontFamily:"var(--font-mono)"}}>{p.alias}</span>
                        {pickSelected?.alias === p.alias && <span style={{fontSize:11,color:"#008624"}}>✓ Geselecteerd</span>}
                      </div>
                      <div style={{fontSize:13,fontWeight:500,color:"var(--color-text-primary)",lineHeight:1.3}}>{p.name.replace(/^(Apotheek|Pharmacie)\s/,"")}</div>
                      <div style={{fontSize:11,color:"var(--color-text-tertiary)",marginTop:2}}>{p.city}</div>
                    </div>
                  ))}
                  {filteredPick.length === 0 && (
                    <div style={{gridColumn:"1/-1",textAlign:"center",padding:"32px 0",color:"var(--color-text-tertiary)",fontSize:13}}>
                      Geen apotheken gevonden voor "{pickSearch}"
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div style={{display:"flex",flexDirection:"column",gap:10,alignItems:"stretch"}}>
                  <button
                    className="hbtn hbtn-primary"
                    style={{justifyContent:"center",padding:"13px 0",fontSize:15,fontWeight:600,borderRadius:10}}
                    onClick={confirmPharmacySelection}
                    disabled={!pickSelected}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                    {pickSelected ? `Doorgaan met ${pickSelected.alias} — ${pickSelected.name.replace(/^(Apotheek|Pharmacie)\s/,"")}` : "Selecteer een apotheek"}
                  </button>
                  <button
                    className="hbtn"
                    style={{justifyContent:"center",fontSize:12,color:"var(--color-text-tertiary)",border:"none",background:"transparent",padding:"4px 0"}}
                    onClick={confirmPharmacySelection}
                  >
                    Doorgaan zonder apotheek te selecteren
                    <span style={{fontSize:11,color:"var(--color-text-tertiary)",marginLeft:4}}>(bijv. voor een discrete melding)</span>
                  </button>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* ── MELD EEN PROBLEEM (IDLE / RECORDING / TRANSCRIBING / PROCESSING) ── */}
        {[STAGE.IDLE, STAGE.RECORDING, STAGE.TRANSCRIBING, STAGE.PROCESSING].includes(stage) && (
          <div className="hfade select-layout">
          <BrandingPanel />
          <div className="select-right">
          {/* ── Tips button ── */}
          <button className="htips-btn" onClick={() => setShowTips(s => !s)} aria-label="Tips & hulp">
            {showTips
              ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              : "?"}
          </button>
          {/* ── Tips drawer ── */}
          <div className={`htips-drawer${showTips ? " open" : ""}`}>
            <div style={{padding:"16px 18px 12px",borderBottom:"0.5px solid var(--color-border-secondary)",display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0}}>
              <div style={{fontSize:14,fontWeight:600,color:"var(--color-text-primary)"}}>Tips voor een vlotte melding</div>
              <button onClick={() => setShowTips(false)} style={{background:"none",border:"none",cursor:"pointer",color:"var(--color-text-tertiary)",fontSize:20,lineHeight:1,padding:0,display:"flex",alignItems:"center"}}>×</button>
            </div>
            <div style={{padding:"16px 18px",display:"flex",flexDirection:"column",gap:16,overflowY:"auto",flex:1}}>
              {[
                {icon:"🔍", tip:"Beschrijf het probleem concreet", sub:"Wat is er mis? Wat ziet u? Wanneer begon het?"},
                {icon:"🔢", tip:"Vermeld foutcodes of alarmen",    sub:'Bv. "foutcode E4" of "rood alarm op robot"'},
                {icon:"🚨", tip:"Zeg 'dringend' voor urgentie",   sub:'"Business Critical" wordt automatisch herkend door AI'},
                {icon:"📋", tip:"Meerdere problemen? Prima",       sub:"Spreek alles in — AI maakt aparte tickets"},
                {icon:"✨", tip:"Typo's of slordige zinnen? Geen probleem", sub:"Klik op 'Optimaliseer met AI' in het volgende scherm — AI verbetert de tekst en vult de details automatisch in"},
              ].map(({icon, tip, sub}) => (
                <div key={tip} style={{display:"flex",gap:11,alignItems:"flex-start"}}>
                  <span style={{fontSize:18,flexShrink:0,lineHeight:"22px",marginTop:1}}>{icon}</span>
                  <div>
                    <div style={{fontSize:13,fontWeight:600,color:"var(--color-text-primary)",lineHeight:1.35}}>{tip}</div>
                    <div style={{fontSize:12,color:"var(--color-text-secondary)",marginTop:3,lineHeight:1.5}}>{sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div style={{maxWidth:520,width:"100%",margin:"0 auto",display:"flex",flexDirection:"column",gap:14,alignItems:"center"}}>

            {/* Pharmacy pill */}
            {matchedPharmacy && (
              <div style={{display:"inline-flex",alignItems:"center",gap:7,background:"#E8F5EC",border:"0.5px solid #7AC483",borderRadius:20,padding:"5px 13px",fontSize:12,color:"#008624",fontWeight:500}}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                {matchedPharmacy.alias} — {matchedPharmacy.name}
                <button onClick={()=>setMatchedPharmacy(null)} style={{background:"none",border:"none",cursor:"pointer",color:"#008624",padding:0,fontSize:14,lineHeight:1,marginLeft:2}}>×</button>
              </div>
            )}

            {/* ── PROCESSING ── */}
            {stage === STAGE.PROCESSING && (
              <div style={{textAlign:"center",padding:"52px 0"}}>
                <Spinner size={34} />
                <div style={{fontSize:14,color:"var(--color-text-secondary)",marginTop:16}}>{processingMsg}</div>
              </div>
            )}

            {/* ── IDLE: no text, no text-input mode → mode keuze ── */}
            {stage === STAGE.IDLE && !inputText && !showTextInput && (
              <div style={{display:"flex",flexDirection:"column",gap:20,width:"100%",paddingTop:4}}>
                <div style={{textAlign:"center"}}>
                  <div style={{fontSize:19,fontWeight:700,color:"var(--color-text-primary)"}}>Hoe wil je je melding indienen?</div>
                  <div style={{fontSize:13,color:"var(--color-text-secondary)",marginTop:5,lineHeight:1.6}}>Beschrijf het probleem — AI detecteert categorie en prioriteit automatisch</div>
                </div>
                <div style={{display:"flex",gap:12,width:"100%"}}>
                  <button className="hmode-card" onClick={startRecording}>
                    <div style={{width:56,height:56,borderRadius:"50%",background:"#DC3C5A",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,boxShadow:"0 4px 14px rgba(220,60,90,.4)"}}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                        <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                        <line x1="12" y1="19" x2="12" y2="23"/>
                        <line x1="8" y1="23" x2="16" y2="23"/>
                      </svg>
                    </div>
                    <div style={{fontWeight:700,fontSize:15,color:"var(--color-text-primary)"}}>Inspreken</div>
                    <div style={{fontSize:12,color:"var(--color-text-secondary)",lineHeight:1.5,maxWidth:150}}>Spreek uw melding in — snel en hands-free</div>
                  </button>
                  <button className="hmode-card" onClick={() => setShowTextInput(true)}>
                    <div style={{width:56,height:56,borderRadius:"50%",background:"#008624",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,boxShadow:"0 4px 14px rgba(0,134,36,.35)"}}>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round">
                        <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
                      </svg>
                    </div>
                    <div style={{fontWeight:700,fontSize:15,color:"var(--color-text-primary)"}}>Typen</div>
                    <div style={{fontSize:12,color:"var(--color-text-secondary)",lineHeight:1.5,maxWidth:150}}>Typ uw melding zelf in</div>
                  </button>
                </div>
              </div>
            )}

            {/* ── TRANSCRIBING (waiting for final SR result after stop) ── */}
            {stage === STAGE.TRANSCRIBING && (
              <div style={{textAlign:"center",padding:"40px 0 20px"}}>
                <Spinner size={34} />
                <div style={{fontSize:14,color:"var(--color-text-secondary)",marginTop:16}}>Opname verwerken…</div>
              </div>
            )}

            {/* ── RECORDING ── */}
            {stage === STAGE.RECORDING && (
              <div style={{textAlign:"center",padding:"20px 0 8px",width:"100%"}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:14,marginBottom:16}}>
                  <div style={{display:"flex",gap:5,alignItems:"center",height:48}}>
                    {[0,.12,.28,.08,.42,.18,.34].map((d,i) => (
                      <div key={i} className="hwavebar" style={{animationDelay:`${d}s`}} />
                    ))}
                  </div>
                  <button className="hmicbtn hmicbtn-rec" onClick={stopRecording} aria-label="Stop opname"
                    style={{width:60,height:60,flexShrink:0}}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><rect x="5" y="5" width="14" height="14" rx="2.5"/></svg>
                  </button>
                  <div style={{display:"flex",gap:5,alignItems:"center",height:48}}>
                    {[0.34,.18,.42,.08,.28,.12,0].map((d,i) => (
                      <div key={i} className="hwavebar" style={{animationDelay:`${d}s`}} />
                    ))}
                  </div>
                </div>
                <div style={{fontSize:28,fontWeight:700,color:"#A32D2D",fontVariantNumeric:"tabular-nums"}}>{fmtTime(recSeconds)}</div>
                <div style={{fontSize:13,color:"var(--color-text-secondary)",marginTop:5}}>Opname bezig — tik ■ om te stoppen</div>
                {inputText && (
                  <div style={{marginTop:14,textAlign:"left",padding:"10px 14px",background:"#E8F5EC",borderRadius:8,fontSize:13,color:"#004d14",lineHeight:1.65,border:"0.5px solid #7AC483",maxHeight:100,overflowY:"auto"}}>
                    {inputText}
                  </div>
                )}
              </div>
            )}

            {/* ── IDLE: has text (post-recording) or text-input mode ── */}
            {stage === STAGE.IDLE && (inputText || showTextInput) && (
              <>
                {/* Transcript preview — non-edit */}
                {inputText && !showTextInput && (
                  <div className="hcard" style={{marginBottom:0,alignSelf:"stretch"}}>
                    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
                      <div style={{display:"flex",alignItems:"center",gap:6,fontSize:12,fontWeight:600,color:"#008624"}}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/></svg>
                        Opname verwerkt
                      </div>
                      <button onClick={()=>setShowTextInput(true)} style={{fontSize:12,color:"var(--color-text-tertiary)",background:"none",border:"none",cursor:"pointer",padding:0}}>Bewerken ✏</button>
                    </div>
                    <div style={{fontSize:14,lineHeight:1.7,color:"var(--color-text-primary)"}}>{inputText}</div>
                  </div>
                )}
                {/* Text input (fallback or edit mode) */}
                {showTextInput && (
                  <textarea
                    value={inputText} onChange={e=>setInputText(e.target.value)}
                    placeholder="Bijv: De koelkast in de stockageruimte geeft een alarm. Temperatuur te hoog voor medicijnen."
                    rows={5} autoFocus
                    style={{width:"100%",alignSelf:"stretch",boxSizing:"border-box",resize:"vertical",padding:"12px 14px",lineHeight:1.65,minHeight:120,background:"var(--color-background-secondary)",border:"0.5px solid var(--color-border-secondary)",borderRadius:10,color:"var(--color-text-primary)",fontFamily:"var(--font-sans)",fontSize:16}}
                  />
                )}
                {/* Primary CTA */}
                <button className="hbtn hbtn-primary" style={{width:"100%",alignSelf:"stretch",justifyContent:"center",padding:"13px 0",fontSize:15,fontWeight:600,borderRadius:10}} onClick={processIssue} disabled={!inputText.trim()}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l1.9 5.8H20l-4.9 3.6 1.9 5.8L12 14.6l-5 3.6 1.9-5.8L4 8.8h6.1z"/></svg>
                  Optimaliseer met AI
                </button>
                <div style={{fontSize:11,color:"var(--color-text-tertiary)",textAlign:"center",marginTop:-6}}>U krijgt nog de kans om te controleren vóór het aanmaken</div>
                {/* Secondary actions */}
                <div style={{display:"flex",gap:16,justifyContent:"center",flexWrap:"wrap"}}>
                  <button onClick={()=>{setInputText("");setShowTextInput(false);}} style={{fontSize:12,color:"var(--color-text-tertiary)",background:"none",border:"none",cursor:"pointer",padding:"2px 0",fontFamily:"var(--font-sans)"}}>↺ Opnieuw beginnen</button>
                  <button onClick={startRecording} style={{fontSize:12,color:"var(--color-text-tertiary)",background:"none",border:"none",cursor:"pointer",padding:"2px 0",fontFamily:"var(--font-sans)"}}>🎙 {inputText ? "Verder inspreken" : "Inspreken"}</button>
                  {!showTextInput && <button onClick={()=>setShowTextInput(true)} style={{fontSize:12,color:"var(--color-text-tertiary)",background:"none",border:"none",cursor:"pointer",padding:"2px 0",fontFamily:"var(--font-sans)"}}>✏ Bewerken</button>}
                </div>
              </>
            )}

            {appError && <div style={{background:"#FCEBEB",border:"0.5px solid #F09595",borderRadius:8,padding:"9px 14px",color:"#A32D2D",fontSize:13}}>⚠ {appError}</div>}

            <button className="hbtn" style={{fontSize:12,color:"var(--color-text-tertiary)",border:"none",background:"transparent",padding:"4px 0"}}
              onClick={() => setStage(STAGE.SELECT)}>
              ← Terug naar apotheekselectie
            </button>
          </div></div></div>
        )}

        {/* ── REVIEW ── */}
        {stage === STAGE.REVIEW && ticketDrafts.length > 0 && (
          <div className="hfade select-layout">
          <BrandingPanel />
          <div className="select-right"><div style={{maxWidth:560,width:"100%",margin:"0 auto"}}>
            {isBC && (
              <div style={{background:"#B42318",color:"#fff",borderRadius:9,padding:"11px 16px",marginBottom:12,display:"flex",alignItems:"center",gap:10}}>
                <CriticalAlertIcon size={28} />
                <div>
                  <div style={{fontSize:14,fontWeight:800,fontFamily:"Arial,Helvetica,sans-serif"}}>Business Critical support request</div>
                  <div style={{fontSize:12,fontWeight:400,color:"#FFE4E8",marginTop:2}}>Directe interventie vereist — ticket krijgt hoogste prioriteit</div>
                </div>
              </div>
            )}

            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
              <div>
                <div style={{fontSize:15,fontWeight:600}}>
                  Controleer en bevestig
                  {ticketDrafts.length > 1 && <span style={{marginLeft:7,fontSize:12,color:"var(--color-text-secondary)",fontWeight:400}}>({ticketDrafts.length} tickets gedetecteerd)</span>}
                </div>
                <div style={{fontSize:12,color:"var(--color-text-secondary)",marginTop:2}}>Claude heeft uw melding geanalyseerd</div>
              </div>
            </div>

            {/* Pharmacy — shared across all drafts */}
            <div className="hcard" style={{marginBottom:12,border:matchedPharmacy?"0.5px solid #7AC483":"0.5px solid #FAC775"}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:matchedPharmacy&&!showPicker?8:0}}>
                <div style={{fontSize:12,fontWeight:600,color:matchedPharmacy?"#008624":"#854F0B"}}>
                  {matchedPharmacy ? "✓ Apotheek gevonden" : "⚠ Apotheek niet herkend"}
                </div>
                <button className="hbtn" style={{fontSize:11,padding:"3px 9px"}} onClick={()=>setShowPicker(s=>!s)}>
                  {showPicker ? "Sluiten" : "Wijzig apotheek"}
                </button>
              </div>
              {matchedPharmacy && !showPicker && (
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:3}}>
                  {[["Code",`${matchedPharmacy.alias} - ${matchedPharmacy.name}`],["APB",matchedPharmacy.apb],["Stad",matchedPharmacy.city],["Provincie",matchedPharmacy.province],["Tel",matchedPharmacy.phone],["E-mail",matchedPharmacy.email]].map(([l,v])=>(
                    <div key={l} style={{fontSize:12}}><span style={{color:"var(--color-text-secondary)"}}>{l}: </span><span style={{fontWeight:500}}>{v}</span></div>
                  ))}
                </div>
              )}
              {showPicker && (
                <div style={{marginTop:8}}>
                  <input autoFocus placeholder="Zoek apotheek…" value={pharmSearch} onChange={e=>setPharmSearch(e.target.value)}
                    style={{width:"100%",boxSizing:"border-box",fontSize:12,padding:"5px 10px",borderRadius:6,border:"0.5px solid var(--color-border-secondary)",background:"var(--color-background-secondary)",color:"var(--color-text-primary)",fontFamily:"var(--font-sans)",marginBottom:6}} />
                  <div style={{maxHeight:160,overflowY:"auto",display:"flex",flexDirection:"column",gap:3}}>
                    {filteredPharma.map(p=>(
                      <div key={p.alias} onClick={()=>{setMatchedPharmacy(p);setShowPicker(false);setPharmSearch("");}}
                        style={{fontSize:12,padding:"6px 9px",borderRadius:6,cursor:"pointer",background:matchedPharmacy?.alias===p.alias?"#E8F5EC":"var(--color-background-secondary)",color:"var(--color-text-primary)"}}>
                        <strong>{p.alias}</strong> — {p.name} <span style={{color:"var(--color-text-secondary)"}}>({p.city})</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* One card per draft */}
            {ticketDrafts.map((draft, idx) => {
              const editOn = !!editModes[idx];
              const setDraft = updater => setTicketDrafts(prev => prev.map((d,i) => i===idx ? updater(d) : d));
              const sub = getSubcategoryDisplay(draft);
              return (
                <div key={idx} className="hcard" style={{marginBottom:10,borderTop:`3px solid ${CAT_META[draft.category]?.br||"#ccc"}`}}>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
                    <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}>
                      {ticketDrafts.length > 1 && <span style={{fontSize:11,color:"var(--color-text-tertiary)",fontWeight:500}}>Ticket {idx+1}/{ticketDrafts.length}</span>}
                      <PriorityBadge priority={draft.priority} />
                      <CatBadge category={draft.category} />
                    </div>
                    <button className="hbtn" style={{fontSize:11,padding:"3px 9px"}} onClick={()=>setEditModes(m=>({...m,[idx]:!m[idx]}))}>
                      {editOn ? "✓ Klaar" : "✏ Bewerken"}
                    </button>
                  </div>
                  <div style={{background:"#E8F5EC",border:"0.5px solid #7AC483",borderRadius:7,padding:"8px 12px",marginBottom:9}}>
                    <div style={{fontSize:11,color:"#008624",fontWeight:600,marginBottom:2}}>SAMENVATTING</div>
                    <div style={{fontSize:13,color:"#1A3D22",fontWeight:500}}>{draft.summary}</div>
                  </div>
                  <FieldRow label="Project"    value={CAT_META[draft.category]?.project || draft.category} mono />
                  <FieldRow label="Issue type" value={CAT_META[draft.category]?.issueType || "Support"} />
                  <FieldRow label="Prioriteit" value={draft.priority} editable={editOn} onChange={v=>setDraft(d=>({...d,priority:v}))} />
                  {sub && <FieldRow label={sub[0]} value={sub[1]} />}
                  {(draft.category==="HR_Medewerker"||draft.category==="HR_Planning") && draft.werknemer_naam && (
                    <FieldRow label="Medewerker" value={draft.werknemer_naam} editable={editOn} onChange={v=>setDraft(d=>({...d,werknemer_naam:v}))} />
                  )}
                  <FieldRow label="Foutcode"  value={draft.foutcode}       editable={editOn} onChange={v=>setDraft(d=>({...d,foutcode:v}))}       mono />
                  <FieldRow label="Symptomen" value={draft.symptomen}      editable={editOn} onChange={v=>setDraft(d=>({...d,symptomen:v}))} />
                  <FieldRow label="Actie"     value={draft.gewenste_actie} editable={editOn} onChange={v=>setDraft(d=>({...d,gewenste_actie:v}))} />
                  {draft.confidence != null && (
                    <div style={{display:"flex",alignItems:"center",gap:8,marginTop:8,fontSize:12,color:"var(--color-text-secondary)"}}>
                      <span>AI confidence</span>
                      <div style={{flex:1,height:3,background:"var(--color-border-tertiary)",borderRadius:2,overflow:"hidden"}}>
                        <div style={{width:`${Math.round(draft.confidence*100)}%`,height:"100%",borderRadius:2,background:draft.confidence>.7?"#008624":draft.confidence>.5?"#BA7517":"#A32D2D"}} />
                      </div>
                      <span style={{fontWeight:500,minWidth:32}}>{Math.round(draft.confidence*100)}%</span>
                    </div>
                  )}
                </div>
              );
            })}

            {appError && <div style={{background:"#FCEBEB",border:"0.5px solid #F09595",borderRadius:8,padding:"9px 14px",color:"#A32D2D",fontSize:13,marginBottom:9}}>⚠ {appError}</div>}

            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              <button className="hbtn hbtn-success" style={{width:"100%",justifyContent:"center",padding:"13px 0",fontSize:15,fontWeight:600,borderRadius:10}} onClick={createTickets}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                {ticketDrafts.length > 1 ? `Bevestig & maak ${ticketDrafts.length} tickets aan` : "Bevestig & maak ticket aan"}
              </button>
              <button className="hbtn" style={{alignSelf:"center",fontSize:13,border:"none",background:"transparent",color:"var(--color-text-tertiary)",padding:"4px 8px"}} onClick={()=>setStage(STAGE.IDLE)}>← Aanpassen</button>
            </div>
          </div></div></div>
        )}

        {/* ── CREATING ── */}
        {stage === STAGE.CREATING && (
          <div className="hfade select-layout">
            <BrandingPanel />
            <div className="select-right">
              <div style={{maxWidth:520,width:"100%",margin:"0 auto",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",flex:1,gap:16,padding:"60px 0"}}>
                <Spinner size={36} />
                <div style={{fontSize:14,fontWeight:500,color:"var(--color-text-secondary)"}}>Jira ticket wordt aangemaakt…</div>
              </div>
            </div>
          </div>
        )}

        {/* ── DONE ── */}
        {stage === STAGE.DONE && createdTickets.length > 0 && (
          <div className="hfade select-layout">
          <BrandingPanel />
          <div className="select-right"><div style={{maxWidth:560,width:"100%",margin:"0 auto"}}>
            <div style={{textAlign:"center",marginBottom:20}}>
              <div style={{width:48,height:48,borderRadius:"50%",background:"#E8F5EC",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 12px"}}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#008624" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <div style={{fontSize:18,fontWeight:600}}>
                {createdTickets.length === 1 ? "Ticket aangemaakt!" : `${createdTickets.length} tickets aangemaakt!`}
              </div>
            </div>

            {createdTickets.some(t => t.priority === "Business Critical") && (
              <div style={{background:"#B42318",borderRadius:9,padding:"11px 16px",marginBottom:12,display:"flex",alignItems:"center",gap:10}}>
                <CriticalAlertIcon size={28} />
                <div>
                  <div style={{fontSize:14,fontWeight:800,color:"#fff",fontFamily:"Arial,Helvetica,sans-serif"}}>Business Critical support request</div>
                  <div style={{fontSize:12,color:"#FFE4E8",marginTop:2}}>Het support team is op de hoogte gebracht en behandelt uw melding met hoogste prioriteit.</div>
                </div>
              </div>
            )}

            {createdTickets.map((ticket, idx) => (
              <div key={ticket.key} className="hcard" style={{marginBottom:10,border:"0.5px solid #A8D5A9"}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
                  <div>
                    <div style={{fontSize:22,fontWeight:600,color:"#008624",fontFamily:"var(--font-mono)"}}>{ticket.key}</div>
                    <div style={{fontSize:11,color:"var(--color-text-secondary)",marginTop:2}}>{ticket.project} · {ticket.issueType}</div>
                  </div>
                  <div style={{display:"flex",flexDirection:"column",gap:4,alignItems:"flex-end"}}>
                    <Badge color="#E8F5EC" tx="#008624" br="#7AC483">✓ Aangemaakt</Badge>
                    <PriorityBadge priority={ticket.priority} />
                  </div>
                </div>
                <div style={{fontSize:13,lineHeight:1.5,marginBottom:12,color:"var(--color-text-secondary)"}}>{ticket.summary}</div>
                <a href={ticket.url} target="_blank" rel="noopener noreferrer"
                  style={{display:"inline-flex",alignItems:"center",gap:5,fontSize:13,color:"#008624",textDecoration:"none",fontWeight:500}}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                  Bekijk in Jira →
                </a>
              </div>
            ))}

            <button className="hbtn hbtn-primary" style={{width:"100%",justifyContent:"center",padding:"11px 0",fontSize:14,fontWeight:600}} onClick={reset}>
              + Nieuw probleem melden
            </button>
          </div></div></div>
        )}

      </main>

      <AppFooter />
      <Analytics />
    </div>
  );
}
