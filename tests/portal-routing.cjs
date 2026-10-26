const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
for(const page of ['index.html','mobile.html']){
  const scripts=[...fs.readFileSync(page,'utf8').matchAll(/<script>([\s\S]*?)<\/script>/g)].map(x=>x[1]);
  const routing=scripts.find(x=>x.includes("incoming.searchParams.has('access')"));assert.ok(routing);
  for(const width of [390,1440])for(const key of ['access','token']){
    let destination;const query=`?${key}=PRIVATE-CODE&document=invoice%3Ai1`;
    vm.runInNewContext(routing,{URL,URLSearchParams,screen:{width,height:844},matchMedia:()=>({matches:true}),location:{href:`https://suite.example/${page}${query}`,search:query,replace:url=>destination=url},document:{documentElement:{classList:{add(){}}}}});
    assert.equal(destination.pathname,'/portal/');assert.equal(destination.searchParams.get(key),'PRIVATE-CODE');assert.equal(destination.searchParams.get('document'),'invoice:i1');
  }
}
// Unsaved invoice previews must not reference a saved invoice or a nonexistent portal link.
const mobile=fs.readFileSync('mobile.js','utf8');
const preview=mobile.slice(mobile.indexOf('async function shareCurrentDoc(){'),mobile.indexOf('// Read the shared service records'));
assert.doesNotMatch(preview,/portalLink|inv\.id/);
console.log('PASS: private codes and selected document preserved on phone and desktop; preview sharing remains valid.');
