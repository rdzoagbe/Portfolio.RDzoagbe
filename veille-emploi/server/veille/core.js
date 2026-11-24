// Veille Emploi: job sources, matching and email content.
// Plain JavaScript (ES module) so it runs in Supabase Edge Functions (Deno) and in Node for tests.
import { GEO } from './geo.js';

export const APP_URL = 'https://rdzoagbe.github.io/Portfolio.RDzoagbe/veille-emploi/';

/* ---------- text helpers ---------- */
export const norm = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
  .replace(/[^a-z0-9+#]+/g, ' ').trim();
export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const has = (text, word) => (' ' + text + ' ').includes(' ' + word + ' ');

/* ---------- startup career boards (public, free, no key) ---------- */
export const BOARDS = [
  ['ashby', 'alan', 'Alan'], ['ashby', 'qonto', 'Qonto'], ['ashby', 'doctolib', 'Doctolib'], ['ashby', 'backmarket', 'Back Market'],
  ['ashby', 'pennylane', 'Pennylane'], ['ashby', 'ledger', 'Ledger'], ['ashby', 'photoroom', 'Photoroom'], ['ashby', 'lemlist', 'lemlist'],
  ['ashby', 'akur8', 'Akur8'], ['ashby', 'alma', 'Alma'], ['ashby', 'sunday', 'Sunday'], ['ashby', 'owkin', 'Owkin'],
  ['ashby', 'sorare', 'Sorare'], ['ashby', 'ankorstore', 'Ankorstore'], ['ashby', 'upflow', 'Upflow'], ['ashby', 'swan', 'Swan'],
  ['lever', 'contentsquare', 'Contentsquare'], ['lever', 'swile', 'Swile'], ['lever', 'malt', 'Malt'], ['lever', 'agicap', 'Agicap'],
  ['lever', 'pigment', 'Pigment'], ['lever', 'blablacar', 'BlaBlaCar'], ['lever', '360learning', '360Learning'], ['lever', 'younited', 'Younited'],
  ['lever', 'brevo', 'Brevo'], ['lever', 'vestiairecollective', 'Vestiaire Collective'], ['lever', 'heetch', 'Heetch'],
  ['gh', 'dataiku', 'Dataiku'], ['gh', 'algolia', 'Algolia'], ['gh', 'mirakl', 'Mirakl'], ['gh', 'ivalua', 'Ivalua'],
  ['gh', 'dashlane', 'Dashlane'], ['gh', 'datadog', 'Datadog'], ['gh', 'shifttechnology', 'Shift Technology'],
  ['sr', 'ecovadis', 'EcoVadis'],
];

async function getJson(url, ms = 15000, init = {}) {
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), ms);
  try {
    const r = await fetch(url, { ...init, signal: ctl.signal, headers: { accept: 'application/json', ...(init.headers || {}) } });
    if (!r.ok) throw new Error(url.split('?')[0] + ' ' + r.status);
    return await r.json();
  } finally { clearTimeout(timer); }
}

const isoOrNull = (v) => { const d = v ? new Date(v) : null; return d && !isNaN(d) ? d.toISOString() : null; };

async function fetchBoard([kind, slug, company]) {
  if (kind === 'ashby') {
    const j = await getJson(`https://api.ashbyhq.com/posting-api/job-board/${slug}`);
    return (j.jobs || []).filter((x) => x.isListed !== false).map((x) => ({
      id: `ashby:${slug}:${x.id}`, title: x.title, company, url: x.jobUrl,
      location: [x.location, ...(x.secondaryLocations || []).map((s) => s.location)].filter(Boolean).join(' · '),
      remote: x.workplaceType ? x.workplaceType === 'Remote' : x.isRemote === true, workplace: x.workplaceType || '',
      type: x.employmentType || '', posted: isoOrNull(x.publishedAt), source: 'startups',
    }));
  }
  if (kind === 'lever') {
    const j = await getJson(`https://api.lever.co/v0/postings/${slug}?mode=json`);
    return (j || []).map((x) => ({
      id: `lever:${slug}:${x.id}`, title: x.text, company, url: x.hostedUrl,
      location: [...new Set([x.categories?.location, ...(x.categories?.allLocations || [])].filter(Boolean))].join(' · '), country: x.country || '',
      remote: x.workplaceType === 'remote', workplace: x.workplaceType || '',
      type: x.categories?.commitment || '', posted: isoOrNull(x.createdAt), source: 'startups',
    }));
  }
  if (kind === 'gh') {
    const j = await getJson(`https://boards-api.greenhouse.io/v1/boards/${slug}/jobs`);
    return (j.jobs || []).map((x) => ({
      id: `gh:${slug}:${x.id}`, title: x.title, company, url: x.absolute_url,
      location: x.location?.name || '', remote: /remote/i.test(x.location?.name || ''), workplace: '',
      type: '', posted: isoOrNull(x.first_published || x.updated_at), source: 'startups',
    }));
  }
  if (kind === 'sr') {
    const j = await getJson(`https://api.smartrecruiters.com/v1/companies/${slug}/postings?country=fr&limit=100`);
    return (j.content || []).map((x) => ({
      id: `sr:${slug}:${x.id}`, title: x.name, company, url: `https://jobs.smartrecruiters.com/${slug}/${x.id}`,
      location: [x.location?.city, x.location?.region, 'France'].filter(Boolean).join(', '), remote: !!x.location?.remote, workplace: '',
      type: x.typeOfEmployment?.label || '', posted: isoOrNull(x.releasedDate), source: 'startups',
    }));
  }
  return [];
}

export async function fetchStartups() {
  const res = await Promise.allSettled(BOARDS.map(fetchBoard));
  const jobs = []; const errors = [];
  res.forEach((r, i) => { if (r.status === 'fulfilled') jobs.push(...r.value); else errors.push(BOARDS[i][1] + ': ' + (r.reason?.message || r.reason)); });
  return { jobs, errors };
}

/* ---------- France Travail (optional: needs FT_CLIENT_ID / FT_CLIENT_SECRET) ---------- */
const FT_REGION = { ARA: '84', BFC: '27', BRE: '53', CVL: '24', COR: '94', GES: '44', HDF: '32', IDF: '11', NOR: '28', NAQ: '75', OCC: '76', PDL: '52', PAC: '93' };
export async function franceTravailToken(id, secret) {
  const body = new URLSearchParams({ grant_type: 'client_credentials', client_id: id, client_secret: secret, scope: 'api_offresdemploiv2 o2dsoffre' });
  const r = await fetch('https://entreprise.francetravail.fr/connexion/oauth2/access_token?realm=%2Fpartenaire', {
    method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' }, body,
  });
  if (!r.ok) throw new Error('France Travail token ' + r.status);
  return (await r.json()).access_token;
}
export async function fetchFranceTravail(token, prefs) {
  const locs = prefs.locations || [];
  const depts = locs.filter((l) => l.startsWith('D:')).map((l) => l.slice(2));
  const regions = locs.filter((l) => l.startsWith('R:')).map((l) => FT_REGION[l.slice(2)]).filter(Boolean);
  const anywhere = locs.includes('FRANCE') || locs.includes('REMOTE') || (!depts.length && !regions.length);
  const areas = anywhere ? [{}] : [...regions.map((r) => ({ region: r })), ...(depts.length ? [{ departement: depts.slice(0, 5).join(',') }] : [])];
  const contract = { cdi: 'CDI', cdi_cdd: 'CDI,CDD', cdi_free: 'CDI,LIB' }[prefs.contract];
  const out = [];
  for (const role of (prefs.roles || []).slice(0, 3)) {
    for (const area of areas.slice(0, 4)) {
      const q = new URLSearchParams({ motsCles: role, publieeDepuis: String(prefs.since || 3), range: '0-49', sort: '1', ...area });
      if (contract) q.set('typeContrat', contract);
      const r = await fetch('https://api.francetravail.io/partenaire/offresdemploi/v2/offres/search?' + q, { headers: { authorization: 'Bearer ' + token, accept: 'application/json' } });
      if (r.status === 204) continue;
      if (!r.ok && r.status !== 206) throw new Error('France Travail search ' + r.status);
      const j = await r.json();
      (j.resultats || []).forEach((x) => out.push({
        id: 'ft:' + x.id, title: x.intitule, company: x.entreprise?.nom || '', url: x.origineOffre?.urlOrigine || `https://candidat.francetravail.fr/offres/recherche/detail/${x.id}`,
        location: x.lieuTravail?.libelle || '', remote: /teletravail/i.test(norm(x.description || '').slice(0, 4000)), workplace: '',
        type: x.typeContratLibelle || x.typeContrat || '', posted: isoOrNull(x.dateCreation), salary: x.salaire?.libelle || '', source: 'francetravail', ftRole: role,
      }));
    }
  }
  return out;
}

/* ---------- matching ---------- */
const STOP = new Set(['de', 'des', 'du', 'la', 'le', 'les', 'l', 'd', 'et', 'en', 'a', 'au', 'aux', 'h', 'f', 'hf', 'fh', 'x', 'm', 'w', 'the', 'of', 'and', 'for', 'in', 'un', 'une']);
const SYN = [
  ['manager', 'responsable', 'head', 'lead', 'chef', 'directeur', 'director'],
  ['informatique', 'it', 'si', 'systemes d information'],
  ['developpeur', 'developer', 'engineer', 'ingenieur', 'software'],
  ['commercial', 'sales', 'account executive', 'business developer'],
  ['comptable', 'accountant', 'accounting', 'comptabilite'],
  ['rh', 'hr', 'people', 'ressources humaines'],
  ['projet', 'project'], ['produit', 'product'], ['donnees', 'data'], ['juriste', 'legal', 'lawyer'],
  ['assistant', 'assistante'], ['infrastructure', 'infra'], ['support', 'helpdesk', 'service desk'],
  ['marketing', 'growth'], ['achats', 'procurement', 'purchasing', 'acheteur', 'buyer'], ['finance', 'financier', 'financial'],
  ['operations', 'ops', 'exploitation'], ['securite', 'security', 'cybersecurite', 'cybersecurity'], ['client', 'customer'],
];
const synOf = (w) => SYN.find((g) => g.includes(w)) || [w];
export function roleTokens(role) { return norm(role).split(' ').filter((w) => w && !STOP.has(w)); }
export function roleMatch(title, role) {
  const t = norm(title); const r = norm(role);
  if (!r) return 0;
  if (has(t, r)) return 1;
  const toks = roleTokens(role);
  if (!toks.length) return 0;
  const hit = toks.filter((w) => synOf(w).some((s) => has(t, s))).length;
  return hit / toks.length;
}

const CITY_BY_DEPT = Object.entries(GEO.CITIES).reduce((m, [c, d]) => { (m[d] = m[d] || []).push(c); return m; }, {});
function placeWords(id) {
  if (id.startsWith('D:')) {
    const code = id.slice(2); const d = GEO.D.find((x) => x[0] === code);
    return d ? [norm(d[1]), ...(CITY_BY_DEPT[code] || []).map(norm)] : [];
  }
  if (id.startsWith('R:')) {
    const k = id.slice(2); const words = [norm(GEO.R[k] || '')];
    GEO.D.filter((x) => x[2] === k).forEach((x) => words.push(norm(x[1]), ...(CITY_BY_DEPT[x[0]] || []).map(norm)));
    if (k === 'IDF') words.push('paris area', 'region parisienne', 'greater paris', 'ile de france');
    return words.filter(Boolean);
  }
  return [];
}
const FR_WORDS = ['france', 'french', ...GEO.D.map((x) => norm(x[1])), ...Object.keys(GEO.CITIES).map(norm)];
const inFrance = (loc, country) => { const l = norm(loc); return country === 'FR' || FR_WORDS.some((w) => w && has(l, w)) || /all france/.test(l); };
export function placeMatch(job, locations) {
  const loc = norm(job.location);
  if (job.source === 'francetravail') return true; // already filtered by the API
  for (const id of locations) {
    if (id === 'FRANCE' && inFrance(job.location, job.country)) return true;
    if (id === 'REMOTE' && (job.remote || /remote|teletravail|full remote/.test(loc)) && (inFrance(job.location, job.country) || /europe|emea|anywhere|worldwide/.test(loc))) return true;
    if (placeWords(id).some((w) => w && has(loc, w))) return true;
  }
  return false;
}

const EXCL_RX = {
  interim: /\b(interim|interimaire|mission d interim)\b/, stage: /\b(stage|stagiaire|intern|internship)\b/,
  alternance: /\b(alternance|alternant|apprenti|apprentie|apprentice|apprenticeship|work study)\b/,
  cdd: /\b(cdd|fixed term|temporary|maternity cover|remplacement)\b/, partiel: /\b(temps partiel|part time)\b/,
  nuit: /\b(nuit|night)\b/, weekend: /\b(week end|weekend)\b/, astreintes: /\b(astreinte|astreintes|on call)\b/,
  deplacements: /\b(deplacements|itinerant|travel)\b/, esn: /\b(esn|ssii)\b/, cabinets: /\b(cabinet de recrutement|recruitment agency)\b/,
};
export function excluded(job, prefs) {
  const text = norm(job.title + ' ' + job.type);
  const tags = new Set(prefs.excludeTags || []);
  if (prefs.contract === 'cdi' || prefs.contract === 'cdi_free') { tags.add('stage'); tags.add('alternance'); tags.add('cdd'); tags.add('interim'); }
  if (prefs.contract === 'cdi_cdd') { tags.add('stage'); tags.add('alternance'); tags.add('interim'); }
  for (const tg of tags) if (EXCL_RX[tg] && EXCL_RX[tg].test(text)) return true;
  if (tags.has('nosalary') && !job.salary) return true;
  const words = String(prefs.exclude || '').split(/[,;\n]/).map(norm).filter(Boolean);
  const hay = norm(job.title + ' ' + job.company);
  if (words.some((w) => has(hay, w) || hay.includes(w))) return true;
  return false;
}

function salaryTooLow(job, prefs) {
  if (!job.salary || !prefs.salary) return false;
  const lo = prefs.salary === '100+' ? 100 : Number(String(prefs.salary).split('-')[0]);
  const nums = (job.salary.match(/\d[\d\s.]*/g) || []).map((n) => parseFloat(n.replace(/\s/g, ''))).filter((n) => n > 1000);
  if (!nums.length || !/annuel/i.test(job.salary)) return false;
  return Math.max(...nums) / 1000 < lo;
}

export function selectOffers(jobs, prefs, seen = new Set(), now = Date.now()) {
  const sinceMs = Number(prefs.since || 3) * 86400000;
  const roles = prefs.roles || [];
  const out = []; const keys = new Set();
  for (const j of jobs) {
    if (!j.title || !j.url) continue;
    if (j.posted && now - Date.parse(j.posted) > sinceMs) continue;
    if (!j.posted && j.source !== 'francetravail') continue;
    const score = Math.max(0, ...roles.map((r) => roleMatch(j.title, r)));
    if (score < 1 && !(j.source === 'francetravail' && score >= 0.5)) continue;
    if (!placeMatch(j, prefs.locations || [])) continue;
    if (excluded(j, prefs) || salaryTooLow(j, prefs)) continue;
    const key = norm(j.title) + '|' + norm(j.company);
    if (keys.has(key) || seen.has(j.id) || seen.has(key)) continue;
    keys.add(key); out.push({ ...j, key });
  }
  out.sort((a, b) => Date.parse(b.posted || 0) - Date.parse(a.posted || 0));
  return out.slice(0, Number(prefs.max) || 8);
}

/* ---------- search links (same as the app) ---------- */
export const LINK_NAMES = { linkedin: 'LinkedIn', indeed: 'Indeed', wttj: 'Welcome to the Jungle', hellowork: 'HelloWork', apec: 'APEC', francetravail: 'France Travail' };
function locName(id) {
  if (!id) return 'France';
  if (id.startsWith('R:')) return GEO.R[id.slice(2)] || 'France';
  if (id.startsWith('D:')) { const d = GEO.D.find((x) => x[0] === id.slice(2)); return d ? d[1] : 'France'; }
  return 'France';
}
export function searchLink(id, role, prefs) {
  const first = (prefs.locations || []).find((l) => l.startsWith('R:') || l.startsWith('D:'));
  const loc = locName(first); const remote = (prefs.locations || []).includes('REMOTE');
  const d = String(prefs.since || 3); const e = encodeURIComponent; const q = role;
  const qq = remote && id !== 'linkedin' ? q + ' télétravail' : q;
  switch (id) {
    case 'linkedin': return `https://www.linkedin.com/jobs/search/?keywords=${e(q)}&location=${e(loc + ', France')}&f_TPR=r${Number(d) * 86400}${remote ? '&f_WT=2' : ''}`;
    case 'indeed': return `https://fr.indeed.com/jobs?q=${e(qq)}&l=${e(loc)}&fromage=${d}&sort=date`;
    case 'wttj': return `https://www.welcometothejungle.com/fr/jobs?query=${e(q)}&aroundQuery=${e(loc + ', France')}&sortBy=mostRecent`;
    case 'hellowork': return `https://www.hellowork.com/fr-fr/emploi/recherche.html?k=${e(qq)}&l=${e(loc)}&st=date&d=${d === '1' ? 'd' : 'w'}`;
    case 'apec': return `https://www.apec.fr/candidat/recherche-emploi.html/emploi?motsCles=${e(qq + (loc !== 'France' ? ' ' + loc : ''))}`;
    case 'francetravail': return `https://candidat.francetravail.fr/offres/recherche?motsCles=${e(qq)}&offresPartenaires=true&tri=1&emission=${d}`;
    default: return '';
  }
}

/* ---------- emails ---------- */
const TX = {
  fr: {
    confirmSubject: 'Confirme tes alertes emploi', hello: 'Bonjour {n},', helloAnon: 'Bonjour,',
    confirmIntro: 'Tu as demandé à recevoir des offres d’emploi par email avec Veille Emploi. Clique sur le bouton pour confirmer : c’est ce qui démarre tes alertes.',
    confirmBtn: 'Confirmer mes alertes', confirmIgnore: 'Si ce n’est pas toi, ignore simplement cet email : rien ne sera envoyé.',
    yourChoices: 'Tes critères', jobs: 'Postes', places: 'Lieux', since: 'Publiées depuis', freq: 'Fréquence',
    days: { 1: '24 heures', 3: '3 jours', 7: '7 jours' }, freqs: { 1: 'tous les jours', 2: 'tous les 2 jours', 7: 'chaque semaine' },
    alertSubject: '{n} nouvelle(s) offre(s) pour toi – {d}', alertSubject0: 'Tes recherches d’offres du {d}',
    activeNow: 'Tes alertes sont actives ✓ Prochain envoi : {d}.',
    offersTitle: 'Nouvelles offres', none: 'Pas de nouvelle offre correspondante dans les sources automatiques cette fois. Les liens ci-dessous te montrent les dernières annonces sur chaque site.',
    linksTitle: 'Chercher aussi sur', linksHelp: 'Ces liens ouvrent les annonces publiées depuis {d}, déjà triées par date.',
    posted: 'publiée le', startups: 'Startups', francetravail: 'France Travail', remote: 'télétravail',
    footer: 'Pour changer tes critères, ouvre l’app Veille Emploi. Tu ne veux plus recevoir ces emails ?', stop: 'Arrêter mes alertes',
    open: 'Ouvrir l’app', at: 'à',
  },
  en: {
    confirmSubject: 'Confirm your job alerts', hello: 'Hello {n},', helloAnon: 'Hello,',
    confirmIntro: 'You asked Veille Emploi to email you job offers. Click the button to confirm: this is what starts your alerts.',
    confirmBtn: 'Confirm my alerts', confirmIgnore: 'If this wasn’t you, just ignore this email: nothing will be sent.',
    yourChoices: 'Your criteria', jobs: 'Jobs', places: 'Places', since: 'Posted within', freq: 'Frequency',
    days: { 1: '24 hours', 3: '3 days', 7: '7 days' }, freqs: { 1: 'every day', 2: 'every 2 days', 7: 'every week' },
    alertSubject: '{n} new job offer(s) for you – {d}', alertSubject0: 'Your job searches for {d}',
    activeNow: 'Your alerts are on ✓ Next email: {d}.',
    offersTitle: 'New offers', none: 'No new matching offer in the automatic sources this time. The links below show the latest ads on each site.',
    linksTitle: 'Also search on', linksHelp: 'These links open ads posted within {d}, already sorted by date.',
    posted: 'posted', startups: 'Startups', francetravail: 'France Travail', remote: 'remote',
    footer: 'To change your criteria, open the Veille Emploi app. Don’t want these emails anymore?', stop: 'Stop my alerts',
    open: 'Open the app', at: 'at',
  },
};
const tx = (lang) => TX[lang === 'en' ? 'en' : 'fr'];
const fill = (s, v) => s.replace(/\{(\w+)\}/g, (_, k) => v[k] ?? '');
export const firstName = (n) => String(n || '').trim().split(/\s+/)[0] || '';
export function placeLabel(id, lang) {
  if (id === 'REMOTE') return lang === 'en' ? 'Fully remote' : 'Télétravail complet';
  if (id === 'FRANCE') return lang === 'en' ? 'Anywhere in France' : 'Toute la France';
  if (id.startsWith('D:')) { const d = GEO.D.find((x) => x[0] === id.slice(2)); return d ? `${d[0]} ${d[1]}` : id; }
  return GEO.R[id.slice(2)] || id;
}
export function fmtDate(iso, lang, withTime = false) {
  const o = { timeZone: 'Europe/Paris', weekday: withTime ? 'long' : undefined, day: 'numeric', month: 'long' };
  let s = new Date(iso).toLocaleDateString(lang === 'en' ? 'en-GB' : 'fr-FR', o);
  if (withTime) s += ' ' + tx(lang).at + ' ' + new Date(iso).toLocaleTimeString(lang === 'en' ? 'en-GB' : 'fr-FR', { timeZone: 'Europe/Paris', hour: '2-digit', minute: '2-digit' });
  return s;
}

const shortLoc = (loc) => { const p = [...new Set(String(loc || '').split(/\s*[·;]\s*/).filter(Boolean))]; return p.slice(0, 3).join(' · ') + (p.length > 3 ? ' …' : ''); };
const wrap = (inner) => `<!doctype html><html><body style="margin:0;background:#f3f6f5;font-family:Segoe UI,Arial,sans-serif;color:#1a2321">
<div style="max-width:600px;margin:0 auto;padding:20px 14px">
<div style="font-weight:700;color:#0f5c4f;font-size:18px;margin-bottom:12px">Veille Emploi</div>
<div style="background:#ffffff;border-radius:12px;padding:20px 18px;line-height:1.5;font-size:15px">${inner}</div>
</div></body></html>`;

function criteria(prefs, lang) {
  const L = tx(lang);
  const rows = [
    [L.jobs, (prefs.roles || []).join(', ')],
    [L.places, (prefs.locations || []).map((l) => placeLabel(l, lang)).join(', ')],
    [L.since, L.days[prefs.since] || prefs.since],
    [L.freq, L.freqs[prefs.freq] || prefs.freq],
  ];
  return `<div style="margin-top:18px;padding:12px 14px;background:#eef6f3;border-radius:10px;font-size:13px">
<div style="font-weight:600;margin-bottom:4px">${esc(L.yourChoices)}</div>
${rows.map(([k, v]) => `<div><span style="color:#56655f">${esc(k)} :</span> ${esc(v)}</div>`).join('')}</div>`;
}

export function confirmEmail(prefs, confirmUrl) {
  const L = tx(prefs.lang); const n = firstName(prefs.name);
  const html = wrap(`<p>${esc(n ? fill(L.hello, { n }) : L.helloAnon)}</p>
<p>${esc(L.confirmIntro)}</p>
<p style="margin:22px 0"><a href="${esc(confirmUrl)}" style="background:#0f6b5c;color:#fff;text-decoration:none;padding:12px 20px;border-radius:10px;font-weight:600;display:inline-block">${esc(L.confirmBtn)}</a></p>
${criteria(prefs, prefs.lang)}
<p style="color:#56655f;font-size:13px;margin-top:16px">${esc(L.confirmIgnore)}</p>`);
  const text = `${n ? fill(L.hello, { n }) : L.helloAnon}\n\n${L.confirmIntro}\n\n${L.confirmBtn}: ${confirmUrl}\n\n${L.confirmIgnore}`;
  return { subject: L.confirmSubject, html, text };
}

export function alertEmail(prefs, offers, { stopUrl, nextRun, first, ftLink }) {
  const L = tx(prefs.lang); const lang = prefs.lang; const n = firstName(prefs.name);
  const today = fmtDate(new Date().toISOString(), lang);
  const subject = offers.length ? fill(L.alertSubject, { n: offers.length, d: today }) : fill(L.alertSubject0, { d: today });
  const items = offers.map((o) => `<div style="padding:12px 0;border-bottom:1px solid #e3ece9">
<a href="${esc(o.url)}" style="color:#0f5c4f;font-weight:600;font-size:16px;text-decoration:none">${esc(o.title)}</a>
<div style="color:#56655f;font-size:13px;margin-top:2px">${esc([o.company, shortLoc(o.location), o.remote ? L.remote : '', o.salary].filter(Boolean).join(' · '))}</div>
<div style="color:#56655f;font-size:12px">${esc(L[o.source] || o.source)}${o.posted ? ' · ' + esc(L.posted) + ' ' + esc(fmtDate(o.posted, lang)) : ''}</div></div>`).join('');
  const links = (prefs.sources || []).filter((s) => ['linkedin', 'indeed', 'wttj', 'hellowork', 'apec'].includes(s) || (s === 'francetravail' && ftLink));
  const role = (prefs.roles || [])[0] || '';
  const linkHtml = links.length && role ? `<h3 style="font-size:15px;margin:22px 0 4px">${esc(L.linksTitle)}</h3>
<p style="color:#56655f;font-size:13px;margin:0 0 8px">${esc(fill(L.linksHelp, { d: L.days[prefs.since] || '' }))}</p>
${(prefs.roles || []).slice(0, 3).map((r) => `<div style="margin:8px 0"><div style="font-size:13px;font-weight:600;margin-bottom:4px">${esc(r)}</div>${links.map((s) => `<a href="${esc(searchLink(s, r, prefs))}" style="display:inline-block;margin:0 6px 6px 0;padding:7px 11px;border:1px solid #9cc9bd;border-radius:999px;color:#0f5c4f;text-decoration:none;font-size:13px">${esc(LINK_NAMES[s])} ↗</a>`).join('')}</div>`).join('')}` : '';
  const html = wrap(`<p>${esc(n ? fill(L.hello, { n }) : L.helloAnon)}</p>
${first ? `<p style="background:#e8f5ef;border-radius:10px;padding:10px 12px;color:#0f5c4f;font-weight:600">${esc(fill(L.activeNow, { d: fmtDate(nextRun, lang, true) }))}</p>` : ''}
<h3 style="font-size:15px;margin:16px 0 0">${esc(L.offersTitle)}</h3>
${offers.length ? items : `<p style="color:#56655f">${esc(L.none)}</p>`}
${linkHtml}
${criteria(prefs, lang)}
<p style="color:#56655f;font-size:12px;margin-top:18px">${esc(L.footer)} <a href="${esc(stopUrl)}" style="color:#56655f">${esc(L.stop)}</a> · <a href="${esc(APP_URL)}" style="color:#56655f">${esc(L.open)}</a></p>`);
  const text = [n ? fill(L.hello, { n }) : L.helloAnon, '', ...offers.map((o) => `- ${o.title} – ${o.company} (${o.location}) ${o.url}`), offers.length ? '' : L.none, '', `${L.stop}: ${stopUrl}`].join('\n');
  return { subject, html, text };
}

/* ---------- input validation ---------- */
const str = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const arr = (v, maxN, maxL) => (Array.isArray(v) ? v.filter((x) => typeof x === 'string' && x.trim()).map((x) => x.trim().slice(0, maxL)).slice(0, maxN) : []);
const SOURCE_IDS = ['francetravail', 'startups', 'linkedin', 'indeed', 'wttj', 'hellowork', 'apec'];
const EXCL_IDS = ['interim', 'stage', 'alternance', 'cdd', 'partiel', 'nuit', 'weekend', 'astreintes', 'deplacements', 'esn', 'cabinets', 'nosalary'];
export function cleanPrefs(p = {}) {
  const pick = (v, ok, dflt) => (ok.includes(String(v)) ? String(v) : dflt);
  const hour = /^([01]\d|2[0-3]):[0-5]\d$/.test(p.hour) ? p.hour : '07:45';
  return {
    name: str(p.name, 80), lang: pick(p.lang, ['fr', 'en'], 'fr'),
    roles: arr(p.roles, 6, 80), locations: arr(p.locations, 30, 12).filter((l) => /^(REMOTE|FRANCE|R:[A-Z]{3}|D:[0-9AB]{2,3})$/.test(l)),
    remote: pick(p.remote, ['hybrid', 'onsite', 'remote'], 'hybrid'), contract: pick(p.contract, ['cdi', 'cdi_cdd', 'cdi_free', 'all'], 'cdi'),
    salary: pick(p.salary, ['', '25-35', '35-45', '45-55', '55-65', '65-80', '80-100', '100+'], ''),
    excludeTags: arr(p.excludeTags, 12, 20).filter((x) => EXCL_IDS.includes(x)), exclude: str(p.exclude, 300),
    sources: arr(p.sources, 7, 20).filter((x) => SOURCE_IDS.includes(x)), since: pick(p.since, ['1', '3', '7'], '3'),
    freq: pick(p.freq, ['1', '2', '7'], '2'), hour, max: pick(p.max, ['5', '8', '10'], '8'),
  };
}
export const validEmail = (e) => typeof e === 'string' && e.length <= 200 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
