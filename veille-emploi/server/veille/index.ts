// Veille Emploi edge function: email alerts.
//   POST {action:'subscribe', email, prefs, token?}  -> confirmation email (or direct update with a valid token)
//   POST {action:'pause', token}                      -> pause alerts
//   POST {action:'status', token}                     -> current state
//   POST {action:'run'} + x-cron-secret header        -> send due alerts (called by pg_cron every 15 min)
//   GET  ?a=confirm&t=TOKEN | ?a=stop&t=TOKEN         -> links in emails, then back to the app
import { createClient } from 'npm:@supabase/supabase-js@2.49.4';
import nodemailer from 'npm:nodemailer@6.9.16';
import {
  APP_URL, alertEmail, cleanPrefs, confirmEmail, fetchFranceTravail, fetchStartups, franceTravailToken, selectOffers, validEmail,
} from './core.js';

const SB_URL = Deno.env.get('SUPABASE_URL')!;
const serviceKey = (() => {
  const k = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (k) return k;
  try { return JSON.parse(Deno.env.get('SUPABASE_SECRET_KEYS') || '{}').default; } catch { return ''; }
})();
const db = createClient(SB_URL, serviceKey, { auth: { persistSession: false } });
const FN_URL = `${SB_URL}/functions/v1/veille`;
const GMAIL_USER = (Deno.env.get('GMAIL_USER') || '').trim();
const GMAIL_PASS = (Deno.env.get('GMAIL_APP_PASSWORD') || '').replace(/\s+/g, '');
const FT_ID = Deno.env.get('FT_CLIENT_ID') || '';
const FT_SECRET = Deno.env.get('FT_CLIENT_SECRET') || '';

const CORS = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'POST, GET, OPTIONS',
  'access-control-allow-headers': 'content-type, authorization, apikey, x-client-info',
};
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...CORS, 'content-type': 'application/json' } });
const back = (hash: string) => new Response(null, { status: 302, headers: { location: `${APP_URL}#${hash}` } });

let transport: ReturnType<typeof nodemailer.createTransport> | null = null;
async function sendMail(to: string, m: { subject: string; html: string; text: string }) {
  if (!GMAIL_USER || !GMAIL_PASS) throw new Error('Gmail secrets missing');
  transport ??= nodemailer.createTransport({ host: 'smtp.gmail.com', port: 465, secure: true, auth: { user: GMAIL_USER, pass: GMAIL_PASS } });
  await transport.sendMail({ from: `"Veille Emploi" <${GMAIL_USER}>`, to, subject: m.subject, html: m.html, text: m.text });
}

async function nextRun(hour: string, daysAhead: number) {
  const from = new Date(Date.now() + Math.max(0, daysAhead) * 86400000).toISOString();
  const { data, error } = await db.rpc('next_run', { hhmm: hour, from_ts: from });
  if (error) throw error;
  return data as string;
}

/* ---------- sending one alert ---------- */
type Sub = { id: string; email: string; token: string; status: string; prefs: Record<string, unknown>; next_run_at: string | null };
let startupCache: Promise<{ jobs: unknown[]; errors: string[] }> | null = null;
let ftToken: Promise<string> | null = null;

async function sendAlert(sub: Sub, first = false) {
  const prefs = cleanPrefs(sub.prefs);
  const sources = prefs.sources;
  const jobs: unknown[] = [];
  const errors: string[] = [];
  if (sources.includes('startups')) {
    startupCache ??= fetchStartups();
    const r = await startupCache; jobs.push(...r.jobs); errors.push(...r.errors);
  }
  const ftOn = !!(FT_ID && FT_SECRET);
  if (sources.includes('francetravail') && ftOn) {
    try { ftToken ??= franceTravailToken(FT_ID, FT_SECRET); jobs.push(...await fetchFranceTravail(await ftToken, prefs)); }
    catch (e) { errors.push('francetravail: ' + (e as Error).message); ftToken = null; }
  }
  const { data: seenRows } = await db.from('sent_offers').select('offer_key').eq('sub_id', sub.id)
    .gte('sent_at', new Date(Date.now() - 90 * 86400000).toISOString());
  const seen = new Set((seenRows || []).map((r) => r.offer_key));
  const offers = selectOffers(jobs, prefs, seen);
  const next = await nextRun(prefs.hour, Number(prefs.freq) - 1);
  const mail = alertEmail(prefs, offers, { stopUrl: `${FN_URL}?a=stop&t=${sub.token}`, nextRun: next, first, ftLink: sources.includes('francetravail') && !ftOn });
  let err: string | null = null;
  try { await sendMail(sub.email, mail); } catch (e) { err = (e as Error).message; }
  if (!err && offers.length) {
    await db.from('sent_offers').upsert(offers.flatMap((o: { id: string; key: string }) => [{ sub_id: sub.id, offer_key: o.id }, { sub_id: sub.id, offer_key: o.key }]), { onConflict: 'sub_id,offer_key', ignoreDuplicates: true });
  }
  await db.from('send_log').insert({ sub_id: sub.id, kind: 'alert', offers: offers.length, error: err || (errors.length ? errors.join('; ').slice(0, 900) : null) });
  await db.from('subscriptions').update({
    next_run_at: err ? new Date(Date.now() + 3600000).toISOString() : next,
    last_sent_at: err ? undefined : new Date().toISOString(), last_error: err, updated_at: new Date().toISOString(),
  }).eq('id', sub.id);
  return { offers: offers.length, error: err, sourceErrors: errors };
}

async function runDue() {
  const { data: due, error } = await db.from('subscriptions').select('id,email,token,status,prefs,next_run_at')
    .eq('status', 'active').lte('next_run_at', new Date().toISOString()).order('next_run_at').limit(25);
  if (error) throw error;
  const results = [];
  for (const s of due || []) results.push({ id: s.id, ...(await sendAlert(s as Sub)) });
  return results;
}

/* ---------- handlers ---------- */
async function subscribe(body: Record<string, unknown>) {
  const email = String(body.email || '').trim().toLowerCase();
  if (!validEmail(email)) return json({ error: 'bad_email' }, 400);
  const prefs = cleanPrefs((body.prefs || {}) as Record<string, unknown>);
  if (!prefs.roles.length || !prefs.locations.length || !prefs.sources.length) return json({ error: 'missing_fields' }, 400);
  const { data: inv } = await db.from('invites').select('email').eq('email', email).maybeSingle();
  if (!inv) return json({ error: 'not_invited' }, 403);
  const { data: sub } = await db.from('subscriptions').select('*').eq('email', email).maybeSingle();

  // Same device (it holds the token): apply the change straight away.
  if (sub && body.token && body.token === sub.token && sub.confirmed_at) {
    const old = cleanPrefs(sub.prefs);
    const keep = sub.status === 'active' && sub.next_run_at && old.hour === prefs.hour && old.freq === prefs.freq;
    const next = keep ? sub.next_run_at : await nextRun(prefs.hour, 0);
    await db.from('subscriptions').update({ prefs, pending_prefs: null, status: 'active', next_run_at: next, updated_at: new Date().toISOString() }).eq('id', sub.id);
    return json({ ok: true, status: 'active', next_run_at: next });
  }

  if (sub?.confirm_sent_at && Date.now() - Date.parse(sub.confirm_sent_at) < 60000) return json({ error: 'wait' }, 429);
  const { count } = await db.from('send_log').select('id', { count: 'exact', head: true })
    .eq('kind', 'confirm').gte('sent_at', new Date(Date.now() - 86400000).toISOString()).eq('sub_id', sub?.id || '00000000-0000-0000-0000-000000000000');
  if ((count || 0) >= 6) return json({ error: 'wait' }, 429);

  let row = sub;
  if (!row) {
    const { data, error } = await db.from('subscriptions').insert({ email, pending_prefs: prefs, confirm_sent_at: new Date().toISOString() }).select('*').single();
    if (error) throw error; row = data;
  } else {
    await db.from('subscriptions').update({ pending_prefs: prefs, confirm_sent_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq('id', row.id);
  }
  try {
    await sendMail(email, confirmEmail(prefs, `${FN_URL}?a=confirm&t=${row.token}`));
  } catch (e) {
    await db.from('send_log').insert({ sub_id: row.id, kind: 'confirm', error: (e as Error).message });
    return json({ error: 'mail_failed' }, 502);
  }
  await db.from('send_log').insert({ sub_id: row.id, kind: 'confirm' });
  return json({ ok: true, status: 'confirm_sent' });
}

async function byToken(t: string | null) {
  if (!t || !/^[0-9a-f-]{36}$/i.test(t)) return null;
  const { data } = await db.from('subscriptions').select('*').eq('token', t).maybeSingle();
  return data;
}

async function confirm(t: string | null) {
  const sub = await byToken(t);
  if (!sub) return back('ve=invalid');
  const prefs = cleanPrefs(sub.pending_prefs || sub.prefs);
  const fresh = sub.status !== 'active' || !!sub.pending_prefs;
  const next = fresh ? await nextRun(prefs.hour, Number(prefs.freq) - 1) : sub.next_run_at;
  await db.from('subscriptions').update({
    prefs, pending_prefs: null, status: 'active', next_run_at: next, confirmed_at: sub.confirmed_at || new Date().toISOString(), updated_at: new Date().toISOString(),
  }).eq('id', sub.id);
  if (fresh) {
    // First email right away: it confirms the alerts are on and brings today's offers.
    // @ts-ignore EdgeRuntime exists on Supabase
    EdgeRuntime.waitUntil(sendAlert({ ...sub, prefs, status: 'active' } as Sub, true).catch((e) => console.error('first alert', e)));
  }
  return back(`ve=confirmed&t=${sub.token}&e=${encodeURIComponent(sub.email)}`);
}

Deno.serve(async (req) => {
  try {
    if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
    const url = new URL(req.url);
    if (req.method === 'GET') {
      const a = url.searchParams.get('a'); const t = url.searchParams.get('t');
      if (a === 'confirm') return await confirm(t);
      if (a === 'stop') {
        const sub = await byToken(t);
        if (!sub) return back('ve=invalid');
        await db.from('subscriptions').update({ status: 'paused', updated_at: new Date().toISOString() }).eq('id', sub.id);
        return back('ve=stopped');
      }
      return json({ ok: true, service: 'veille' });
    }
    if (req.method !== 'POST') return json({ error: 'method' }, 405);
    const body = await req.json().catch(() => ({}));
    switch (body.action) {
      case 'subscribe': return await subscribe(body);
      case 'pause': {
        const sub = await byToken(body.token);
        if (!sub) return json({ error: 'invalid' }, 404);
        await db.from('subscriptions').update({ status: 'paused', updated_at: new Date().toISOString() }).eq('id', sub.id);
        return json({ ok: true, status: 'paused' });
      }
      case 'status': {
        const sub = await byToken(body.token);
        if (!sub) return json({ error: 'invalid' }, 404);
        return json({ ok: true, status: sub.status, email: sub.email, next_run_at: sub.next_run_at, last_sent_at: sub.last_sent_at, pending: !!sub.pending_prefs });
      }
      case 'run': {
        const { data: ok } = await db.rpc('cron_secret_ok', { s: req.headers.get('x-cron-secret') || '' });
        if (!ok) return json({ error: 'forbidden' }, 403);
        if (body.wait) { const results = await runDue(); return json({ ok: true, sent: results.length, results }); }
        // @ts-ignore EdgeRuntime exists on Supabase
        EdgeRuntime.waitUntil(runDue().then((r) => console.log('run', JSON.stringify(r))).catch((e) => console.error('run', e)));
        return json({ ok: true, started: true }, 202);
      }
      default: return json({ error: 'unknown_action' }, 400);
    }
  } catch (e) {
    console.error(e);
    return json({ error: 'server', message: (e as Error).message }, 500);
  }
});
