const CACHE='nexus-client-portal-v1';
const CORE=['./','./manifest.webmanifest','../portal.css?v=79','../portal.js?v=79','../firebase-config.js','../assets/logo.png'];
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