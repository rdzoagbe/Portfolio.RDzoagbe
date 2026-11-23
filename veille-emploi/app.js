const VERSION = '0.1.0';
const KEY = 've:data';
const $ = (id) => document.getElementById(id);
const FIELDS = ['prenom', 'email', 'postes', 'salaire', 'lieu', 'teletravail', 'contrat', 'exclure'];

function load() { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; } }
function save(d) { try { localStorage.setItem(KEY, JSON.stringify(d)); } catch { /* storage unavailable */ } }

let data = load();

function nextSend(from = new Date()) {
  const d = new Date(from);
  d.setHours(7, 45, 0, 0);
  if (d <= from) d.setDate(d.getDate() + 1);
  return d;
}
const fmtDate = (d) => d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }) + ' à 7 h 45';

function render() {
  FIELDS.forEach((f) => { if (data[f] !== undefined) $(f).value = data[f]; });
  $('consent').checked = !!data.consent;
  if (data.cvName) {
    $('fileRow').hidden = false; $('fileEmpty').hidden = true;
    $('fileName').textContent = data.cvName; $('cvLabel').textContent = 'Remplacer mon CV';
  } else {
    $('fileRow').hidden = true; $('fileEmpty').hidden = false; $('cvLabel').textContent = 'Choisir mon CV';
  }
  const on = !!data.active;
  $('statusOn').hidden = !on; $('statusOff').hidden = on;
  $('pause').hidden = !on;
  $('activate').textContent = on ? 'Mettre à jour mes alertes' : 'Activer mes alertes';
  if (on) {
    $('nextDate').textContent = fmtDate(nextSend());
    $('sentTo').textContent = data.email || '—';
    renderPreview();
  }
  $('preview').hidden = !on;
}

function renderPreview() {
  const first = (data.postes || 'le poste que tu vises').split(',')[0].trim();
  const min = parseInt(String(data.salaire || '').replace(/\D/g, ''), 10) || 45;
  const lieu = data.lieu || 'Île-de-France';
  const tt = (data.teletravail || '').startsWith('Télétravail complet') ? 'télétravail complet' : 'hybride, 2 j de télétravail';
  const n = nextSend();
  $('mailSubject').textContent = 'Nouvelles offres à postuler – ' + n.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });
  $('mailHello').textContent = `Bonjour ${data.prenom || ''}, voici 2 nouvelles offres qui correspondent à ton CV. Postule dans les 48 heures.`.replace('Bonjour ,', 'Bonjour,');
  const offers = [
    { t: first, c: 'Scale-up (exemple)', l: `${lieu}, ${tt}`, s: `${min + 3}–${min + 10} k€`, m: 91,
      why: `Ton expérience correspond aux missions principales du poste de ${first}.`, warn: 'Anglais courant demandé' },
    { t: first, c: 'PME en croissance (exemple)', l: `${lieu}, sur site 3 j`, s: `${min}–${min + 5} k€`, m: 86,
      why: 'Ton parcours couvre la plupart des compétences attendues.', warn: 'Secteur nouveau pour toi' },
  ];
  const ul = $('offers'); ul.textContent = '';
  offers.forEach((o) => {
    const li = document.createElement('li'); li.className = 'offer';
    li.innerHTML = `<div class="offer-top"><b></b><span class="match"></span></div><div class="meta"></div><div class="why"></div><div class="warn"></div>`;
    li.querySelector('b').textContent = o.t;
    li.querySelector('.match').textContent = o.m + ' %';
    li.querySelector('.meta').textContent = `${o.c} · ${o.l} · ${o.s}`;
    li.querySelector('.why').textContent = 'Pourquoi : ' + o.why;
    li.querySelector('.warn').textContent = 'Point d\'attention : ' + o.warn;
    ul.appendChild(li);
  });
}

FIELDS.forEach((f) => $(f).addEventListener('input', () => { data[f] = $(f).value; save(data); }));
$('consent').addEventListener('change', () => { data.consent = $('consent').checked; save(data); });
$('cv').addEventListener('change', () => {
  const f = $('cv').files && $('cv').files[0];
  if (!f) return;
  if (!/pdf$/i.test(f.type) && !/\.pdf$/i.test(f.name)) { $('cvErr').textContent = 'Ce fichier n\'est pas un PDF. Choisis ton CV au format PDF.'; $('cvErr').hidden = false; return; }
  data.cvName = f.name; data.cvSize = f.size; save(data); $('cvErr').hidden = true; render();
});

$('form').addEventListener('submit', (e) => {
  e.preventDefault();
  const missing = [];
  if (!data.cvName) { $('cvErr').hidden = false; missing.push('CV'); } else $('cvErr').hidden = true;
  if (!data.email || !/^\S+@\S+\.\S+$/.test(data.email)) missing.push('un email valide');
  if (!data.postes) missing.push('les postes visés');
  if (!$('consent').checked) missing.push('ton accord (case à cocher)');
  const err = $('formErr');
  if (missing.length) { err.textContent = 'Il manque : ' + missing.join(', ') + '.'; err.hidden = false; err.scrollIntoView({ block: 'center', behavior: 'smooth' }); return; }
  err.hidden = true;
  data.active = true; data.activatedAt = new Date().toISOString(); save(data); render();
  $('preview').scrollIntoView({ behavior: 'smooth', block: 'start' });
});
$('pause').addEventListener('click', () => { data.active = false; save(data); render(); window.scrollTo({ top: 0, behavior: 'smooth' }); });
$('wipe').addEventListener('click', () => {
  try { localStorage.removeItem(KEY); } catch { /* ignore */ }
  data = {}; $('form').reset(); render(); $('wipeMsg').hidden = false; setTimeout(() => { $('wipeMsg').hidden = true; }, 3000);
});

// Install
let deferred = null;
const standalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); deferred = e; if (!standalone) $('installBtn').hidden = false; });
$('installBtn').addEventListener('click', async () => { if (!deferred) return; deferred.prompt(); await deferred.userChoice; deferred = null; $('installBtn').hidden = true; });
window.addEventListener('appinstalled', () => { $('installBtn').hidden = true; });
const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
if (isIOS && !standalone) $('iosHint').hidden = false;

if ('serviceWorker' in navigator) window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
$('ver').textContent = 'v' + VERSION;
render();
