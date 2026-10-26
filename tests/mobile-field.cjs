const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const html=fs.readFileSync('index.html','utf8');const routing=html.match(/<script>([\s\S]*?)<\/script>/)[1];
for(const [width,coarse] of [[390,true],[430,true],[1024,true],[1440,false]])for(const desktop of [false,true]){
let redirected=false,desktopMode=false;const query=desktop?'?desktop=1':'';
vm.runInNewContext(routing,{screen:{width,height:844},matchMedia:()=>({matches:coarse}),location:{href:'https://suite.example/index.html'+query,search:query,replace:url=>{redirected=url.pathname==='/mobile.html'}},URL,URLSearchParams,document:{documentElement:{classList:{add(){desktopMode=true}}},getElementById:()=>({setAttribute(){}})}});
assert.equal(redirected,!desktop&&width<=600&&coarse);assert.equal(desktopMode,desktop);
}
assert.match(fs.readFileSync('manifest-desktop.webmanifest','utf8'),/index\.html\?desktop=1/);
assert.match(fs.readFileSync('mobile.html','utf8'),/href="\.\/index\.html\?desktop=1"/);
const src=fs.readFileSync('mobile.js','utf8');const nodes={mServiceSearch:{value:''},mServiceList:{innerHTML:''}};const context={document:{getElementById:id=>nodes[id]},state:{services:[{id:'1',clientId:'c',title:'<script>bad</script>',date:'2026-10-22',status:'Pendiente'},{id:'2',title:'Finished',status:'Completado'}],clients:[{id:'c',name:'Cliente A',phone:'7875550100',address:'San Juan & PR'}]}};
vm.createContext(context);vm.runInContext(src.slice(src.indexOf('const $ ='),src.indexOf('const money ='))+src.slice(src.indexOf('const esc ='),src.indexOf('const today ='))+src.slice(src.indexOf('function clientBy('),src.indexOf('function taxRate('))+src.slice(src.indexOf('function statusBadge('),src.indexOf('function sorted('))+src.slice(src.indexOf('function phoneLink('),src.indexOf('function isStandalone('))+src.slice(src.indexOf('function renderServices(){'),src.indexOf("$('mServiceSearch')?.addEventListener")),context);
vm.runInContext('renderServices()',context);assert.match(nodes.mServiceList.innerHTML,/&lt;script&gt;/);assert.doesNotMatch(nodes.mServiceList.innerHTML,/Finished/);assert.match(nodes.mServiceList.innerHTML,/tel:7875550100/);assert.match(nodes.mServiceList.innerHTML,/San%20Juan%20%26%20PR/);nodes.mServiceSearch.value='absent';vm.runInContext('renderServices()',context);assert.match(nodes.mServiceList.innerHTML,/No hay trabajos/);
console.log('PASS phone routing, desktop preservation, pending service filtering, search, escaped content, call and map links');
