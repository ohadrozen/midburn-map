// Offline support for the Midburn map page: the page itself and its files are cached on install;
// satellite tiles are served cache-first from the 'tiles-v1' cache that the page fills on demand.
const APP='app-v9', TILES='tiles-v1';
const APP_FILES=['./','index.html','manifest.json','icon-192.png','icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(APP).then(c=>c.addAll(APP_FILES)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==APP&&k!==TILES).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const u=new URL(e.request.url);
  if(u.pathname.endsWith('tag.json')) return; // the page handles its own fallback
  if(u.hostname==='server.arcgisonline.com'){
    e.respondWith(caches.open(TILES).then(async c=>{const hit=await c.match(e.request.url);if(hit)return hit;const r=await fetch(e.request);if(r.ok)c.put(e.request.url,r.clone());return r}));return}
  if(u.origin===location.origin){
    e.respondWith(fetch(e.request).then(r=>{if(r.ok)caches.open(APP).then(c=>c.put(e.request,r.clone()));return r}).catch(()=>caches.match(e.request,{ignoreSearch:true}).then(h=>h||caches.match('index.html'))))}
});
