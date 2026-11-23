const VERSION = '0.4.0';
const KEY = 've:data';
const SKEY = 've:settings';
const PDFJS = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/';
const $ = (id) => document.getElementById(id);
const G = window.VE_GEO;

/* ---------- storage ---------- */
function read(k) { try { return JSON.parse(localStorage.getItem(k)) || {}; } catch { return {}; } }
function write(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* storage unavailable */ } }
let data = read(KEY);
let settings = Object.assign({ lang: (navigator.language || 'fr').toLowerCase().startsWith('fr') ? 'fr' : 'en', freq: '2', hour: '07:45', max: '8', theme: 'auto' }, read(SKEY));
// migrate v0.1 fields
if (!data.roles) data.roles = data.postes ? data.postes.split(',').map((s) => s.trim()).filter(Boolean) : [];
if (!data.locations) data.locations = [];
if (data.lieu && !data.locations.length) { const m = matchLocations(data.lieu); data.locations = m.length ? m : []; }
delete data.postes; delete data.lieu;
if (!['hybrid', 'onsite', 'remote'].includes(data.teletravail)) data.teletravail = 'hybrid';
if (!['cdi', 'cdi_cdd', 'cdi_free', 'all'].includes(data.contrat)) data.contrat = 'cdi';
const SOURCES = [
  { id: 'francetravail', name: 'France Travail', auto: true },
  { id: 'startups', name: { fr: 'Startups et scale-ups', en: 'Startups & scale-ups' }, auto: true },
  { id: 'linkedin', name: 'LinkedIn' },
  { id: 'indeed', name: 'Indeed' },
  { id: 'wttj', name: 'Welcome to the Jungle' },
  { id: 'hellowork', name: 'HelloWork' },
  { id: 'apec', name: 'APEC' },
];
if (!Array.isArray(data.sources)) data.sources = ['francetravail', 'startups', 'linkedin', 'indeed', 'wttj', 'hellowork'];
if (!['1', '3', '7'].includes(data.since)) data.since = '3';
const SAL = ['25-35', '35-45', '45-55', '55-65', '65-80', '80-100', '100+'];
if (data.salaire && !SAL.includes(data.salaire)) {
  const n = parseInt(String(data.salaire).replace(/\D/g, ''), 10);
  data.salaire = !n ? '' : n >= 100 ? '100+' : SAL.find((r) => { const [a, b] = r.split('-').map(Number); return n >= a && n < b; }) || '';
}
const EXCL = ['interim', 'stage', 'alternance', 'cdd', 'partiel', 'nuit', 'weekend', 'astreintes', 'deplacements', 'esn', 'cabinets', 'nosalary'];
if (!Array.isArray(data.excludeTags)) data.excludeTags = [];
if (!data.regionDepts || typeof data.regionDepts !== 'object') data.regionDepts = {};
const save = () => write(KEY, data);

/* ---------- text ---------- */
const T = {
  fr: {
    install: "Installer l'app", settings: 'Réglages', close: 'Fermer',
    beta: "<b>Version test.</b> L'app ne cherche pas encore de vraies offres : tu peux tout essayer, et les offres affichées sont des exemples. Tes informations restent sur ton téléphone.",
    iosHint: "Pour l'installer sur iPhone : touche <b>Partager</b> puis <b>Sur l'écran d'accueil</b>.",
    inactive: 'INACTIF', active: 'ACTIF', statusOff: 'Dépose ton CV, dis ce que tu cherches, puis active tes alertes.',
    nextEmail: 'Prochain email :', sentTo: 'Envoyé à', maxText: "jusqu'à {n} offres par email",
    freq1: ', puis tous les jours.', freq2: ', puis tous les 2 jours.', freq7: ', puis chaque semaine.',
    cvTitle: 'Mon CV', cvEmpty: "Aucun CV pour l'instant. Format PDF.", cvChoose: 'Choisir mon CV', cvReplace: 'Remplacer mon CV',
    cvLocal: "Ton CV est lu sur ton appareil : il n'est envoyé nulle part.", cvReading: 'Lecture du CV…',
    cvNotPdf: "Ce fichier n'est pas un PDF. Choisis ton CV au format PDF.", cvMissing: 'Ajoute ton CV en PDF pour activer les alertes.',
    cvUnreadable: "Je n'ai pas pu lire le texte de ce PDF (CV scanné en image ?). Remplis les champs à la main.",
    cvFound: 'Rempli d\'après ton CV : {list}. Vérifie et modifie si besoin.', cvNothing: "CV ajouté. Je n'ai rien trouvé à remplir automatiquement.",
    fName: 'prénom', fEmail: 'email', fRoles: '{n} poste(s)', fLoc: 'lieu', fYears: '{n} ans d\'expérience repérés',
    prefsTitle: 'Ce que je recherche', firstName: 'Prénom', firstNamePh: 'Camille', email: 'Email pour recevoir les offres', emailPh: 'camille@exemple.fr',
    roles: 'Postes visés', rolesPh: 'Écris un poste puis Entrée', rolesHelp: 'Touche une suggestion pour l\'ajouter, ou écris ton propre intitulé.',
    fromCv: "D'après ton CV :", location: 'Lieu', locationPh: 'Région, département ou ville',
    salary: 'Salaire souhaité (brut/an)', salAny: 'Peu importe', salPlus: '100 k€ et plus', remote: 'Télétravail', contract: 'Contrat',
    exclude: 'À exclure (facultatif)', excludeOther: 'Autre chose à exclure', excludePh: 'Ex. un secteur, une entreprise…',
    x_interim: 'Intérim', x_stage: 'Stage', x_alternance: 'Alternance', x_cdd: 'CDD', x_partiel: 'Temps partiel', x_nuit: 'Horaires de nuit',
    x_weekend: 'Week-ends', x_astreintes: 'Astreintes', x_deplacements: 'Déplacements fréquents', x_esn: 'ESN et sociétés de conseil',
    x_cabinets: 'Cabinets de recrutement', x_nosalary: 'Sans salaire indiqué',
    regionPick: 'Départements – {r}', regionAll: 'Tous', regionHelp: 'Touche des départements pour réduire la zone.',
    remote_hybrid: 'Hybride ou complet', remote_onsite: 'Sur site accepté', remote_remote: 'Télétravail complet uniquement',
    contract_cdi: 'CDI', contract_cdi_cdd: 'CDI ou CDD', contract_cdi_free: 'CDI ou freelance', contract_all: 'Tous',
    consent: "J'accepte que mon CV soit analysé pour me proposer des offres. Je peux tout supprimer à tout moment.",
    activate: 'Activer mes alertes', update: 'Mettre à jour mes alertes', pause: 'Mettre en pause',
    missing: 'Il manque : {list}.', mCv: 'ton CV', mEmail: 'un email valide', mRoles: 'au moins un poste', mLoc: 'un lieu', mConsent: 'ton accord (case à cocher)',
    previewTitle: 'Aperçu de ton prochain email', previewNote: "Offres d'exemple : la vraie recherche arrive dans la prochaine version.",
    subject: 'Nouvelles offres à postuler – {d}', hello: 'Bonjour {name}, voici 2 nouvelles offres qui correspondent à ton CV. Postule dans les 48 heures.',
    why: 'Pourquoi : ', warn: "Point d'attention : ", ex1c: 'Scale-up (exemple)', ex2c: 'PME en croissance (exemple)',
    ex1w: 'Ton expérience correspond aux missions principales de ce poste.', ex2w: 'Ton parcours couvre la plupart des compétences attendues.',
    ex1a: 'Anglais courant demandé', ex2a: 'Secteur nouveau pour toi', hybridTxt: 'hybride, 2 j de télétravail', onsiteTxt: 'sur site 3 j', remoteTxt: 'télétravail complet',
    dataTitle: 'Mes données', dataNote: "Dans cette version test, tout reste sur cet appareil : rien n'est envoyé.", wipe: 'Supprimer mes données', wiped: 'Tout est supprimé.',
    language: 'Langue', frequency: 'Fréquence des alertes', f1: 'Tous les jours', f2: 'Tous les 2 jours', f7: 'Chaque semaine',
    sendTime: "Heure d'envoi", maxOffers: 'Offres max par email', theme: 'Thème', tAuto: 'Automatique', tLight: 'Clair', tDark: 'Sombre', done: 'Terminé',
    alertTitle: "Options d'alerte", sourcesTitle: 'Sources des offres', sinceTitle: 'Publiées depuis',
    sourcesHelp: "« Offres envoyées » : l'app les cherche et les trie pour toi. « Lien de recherche » : ces sites n'ont pas d'accès gratuit, l'email contient un lien qui ouvre leurs offres récentes avec tes critères.",
    badgeAuto: 'offres envoyées', badgeLink: 'lien de recherche', since1: '24 heures', since3: '3 jours', since7: '7 jours',
    mSources: 'au moins une source', linksTitle: 'Recherches prêtes', linksHelp: 'Un clic ouvre les offres publiées depuis {d}, avec tes critères.',
    noAuto: "Tu n'as coché que des liens de recherche : l'email contiendra seulement les liens ci-dessous.", dLabel1: '24 heures', dLabel3: '3 jours', dLabel7: '7 jours',
    testVersion: 'version test', at: 'à', remove: 'Retirer', add: 'Ajouter', noMatch: 'Aucun lieu trouvé',
  },
  en: {
    install: 'Install app', settings: 'Settings', close: 'Close',
    beta: "<b>Test version.</b> The app doesn't search real job offers yet: try everything, the offers shown are examples. Your information stays on your phone.",
    iosHint: 'To install on iPhone: tap <b>Share</b>, then <b>Add to Home Screen</b>.',
    inactive: 'OFF', active: 'ON', statusOff: 'Add your CV, say what you are looking for, then turn on your alerts.',
    nextEmail: 'Next email:', sentTo: 'Sent to', maxText: 'up to {n} offers per email',
    freq1: ', then every day.', freq2: ', then every 2 days.', freq7: ', then every week.',
    cvTitle: 'My CV', cvEmpty: 'No CV yet. PDF format.', cvChoose: 'Choose my CV', cvReplace: 'Replace my CV',
    cvLocal: 'Your CV is read on your device: it is not sent anywhere.', cvReading: 'Reading your CV…',
    cvNotPdf: 'This file is not a PDF. Choose your CV as a PDF.', cvMissing: 'Add your CV as a PDF to turn on alerts.',
    cvUnreadable: "I couldn't read the text in this PDF (scanned image?). Fill in the fields by hand.",
    cvFound: 'Filled from your CV: {list}. Check and edit if needed.', cvNothing: 'CV added. Nothing could be filled in automatically.',
    fName: 'first name', fEmail: 'email', fRoles: '{n} job title(s)', fLoc: 'location', fYears: '{n} years of experience found',
    prefsTitle: "What I'm looking for", firstName: 'First name', firstNamePh: 'Camille', email: 'Email to receive offers', emailPh: 'camille@example.com',
    roles: 'Target jobs', rolesPh: 'Type a job title, then Enter', rolesHelp: 'Tap a suggestion to add it, or type your own title.',
    fromCv: 'From your CV:', location: 'Location', locationPh: 'Region, department or city',
    salary: 'Salary range (gross/year)', salAny: 'Any', salPlus: '100 k€ and above', remote: 'Remote work', contract: 'Contract',
    exclude: 'Exclude (optional)', excludeOther: 'Anything else to exclude', excludePh: 'e.g. an industry, a company…',
    x_interim: 'Temp work', x_stage: 'Internship', x_alternance: 'Apprenticeship', x_cdd: 'Fixed-term', x_partiel: 'Part-time', x_nuit: 'Night shifts',
    x_weekend: 'Weekends', x_astreintes: 'On-call duty', x_deplacements: 'Frequent travel', x_esn: 'IT services & consulting firms',
    x_cabinets: 'Recruitment agencies', x_nosalary: 'No salary shown',
    regionPick: 'Departments – {r}', regionAll: 'All', regionHelp: 'Tap departments to narrow the area.',
    remote_hybrid: 'Hybrid or fully remote', remote_onsite: 'On-site is fine', remote_remote: 'Fully remote only',
    contract_cdi: 'Permanent (CDI)', contract_cdi_cdd: 'Permanent or fixed-term', contract_cdi_free: 'Permanent or freelance', contract_all: 'Any',
    consent: 'I agree that my CV is analysed to suggest job offers. I can delete everything at any time.',
    activate: 'Turn on my alerts', update: 'Update my alerts', pause: 'Pause alerts',
    missing: 'Missing: {list}.', mCv: 'your CV', mEmail: 'a valid email', mRoles: 'at least one job title', mLoc: 'a location', mConsent: 'your consent (checkbox)',
    previewTitle: 'Preview of your next email', previewNote: 'Example offers: real search comes in the next version.',
    subject: 'New jobs to apply for – {d}', hello: 'Hi {name}, here are 2 new offers that match your CV. Apply within 48 hours.',
    why: 'Why: ', warn: 'Watch out: ', ex1c: 'Scale-up (example)', ex2c: 'Growing SME (example)',
    ex1w: 'Your experience matches the main duties of this role.', ex2w: 'Your background covers most of the required skills.',
    ex1a: 'Fluent English required', ex2a: 'New industry for you', hybridTxt: 'hybrid, 2 days remote', onsiteTxt: 'on-site 3 days', remoteTxt: 'fully remote',
    dataTitle: 'My data', dataNote: 'In this test version everything stays on this device: nothing is sent.', wipe: 'Delete my data', wiped: 'Everything is deleted.',
    language: 'Language', frequency: 'Alert frequency', f1: 'Every day', f2: 'Every 2 days', f7: 'Every week',
    sendTime: 'Send time', maxOffers: 'Max offers per email', theme: 'Theme', tAuto: 'Automatic', tLight: 'Light', tDark: 'Dark', done: 'Done',
    alertTitle: 'Alert options', sourcesTitle: 'Where offers come from', sinceTitle: 'Posted within',
    sourcesHelp: '"Offers sent": the app finds and ranks them for you. "Search link": these sites have no free access, so the email includes a link that opens their recent offers with your criteria.',
    badgeAuto: 'offers sent', badgeLink: 'search link', since1: '24 hours', since3: '3 days', since7: '7 days',
    mSources: 'at least one source', linksTitle: 'Ready-made searches', linksHelp: 'One click opens offers posted in the last {d}, with your criteria.',
    noAuto: 'You only ticked search links: the email will contain just the links below.', dLabel1: '24 hours', dLabel3: '3 days', dLabel7: '7 days',
    testVersion: 'test version', at: 'at', remove: 'Remove', add: 'Add', noMatch: 'No location found',
  },
};
const t = (k, v = {}) => (T[settings.lang][k] ?? T.fr[k] ?? k).replace(/\{(\w+)\}/g, (_, x) => v[x] ?? '');

function applyLang() {
  document.documentElement.lang = settings.lang;
  document.querySelectorAll('[data-i18n]').forEach((el) => { el.textContent = t(el.dataset.i18n); });
  document.querySelectorAll('[data-i18n-html]').forEach((el) => { el.innerHTML = t(el.dataset.i18nHtml); });
  document.querySelectorAll('[data-i18n-ph]').forEach((el) => { el.placeholder = t(el.dataset.i18nPh); });
  document.querySelectorAll('[data-i18n-aria]').forEach((el) => { el.setAttribute('aria-label', t(el.dataset.i18nAria)); });
  [...$('teletravail').options].forEach((o) => { o.textContent = t('remote_' + o.value); });
  [...$('contrat').options].forEach((o) => { o.textContent = t('contract_' + o.value); });
  [...$('salaire').options].forEach((o) => { o.textContent = !o.value ? t('salAny') : o.value === '100+' ? t('salPlus') : o.value.replace('-', ' – ') + ' k€'; });
  [...$('setFreq').options].forEach((o) => { o.textContent = t('f' + o.value); });
  const th = { auto: 'tAuto', light: 'tLight', dark: 'tDark' };
  [...$('setTheme').options].forEach((o) => { o.textContent = t(th[o.value]); });
}
function applyTheme() {
  if (settings.theme === 'auto') document.documentElement.removeAttribute('data-theme');
  else document.documentElement.setAttribute('data-theme', settings.theme);
}

/* ---------- locations ---------- */
const locLabel = (id) => {
  const i = G.byId[id]; if (!i) return id;
  if (i.kind === 'special') return i.label[settings.lang];
  if (i.kind === 'region') return i.name;
  return `${i.name} (${i.code})`;
};
const locChipLabel = (id) => {
  const i = G.byId[id]; if (!i) return id;
  if (i.kind === 'dept') return `${i.name} (${i.code}) · ${i.region}`;
  if (i.kind === 'region') {
    const n = (data.regionDepts[id] || []).length;
    return n ? `${i.name} · ${n} dép.` : i.name;
  }
  return locLabel(id);
};
const regionDepts = (rid) => G.items.filter((x) => x.kind === 'dept' && x.region === G.byId[rid].name);
const locSub = (i) => (i.kind === 'dept' ? i.region : i.kind === 'region' ? (settings.lang === 'fr' ? 'Région' : 'Region') : '');
function searchLocations(q) {
  const n = G.norm(q.trim());
  if (!n) return G.items.filter((i) => i.kind !== 'dept').slice(0, 20);
  const ranked = [];
  G.items.forEach((i) => {
    const name = G.norm(i.kind === 'special' ? i.label[settings.lang] : i.name);
    let r = -1;
    if (i.code && i.code.toLowerCase() === n) r = 0;
    else if (name.startsWith(n)) r = 1;
    else if (name.split(/[\s'-]+/).some((w) => w.startsWith(n))) r = 2;
    else if (name.includes(n)) r = 3;
    else if (i.region && G.norm(i.region).startsWith(n)) r = 5;
    if (r >= 0) ranked.push([r, i]);
  });
  Object.keys(G.CITIES).forEach((c) => {
    if (c.startsWith(n) || (n.length > 2 && c.includes(n))) {
      const d = G.byId['D:' + G.CITIES[c]];
      if (d && !ranked.some(([, x]) => x === d)) ranked.push([c.startsWith(n) ? 2 : 4, d]);
    }
  });
  return ranked.sort((a, b) => a[0] - b[0] || (a[1].kind === 'region' ? -1 : 0)).map(([, i]) => i).slice(0, 12);
}
function matchLocations(text) {
  const n = G.norm(text); const found = new Set();
  G.items.forEach((i) => {
    if (i.kind === 'special') return;
    const name = G.norm(i.name);
    if (name.length > 3 && new RegExp('(^|[^a-z])' + name.replace(/[-']/g, '.') + '([^a-z]|$)').test(n)) {
      if (i.kind === 'dept' && ['paris', 'loire', 'marne', 'vienne', 'eure', 'manche', 'nord', 'cher', 'lot', 'var', 'orne', 'indre', 'aube', 'jura', 'gard', 'ain', 'tarn', 'gers', 'aude', 'somme', 'oise', 'aisne', 'meuse', 'savoie', 'vendee', 'sarthe', 'mayenne', 'creuse'].includes(name) && i.code !== '75') return;
      found.add(i.id);
    }
  });
  Object.entries(G.CITIES).forEach(([c, code]) => { if (new RegExp('(^|[^a-z])' + c + '([^a-z]|$)').test(n)) found.add('D:' + code); });
  (n.match(/\b(\d{5})\b/g) || []).forEach((pc) => { const code = pc.startsWith('97') ? pc.slice(0, 3) : pc.slice(0, 2); if (G.byId['D:' + code]) found.add('D:' + code); });
  if (/teletravail complet|full(y)? remote|100 ?% remote/.test(n)) found.add('REMOTE');
  // add the region of each department found
  [...found].forEach((id) => { const i = G.byId[id]; if (i && i.kind === 'dept') { const r = G.items.find((x) => x.kind === 'region' && x.name === i.region); if (r) found.add(r.id); } });
  return [...found];
}

/* ---------- roles ---------- */
const ROLES = [
  ['IT Manager', ['it manager', 'responsable it', 'manager it']],
  ['Responsable informatique', ['responsable informatique', 'responsable it', 'responsable des systemes d.information', 'responsable si']],
  ['Head of IT', ['head of it', 'directeur informatique', 'it director']],
  ['DSI (Directeur des SI)', ['directeur des systemes d.information', '\\bdsi\\b', '\\bcio\\b']],
  ['Responsable infrastructure', ['responsable infrastructure', 'infrastructure manager', 'responsable infra', 'infrastructure & support']],
  ['Responsable support informatique', ['responsable support', 'support manager', 'service desk manager', 'helpdesk manager', 'responsable du support', 'equipe support']],
  ['Service Delivery Manager', ['service delivery']],
  ['Digital Workplace Manager', ['digital workplace', 'modern workplace', 'poste de travail']],
  ['IT Operations Manager', ['it operations', 'operations it', 'responsable exploitation', 'responsable de production']],
  ['Corporate IT Manager', ['corporate it']],
  ['Responsable sécurité (RSSI)', ['\\brssi\\b', '\\bciso\\b', 'responsable securite', 'security manager']],
  ['Administrateur systèmes et réseaux', ['administrateur systeme', 'administrateur reseau', 'sysadmin', 'system administrator']],
  ['Ingénieur systèmes', ['ingenieur system', 'system engineer', 'ingenieur infrastructure']],
  ['Technicien support', ['technicien support', 'support technicien', 'technicien informatique', 'helpdesk', 'support n1', 'support n2']],
  ['Chef de projet IT', ['chef de projet it', 'chef de projet informatique', 'it project manager']],
  ['Chef de projet', ['chef de projet', 'project manager', 'gestion de projet']],
  ['Développeur', ['developpeur', 'developer', 'full stack', 'fullstack', 'front-end', 'back-end']],
  ['Data analyst', ['data analyst', 'analyste de donnees', 'business intelligence']],
  ['Product Manager', ['product manager', 'product owner', 'chef de produit']],
  ['Responsable RH', ['responsable rh', 'responsable ressources humaines', 'hr manager', 'drh']],
  ['HR Business Partner', ['hr business partner', '\\bhrbp\\b']],
  ['Chargé(e) de recrutement', ['recrutement', 'recruiter', 'talent acquisition']],
  ['Gestionnaire de paie', ['gestionnaire de paie', 'payroll']],
  ['Comptable', ['\\bcomptable\\b', '\\baccountant\\b', '\\bcomptabilite\\b']],
  ['Contrôleur de gestion', ['controle de gestion', 'controleur de gestion', 'financial controller']],
  ['Responsable administratif et financier', ['\\bdaf\\b', 'responsable administratif et financier', 'finance manager']],
  ['Commercial / Business Developer', ['business developer', '\\bcommercial\\b', 'sales executive', 'ingenieur d.affaires']],
  ['Account Manager', ['account manager', 'charge de clientele', 'chargee de clientele']],
  ['Customer Success Manager', ['customer success']],
  ['Chargé(e) de marketing', ['\\bmarketing\\b']],
  ['Community Manager', ['community manager', 'reseaux sociaux']],
  ['Assistant(e) de direction', ['assistant de direction', 'assistante de direction', 'office manager', 'executive assistant']],
  ['Responsable logistique', ['logistique', 'supply chain']],
  ['Aide-soignant(e)', ['aide-soignant', 'aide soignant']],
  ['Infirmier(e)', ['infirmier', 'infirmiere', '\\bnurse\\b']],
  ['Formateur(trice) / Enseignant(e)', ['formateur', 'formatrice', 'enseignant', 'teacher', 'trainer']],
];
function suggestRoles(lines) {
  // Lines near the top of a CV (headline, recent jobs) count more than older ones.
  const L = lines.map((l) => G.norm(l)); const n = L.length || 1;
  const scored = ROLES.map(([label, pats]) => {
    let s = 0;
    pats.forEach((p) => {
      const re = new RegExp(p, 'g');
      L.forEach((line, i) => {
        const hits = (line.match(re) || []).length;
        if (hits) s += hits * (i < 6 ? 5 : 1 + 2 * (1 - i / n));
      });
    });
    return { label, s };
  }).filter((r) => r.s > 0).sort((a, b) => b.s - a.s);
  // Keep earlier, more junior roles behind the person's current level.
  const junior = ['Technicien support', 'Administrateur systèmes et réseaux', 'Aide-soignant(e)'];
  if (scored[0] && !junior.includes(scored[0].label)) scored.sort((a, b) => junior.includes(a.label) - junior.includes(b.label));
  return scored.slice(0, 8).map((r) => ({ label: r.label, strong: r.s >= 5 }));
}

/* ---------- CV reading ---------- */
function loadPdfJs() {
  if (window.pdfjsLib) return Promise.resolve(window.pdfjsLib);
  return new Promise((res, rej) => {
    const s = document.createElement('script');
    s.src = PDFJS + 'pdf.min.js';
    s.onload = () => { window.pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS + 'pdf.worker.min.js'; res(window.pdfjsLib); };
    s.onerror = rej; document.head.appendChild(s);
  });
}
async function pdfLines(file) {
  const lib = await loadPdfJs();
  const pdf = await lib.getDocument({ data: await file.arrayBuffer() }).promise;
  const lines = [];
  for (let p = 1; p <= Math.min(pdf.numPages, 4); p++) {
    const page = await pdf.getPage(p);
    const c = await page.getTextContent();
    const rows = new Map();
    c.items.forEach((it) => {
      if (!it.str || !it.str.trim()) return;
      const y = Math.round(it.transform[5] / 3) * 3;
      if (!rows.has(y)) rows.set(y, []);
      rows.get(y).push(it);
    });
    [...rows.entries()].sort((a, b) => b[0] - a[0]).forEach(([, items]) => {
      lines.push(items.sort((a, b) => a.transform[4] - b.transform[4]).map((i) => i.str).join(' ').replace(/\s+/g, ' ').trim());
    });
  }
  return lines.filter(Boolean);
}
function extract(lines) {
  const text = lines.join('\n');
  const email = (text.match(/[\w.+-]+@[\w-]+\.[\w.-]+/) || [])[0] || '';
  let name = '';
  for (const l of lines.slice(0, 5)) {
    const clean = l.trim();
    if (/[@\d|·•:]/.test(clean)) continue;
    const words = clean.split(/\s+/);
    if (words.length >= 2 && words.length <= 4 && words.every((w) => /^[A-Za-zÀ-ÖØ-öø-ÿ'-]+$/.test(w))) { name = clean; break; }
  }
  const first = name ? name.split(/\s+/)[0] : '';
  const prenom = first ? first.charAt(0).toUpperCase() + first.slice(1).toLowerCase() : '';
  const years = (G.norm(text).match(/(\d{1,2})\s*(ans|years)\b/) || [])[1] || '';
  return { email, prenom, years, roles: suggestRoles(lines), locations: (() => { const top = matchLocations(lines.slice(0, 5).join(' ')); return top.length ? top : matchLocations(lines.slice(0, 12).join(' ')); })() };
}

/* ---------- chips ---------- */
function renderChips(boxId, inputId, values, labelFn, onRemove) {
  const box = $(boxId); const input = $(inputId);
  box.querySelectorAll('.chip').forEach((c) => c.remove());
  values.forEach((v, i) => {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'chip';
    b.setAttribute('aria-label', `${t('remove')} ${labelFn(v)}`);
    b.innerHTML = '<span></span><span aria-hidden="true">×</span>';
    b.firstChild.textContent = labelFn(v);
    b.addEventListener('click', () => onRemove(i));
    box.insertBefore(b, input);
  });
}
function renderSuggest(wrapId, rowId, items, isOn, labelFn, onAdd) {
  const left = items.filter((x) => !isOn(x));
  $(wrapId).hidden = !left.length;
  const row = $(rowId); row.textContent = '';
  left.forEach((x) => {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'sugg';
    b.setAttribute('aria-label', `${t('add')} ${labelFn(x)}`);
    b.textContent = '+ ' + labelFn(x);
    b.addEventListener('click', () => onAdd(x));
    row.appendChild(b);
  });
}
function renderRoles() {
  renderChips('roleChips', 'roleInput', data.roles, (v) => v, (i) => { data.roles.splice(i, 1); save(); renderRoles(); });
  renderSuggest('roleSuggest', 'roleSuggestRow', (data.cvSugg && data.cvSugg.roles) || [], (r) => data.roles.includes(r.label), (r) => r.label,
    (r) => { data.roles.push(r.label); save(); renderRoles(); });
}
function renderLocs() {
  renderChips('locChips', 'locInput', data.locations, locChipLabel, (i) => { delete data.regionDepts[data.locations[i]]; data.locations.splice(i, 1); save(); renderLocs(); });
  renderRegionPanels();
  renderSuggest('locSuggest', 'locSuggestRow', (data.cvSugg && data.cvSugg.locations) || [], (id) => data.locations.includes(id) || Object.values(data.regionDepts).some((l) => l.includes(id)), locChipLabel,
    (id) => { data.locations.push(id); save(); renderLocs(); });
}
function addRole(v) {
  const s = v.trim().replace(/,$/, '');
  if (s && !data.roles.some((r) => r.toLowerCase() === s.toLowerCase())) { data.roles.push(s); save(); }
  $('roleInput').value = ''; renderRoles();
}
$('roleInput').addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addRole($('roleInput').value); }
  else if (e.key === 'Backspace' && !$('roleInput').value && data.roles.length) { data.roles.pop(); save(); renderRoles(); }
});
$('roleInput').addEventListener('blur', () => { if ($('roleInput').value.trim()) addRole($('roleInput').value); });
$('roleChips').addEventListener('click', (e) => { if (e.target === $('roleChips')) $('roleInput').focus(); });

let locActive = 0;
function openLocList() {
  const res = searchLocations($('locInput').value).filter((i) => !data.locations.includes(i.id));
  const ul = $('locList'); ul.textContent = '';
  if (!res.length) { const li = document.createElement('li'); li.className = 'empty'; li.textContent = t('noMatch'); ul.appendChild(li); }
  res.forEach((i, idx) => {
    const li = document.createElement('li');
    li.role = 'option'; li.id = 'loc-' + idx; li.dataset.id = i.id;
    li.innerHTML = '<span></span><span class="sub"></span>';
    li.firstChild.textContent = locLabel(i.id); li.lastChild.textContent = locSub(i);
    if (idx === locActive) li.classList.add('on');
    li.addEventListener('mousedown', (e) => { e.preventDefault(); pickLoc(i.id); });
    ul.appendChild(li);
  });
  ul.hidden = false; $('locInput').setAttribute('aria-expanded', 'true');
  if (res[locActive]) $('locInput').setAttribute('aria-activedescendant', 'loc-' + locActive);
}
function closeLocList() { $('locList').hidden = true; $('locInput').setAttribute('aria-expanded', 'false'); }
function pickLoc(id) { if (!data.locations.includes(id)) { data.locations.push(id); save(); } $('locInput').value = ''; locActive = 0; renderLocs(); openLocList(); }
$('locInput').addEventListener('focus', () => { locActive = 0; openLocList(); });
$('locInput').addEventListener('input', () => { locActive = 0; openLocList(); });
$('locInput').addEventListener('blur', () => setTimeout(closeLocList, 120));
$('locInput').addEventListener('keydown', (e) => {
  const opts = [...$('locList').querySelectorAll('li[data-id]')];
  if (e.key === 'ArrowDown') { e.preventDefault(); locActive = Math.min(locActive + 1, opts.length - 1); openLocList(); }
  else if (e.key === 'ArrowUp') { e.preventDefault(); locActive = Math.max(locActive - 1, 0); openLocList(); }
  else if (e.key === 'Enter') { e.preventDefault(); if (opts[locActive]) pickLoc(opts[locActive].dataset.id); }
  else if (e.key === 'Escape') closeLocList();
  else if (e.key === 'Backspace' && !$('locInput').value && data.locations.length) { data.locations.pop(); save(); renderLocs(); }
});
$('locChips').addEventListener('click', (e) => { if (e.target === $('locChips')) $('locInput').focus(); });

function renderRegionPanels() {
  const box = $('regionPanels'); box.textContent = '';
  data.locations.filter((id) => id.startsWith('R:')).forEach((rid) => {
    const chosen = data.regionDepts[rid] || [];
    const wrap = document.createElement('div'); wrap.className = 'region-panel';
    const h = document.createElement('div'); h.className = 'small'; h.textContent = t('regionPick', { r: G.byId[rid].name }) + ' · ' + t('regionHelp');
    const row = document.createElement('div'); row.className = 'toggles';
    const all = document.createElement('button'); all.type = 'button'; all.className = 'toggle'; all.textContent = t('regionAll');
    all.setAttribute('aria-pressed', String(!chosen.length));
    all.addEventListener('click', () => { data.regionDepts[rid] = []; save(); renderLocs(); });
    row.appendChild(all);
    regionDepts(rid).forEach((d) => {
      const b = document.createElement('button'); b.type = 'button'; b.className = 'toggle';
      b.textContent = `${d.code} ${d.name}`; b.setAttribute('aria-pressed', String(chosen.includes(d.id)));
      b.addEventListener('click', () => {
        const cur = new Set(data.regionDepts[rid] || []);
        cur.has(d.id) ? cur.delete(d.id) : cur.add(d.id);
        data.regionDepts[rid] = [...cur]; save(); renderLocs();
      });
      row.appendChild(b);
    });
    wrap.append(h, row); box.appendChild(wrap);
  });
}
function renderExclude() {
  const box = $('excludeTags'); box.textContent = '';
  EXCL.forEach((x) => {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'toggle';
    b.textContent = t('x_' + x); b.setAttribute('aria-pressed', String(data.excludeTags.includes(x)));
    b.addEventListener('click', () => {
      data.excludeTags = data.excludeTags.includes(x) ? data.excludeTags.filter((y) => y !== x) : [...data.excludeTags, x];
      save(); renderExclude();
    });
    box.appendChild(b);
  });
}

/* ---------- alert options ---------- */
const srcName = (s) => (typeof s.name === 'string' ? s.name : s.name[settings.lang]);
function renderSources() {
  const box = $('sources'); box.textContent = '';
  SOURCES.forEach((s) => {
    const l = document.createElement('label'); l.className = 'check';
    l.innerHTML = '<input type="checkbox"><span class="cname"></span><span class="badge"></span>';
    const cb = l.querySelector('input'); cb.id = 'src-' + s.id; cb.checked = data.sources.includes(s.id);
    l.querySelector('.cname').textContent = srcName(s);
    const bd = l.querySelector('.badge'); bd.textContent = s.auto ? t('badgeAuto') : t('badgeLink'); bd.classList.add(s.auto ? 'auto' : 'link');
    cb.addEventListener('change', () => {
      data.sources = SOURCES.filter((x) => $('src-' + x.id).checked).map((x) => x.id); save();
      if (data.active) renderPreview();
    });
    box.appendChild(l);
  });
  document.querySelectorAll('input[name="since"]').forEach((r) => { r.checked = r.value === data.since; });
}
document.querySelectorAll('input[name="since"]').forEach((r) => r.addEventListener('change', () => { data.since = r.value; save(); if (data.active) renderPreview(); }));
function searchParts() {
  const q = data.roles[0] || '';
  const first = data.locations[0];
  const i = first && G.byId[first];
  let loc = 'France';
  const narrowed = i && i.kind === 'region' ? (data.regionDepts[first] || []) : [];
  if (narrowed.length === 1) loc = G.byId[narrowed[0]].name;
  else if (i && i.kind === 'region') loc = i.name;
  else if (i && i.kind === 'dept') loc = i.name;
  return { q, loc, remote: data.locations.includes('REMOTE') };
}
function searchLink(id) {
  const { q, loc, remote } = searchParts();
  const d = data.since; const e = encodeURIComponent;
  const qq = remote && id !== 'linkedin' ? q + ' télétravail' : q;
  switch (id) {
    case 'linkedin': return `https://www.linkedin.com/jobs/search/?keywords=${e(q)}&location=${e(loc + ', France')}&f_TPR=r${Number(d) * 86400}${remote ? '&f_WT=2' : ''}`;
    case 'indeed': return `https://fr.indeed.com/jobs?q=${e(qq)}&l=${e(loc)}&fromage=${d}&sort=date`;
    case 'wttj': return `https://www.welcometothejungle.com/fr/jobs?query=${e(q)}&aroundQuery=${e(loc + ', France')}&sortBy=mostRecent`;
    case 'hellowork': return `https://www.hellowork.com/fr-fr/emploi/recherche.html?k=${e(qq)}&l=${e(loc)}&st=date&d=${d === '1' ? 'd' : 'w'}`;
    case 'apec': return `https://www.apec.fr/candidat/recherche-emploi.html/emploi?motsCles=${e(qq + (loc !== 'France' ? ' ' + loc : ''))}`;
    case 'francetravail': return `https://candidat.francetravail.fr/offres/recherche?motsCles=${e(qq)}&offresPartenaires=true&tri=1&emission=${d}`;
    default: return '#';
  }
}

/* ---------- main render ---------- */
const FIELDS = ['prenom', 'email', 'salaire', 'teletravail', 'contrat', 'exclure'];
function nextSend(from = new Date()) {
  const [h, m] = settings.hour.split(':').map(Number);
  const d = new Date(from); d.setHours(h, m, 0, 0);
  if (d <= from) d.setDate(d.getDate() + 1);
  return d;
}
const locale = () => (settings.lang === 'fr' ? 'fr-FR' : 'en-GB');
const fmtTime = () => (settings.lang === 'fr' ? settings.hour.replace(':', ' h ') : settings.hour);
function render() {
  FIELDS.forEach((f) => { if (data[f] !== undefined) $(f).value = data[f]; });
  $('consent').checked = !!data.consent;
  const hasCv = !!data.cvName;
  $('fileRow').hidden = !hasCv; $('fileEmpty').hidden = hasCv;
  $('fileName').textContent = data.cvName || '';
  $('cvLabel').textContent = hasCv ? t('cvReplace') : t('cvChoose');
  renderFound(); renderRoles(); renderLocs(); renderSources(); renderExclude();
  const on = !!data.active;
  $('statusOn').hidden = !on; $('statusOff').hidden = on; $('pause').hidden = !on;
  $('activate').textContent = on ? t('update') : t('activate');
  if (on) {
    $('nextDate').textContent = nextSend().toLocaleDateString(locale(), { weekday: 'long', day: 'numeric', month: 'long' }) + ' ' + t('at') + ' ' + fmtTime();
    $('freqText').textContent = t('freq' + settings.freq);
    $('sentTo').textContent = data.email || '—';
    $('maxText').textContent = t('maxText', { n: settings.max });
    renderPreview();
  }
  $('preview').hidden = !on;
}
function renderFound() {
  const f = data.cvFound;
  if (!f) { $('cvFound').hidden = true; return; }
  if (f.unreadable) { $('cvFound').hidden = false; $('cvFound').className = 'found warn-box'; $('cvFound').textContent = t('cvUnreadable'); return; }
  const parts = [];
  if (f.prenom) parts.push(t('fName'));
  if (f.email) parts.push(t('fEmail'));
  if (f.roles) parts.push(t('fRoles', { n: f.roles }));
  if (f.loc) parts.push(t('fLoc'));
  $('cvFound').className = 'found';
  $('cvFound').hidden = false;
  $('cvFound').textContent = parts.length ? t('cvFound', { list: parts.join(', ') }) + (f.years ? ' ' + t('fYears', { n: f.years }) + '.' : '') : t('cvNothing');
}
function renderPreview() {
  const first = data.roles[0] || (settings.lang === 'fr' ? 'Le poste que tu vises' : 'Your target job');
  const [lo, hi] = !data.salaire ? [45, 55] : data.salaire === '100+' ? [100, 120] : data.salaire.split('-').map(Number);
  const min = lo; const span = Math.max(5, hi - lo);
  const l0 = data.locations[0]; const nd = l0 && l0.startsWith('R:') ? (data.regionDepts[l0] || []) : [];
  const lieu = !l0 ? 'Île-de-France' : nd.length ? locLabel(nd[0]) : locLabel(l0);
  const tt = data.teletravail === 'remote' ? t('remoteTxt') : data.teletravail === 'onsite' ? t('onsiteTxt') : t('hybridTxt');
  $('mailSubject').textContent = t('subject', { d: nextSend().toLocaleDateString(locale(), { day: 'numeric', month: 'long' }) });
  $('mailHello').textContent = t('hello', { name: data.prenom || '' }).replace(/ ,/, ',');
  const offers = [
    { t: first, c: t('ex1c'), l: `${lieu}, ${tt}`, s: `${min + 2}–${min + span} k€`, m: 91, w: t('ex1w'), a: t('ex1a') },
    { t: data.roles[1] || first, c: t('ex2c'), l: `${lieu}, ${t('onsiteTxt')}`, s: `${min}–${min + Math.round(span / 2)} k€`, m: 86, w: t('ex2w'), a: t('ex2a') },
  ];
  const autos = SOURCES.filter((s) => s.auto && data.sources.includes(s.id));
  offers.forEach((o, k) => { o.src = autos.length ? srcName(autos[k % autos.length]) : ''; });
  const ul = $('offers'); ul.textContent = '';
  if (!autos.length) { const li = document.createElement('li'); li.className = 'small'; li.textContent = t('noAuto'); ul.appendChild(li); }
  (autos.length ? offers : []).forEach((o) => {
    const li = document.createElement('li'); li.className = 'offer';
    li.innerHTML = '<div class="offer-top"><b></b><span class="match"></span></div><div class="meta"></div><div class="why"></div><div class="warn"></div>';
    li.querySelector('b').textContent = o.t;
    li.querySelector('.match').textContent = o.m + ' %';
    li.querySelector('.meta').textContent = `${o.c} · ${o.l} · ${o.s} · ${o.src}`;
    li.querySelector('.why').textContent = t('why') + o.w;
    li.querySelector('.warn').textContent = t('warn') + o.a;
    ul.appendChild(li);
  });
  const linkSrc = SOURCES.filter((s) => !s.auto && data.sources.includes(s.id));
  $('linksBox').hidden = !linkSrc.length;
  $('linksBox').querySelector('.small').textContent = t('linksHelp', { d: t('dLabel' + data.since) });
  const row = $('links'); row.textContent = '';
  linkSrc.forEach((s) => {
    const a = document.createElement('a'); a.href = searchLink(s.id); a.target = '_blank'; a.rel = 'noopener';
    a.className = 'link-btn'; a.textContent = srcName(s) + ' ↗'; row.appendChild(a);
  });
}

/* ---------- events ---------- */
FIELDS.forEach((f) => $(f).addEventListener('input', () => { data[f] = $(f).value; save(); }));
FIELDS.forEach((f) => $(f).addEventListener('change', () => { data[f] = $(f).value; save(); if (data.active) renderPreview(); }));
$('consent').addEventListener('change', () => { data.consent = $('consent').checked; save(); });
$('cv').addEventListener('change', async () => {
  const f = $('cv').files && $('cv').files[0];
  if (!f) return;
  if (!/pdf$/i.test(f.type) && !/\.pdf$/i.test(f.name)) { $('cvErr').textContent = t('cvNotPdf'); $('cvErr').hidden = false; return; }
  $('cvErr').hidden = true;
  data.cvName = f.name; data.cvSize = f.size; save(); render();
  $('cvReading').hidden = false; $('cvFound').hidden = true;
  try {
    const lines = await pdfLines(f);
    if (lines.join('').length < 40) throw new Error('empty');
    const x = extract(lines);
    const found = { years: x.years };
    if (x.prenom && !data.prenom) { data.prenom = x.prenom; found.prenom = 1; }
    if (x.email && !data.email) { data.email = x.email; found.email = 1; }
    const strong = x.roles.filter((r) => r.strong).slice(0, 2);
    const pre = (strong.length ? strong : x.roles.slice(0, 1)).map((r) => r.label).filter((l) => !data.roles.includes(l));
    if (!data.roles.length && pre.length) { data.roles.push(...pre); found.roles = pre.length; }
    const reg = x.locations.filter((id) => id.startsWith('R:'));
    if (!data.locations.length && x.locations.length) { data.locations.push(reg[0] || x.locations[0]); found.loc = 1; }
    data.cvSugg = { roles: x.roles, locations: x.locations };
    data.cvFound = found;
  } catch (err) {
    data.cvSugg = null; data.cvFound = { unreadable: 1 };
  }
  $('cvReading').hidden = true; save(); render();
});
$('form').addEventListener('submit', (e) => {
  e.preventDefault();
  if ($('roleInput').value.trim()) addRole($('roleInput').value);
  const missing = [];
  if (!data.cvName) { $('cvErr').textContent = t('cvMissing'); $('cvErr').hidden = false; missing.push(t('mCv')); } else $('cvErr').hidden = true;
  if (!data.email || !/^\S+@\S+\.\S+$/.test(data.email)) missing.push(t('mEmail'));
  if (!data.roles.length) missing.push(t('mRoles'));
  if (!data.locations.length) missing.push(t('mLoc'));
  if (!data.sources.length) missing.push(t('mSources'));
  if (!$('consent').checked) missing.push(t('mConsent'));
  const err = $('formErr');
  if (missing.length) { err.textContent = t('missing', { list: missing.join(', ') }); err.hidden = false; err.scrollIntoView({ block: 'center', behavior: 'smooth' }); return; }
  err.hidden = true;
  data.active = true; data.activatedAt = new Date().toISOString(); save(); render();
  $('preview').scrollIntoView({ behavior: 'smooth', block: 'start' });
});
$('pause').addEventListener('click', () => { data.active = false; save(); render(); window.scrollTo({ top: 0, behavior: 'smooth' }); });
$('wipe').addEventListener('click', () => {
  try { localStorage.removeItem(KEY); } catch { /* ignore */ }
  data = { roles: [], locations: [], teletravail: 'hybrid', contrat: 'cdi', sources: ['francetravail', 'startups', 'linkedin', 'indeed', 'wttj', 'hellowork'], since: '3', excludeTags: [], regionDepts: {} };
  $('form').reset(); render(); $('wipeMsg').hidden = false; setTimeout(() => { $('wipeMsg').hidden = true; }, 3000);
});

/* ---------- settings ---------- */
const dlg = $('settings');
$('settingsBtn').addEventListener('click', () => {
  $('setLang').value = settings.lang; $('setFreq').value = settings.freq; $('setHour').value = settings.hour;
  $('setMax').value = settings.max; $('setTheme').value = settings.theme;
  if (dlg.showModal) dlg.showModal(); else dlg.setAttribute('open', '');
});
[['setLang', 'lang'], ['setFreq', 'freq'], ['setHour', 'hour'], ['setMax', 'max'], ['setTheme', 'theme']].forEach(([id, k]) => {
  $(id).addEventListener('change', () => { settings[k] = $(id).value; write(SKEY, settings); applyTheme(); applyLang(); render(); });
});
dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });

/* ---------- install ---------- */
let deferred = null;
const standalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); deferred = e; if (!standalone) $('installBtn').hidden = false; });
$('installBtn').addEventListener('click', async () => { if (!deferred) return; deferred.prompt(); await deferred.userChoice; deferred = null; $('installBtn').hidden = true; });
window.addEventListener('appinstalled', () => { $('installBtn').hidden = true; });
const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
if (isIOS && !standalone) $('iosHint').hidden = false;
if ('serviceWorker' in navigator) window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));

$('ver').textContent = 'v' + VERSION;
save(); applyTheme(); applyLang(); render();
