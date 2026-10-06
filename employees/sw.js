const CACHE='nexus-employee-v1';
const SHELL=['./','./employee.css?v=1','./employee.js?v=1','./manifest.webmanifest','./icon.svg','./icon-192.png','./icon-512.png','../employee-security.js','../firebase-config.js'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)));self.skipWaiting();});
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('nexus-employee-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
 const u=new URL(e.request.url);if(e.request.method!=='GET'||u.origin!==location.origin)return;
 if(e.request.mode==='navigate'){e.respondWith(fetch(e.request).catch(()=>caches.match('./')));return;}
 if(SHELL.some(path=>new URL(path,self.registration.scope).href===u.href))e.respondWith(fetch(e.request).then(res=>{if(res.ok)caches.open(CACHE).then(c=>c.put(e.request,res.clone()));return res;}).catch(()=>caches.match(e.request)));
});
