const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const handlers={},scope='https://suite.nexustoolspr.com/employees/';
const context={URL,Response,location:new URL(scope),self:{registration:{scope},addEventListener:(type,fn)=>handlers[type]=fn}};
vm.runInNewContext(fs.readFileSync('employees/sw.js','utf8'),context);
(async()=>{
 const access='a'.repeat(48),key='b'.repeat(48);let response;
 handlers.fetch({request:{method:'GET',url:scope+'manifest.webmanifest?access='+access+'&key='+key},respondWith:r=>response=r});
 const manifest=await response.json(),launch=new URL(manifest.start_url);
 assert.equal(launch.searchParams.get('access'),access);assert.equal(launch.searchParams.get('key'),key);assert.equal(launch.searchParams.has('pin'),false);assert.equal(launch.searchParams.has('order'),false);assert.equal(manifest.scope,scope);assert.equal(response.headers.get('Cache-Control'),'no-store');
 console.log('PASS: personalized installed launch preserves access without PIN or a stale order; manifest is not cached.');
})();
const staticManifest=JSON.parse(fs.readFileSync('employees/manifest.webmanifest','utf8'));
assert.equal('start_url' in staticManifest,false,'Without service worker interception, installation must default to the personal document URL.');
const script=fs.readFileSync('employees/employee.js','utf8');
function boot(href,stored){const store=new Map(stored?[['nexusEmployeeAccess',JSON.stringify(stored)]]:[]),location={href},history={replaceState:(_,__,next)=>location.href=next};const accessCode=script.slice(script.indexOf('const url=new URL'),script.indexOf('let key,data'));vm.runInNewContext(accessCode,{URL,location,history,localStorage:{getItem:k=>store.get(k),setItem:(k,v)=>store.set(k,v)}});return {location,store};}
const id='c'.repeat(48),secret='d'.repeat(48),legacy=boot(scope+'?access='+id+'#'+secret);
assert.equal(new URL(legacy.location.href).searchParams.get('key'),secret);
assert.deepEqual(JSON.parse(legacy.store.get('nexusEmployeeAccess')),{id,secret});
const fresh=boot(legacy.location.href);assert.equal(JSON.parse(fresh.store.get('nexusEmployeeAccess')).id,id);
const restored=boot(scope,{id,secret});assert.equal(new URL(restored.location.href).searchParams.get('key'),secret);
const invalid=boot(scope,{id:'bad',secret});assert.equal(invalid.location.href,scope);
console.log('PASS: legacy fragment links, fresh iPhone app storage, saved identity, invalid access rejection, static manifest fallback.');
