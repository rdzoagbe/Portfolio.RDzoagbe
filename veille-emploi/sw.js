// The app moved to https://rdzoagbe.github.io/veille-emploi/ — this worker removes the old one and reloads the page,
// which then redirects to the new address.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil((async () => {
  await self.registration.unregister();
  for (const c of await self.clients.matchAll({ type: 'window' })) c.navigate(c.url);
})()));
