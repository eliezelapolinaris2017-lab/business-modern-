const CACHE='nexus-client-portal-v123';
const CORE=['./','./manifest.webmanifest','../portal.css?v=123-payments','../portal.js?v=123-payments','../portal-account.js?v=119-onboarding','../portal-payments.js?v=123','../firebase-config.js','./icons/oasis-180.png','./icons/oasis-192.png','./icons/oasis-512.png','./icons/oasis-maskable-512.png'];
self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE).catch(()=>{})));
  self.skipWaiting();
});
self.addEventListener('activate',event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('nexus-client-portal-')&&k!==CACHE).map(k=>caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch',event=>{
  const req=event.request;
  if(req.method!=='GET') return;
  const url=new URL(req.url);
  if(req.mode==='navigate'){
    event.respondWith(fetch(req).catch(()=>caches.match('./')));
    return;
  }
  if(url.origin===location.origin){
    event.respondWith(fetch(req).then(res=>{
      const copy=res.clone(); caches.open(CACHE).then(c=>c.put(req,copy)).catch(()=>{});
      return res;
    }).catch(()=>caches.match(req)));
  }
});