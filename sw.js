const CACHE='nexus-business-mobile-v65';
const ASSETS=['./mobile.html','./mobile.css','./mobile.js','./firebase-config.js','./manifest.webmanifest','./assets/logo.png'];
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS).catch(()=>{})));});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));self.clients.claim();});
self.addEventListener('message',event=>{if(event.data&&event.data.type==='SKIP_WAITING') self.skipWaiting();});
self.addEventListener('fetch',event=>{
  const req=event.request;
  if(req.method!=='GET') return;
  const url=new URL(req.url);
  if(url.origin!==location.origin){event.respondWith(fetch(req).catch(()=>caches.match(req)));return;}
  event.respondWith(fetch(req).then(res=>{const copy=res.clone();caches.open(CACHE).then(c=>c.put(req,copy)).catch(()=>{});return res;}).catch(()=>caches.match(req).then(res=>res||caches.match('./mobile.html'))));
});
