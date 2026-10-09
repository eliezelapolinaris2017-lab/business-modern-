const CACHE='nexus-employee-v2';
const SHELL=['./','./employee.css?v=2','./employee.js?v=2','./manifest.webmanifest','./icon.svg','./icon-192.png','./icon-512.png','../employee-security.js','../firebase-config.js'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)));self.skipWaiting();});
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('nexus-employee-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
 const u=new URL(e.request.url);if(e.request.method!=='GET'||u.origin!==location.origin)return;
 if(u.pathname===new URL('./manifest.webmanifest',self.registration.scope).pathname&&/^[a-f0-9]{48}$/.test(u.searchParams.get('access'))&&/^[a-f0-9]{48}$/.test(u.searchParams.get('key'))){
 const launch=new URL('./',self.registration.scope);launch.searchParams.set('access',u.searchParams.get('access'));launch.searchParams.set('key',u.searchParams.get('key'));
 const manifest={id:launch.pathname+'?access='+u.searchParams.get('access'),name:'Mis órdenes de trabajo',short_name:'Mis órdenes',start_url:launch.href,scope:self.registration.scope,display:'standalone',background_color:'#edf2f7',theme_color:'#0f172a',icons:[192,512].map(size=>({src:new URL('./icon-'+size+'.png',self.registration.scope).href,sizes:size+'x'+size,type:'image/png'}))};
 e.respondWith(new Response(JSON.stringify(manifest),{headers:{'Content-Type':'application/manifest+json','Cache-Control':'no-store'}}));return;
 }
 if(e.request.mode==='navigate'){e.respondWith(fetch(e.request).catch(()=>caches.match('./')));return;}
 if(SHELL.some(path=>new URL(path,self.registration.scope).href===u.href))e.respondWith(fetch(e.request).then(res=>{if(res.ok)caches.open(CACHE).then(c=>c.put(e.request,res.clone()));return res;}).catch(()=>caches.match(e.request)));
});
