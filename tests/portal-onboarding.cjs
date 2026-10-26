const {JSDOM}=require('jsdom'),fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
const source=fs.readFileSync(require('node:path').join(__dirname,'../portal-account.js'),'utf8').replace(/^import .*;\n/gm,'').replaceAll('export function','function');
const tick=()=>new Promise(r=>setImmediate(r));
async function setup(user,{linked=false,mailFailure=false,readFailure=false}={}){
 const dom=new JSDOM('<div id="portalLogin"><div class="login-card"><div class="brand-mark"></div><details id="legacyAccess"></details><small id="loginMsg"></small></div></div><div id="portalApp" class="hidden"><div class="header-actions"></div></div>',{url:'https://example.test/portal/?access=INVITE'});
 const auth={currentUser:user},counts={sms:0,writes:0,opens:0};let observer;
 const context={console,URLSearchParams,Promise,setTimeout,clearTimeout,document:dom.window.document,window:dom.window,location:dom.window.location,sessionStorage:dom.window.sessionStorage,localStorage:dom.window.localStorage,
 getAuth:()=>auth,normalizePortalPhone:v=>'+1'+String(v).replace(/\D/g,''),doc:(_, ...parts)=>parts.join('/'),getDoc:async ref=>{if(readFailure)throw Object.assign(Error(),{code:'unavailable'});return ref.startsWith('clientAccounts')?{exists:()=>linked,data:()=>({portalToken:'INVITE'})}:{exists:()=>true,data:()=>({enabled:true,ownerId:'owner',client:{id:'c1'},identityPhone:auth.currentUser.phoneNumber,identityEmail:auth.currentUser.email})};},
 writeBatch:()=>({set(){},update(){},async commit(){counts.writes++;linked=true;}}),serverTimestamp:()=>0,
 onAuthStateChanged:(_,cb)=>{observer=cb;return ()=>{};},signOut:async()=>{auth.currentUser=null;},sendEmailVerification:async()=>{if(mailFailure)throw Object.assign(Error(),{code:'auth/network-request-failed'});},sendPasswordResetEmail:async()=>{},createUserWithEmailAndPassword:async(_,email)=>{auth.currentUser={uid:'u1',email,emailVerified:false,phoneNumber:null,reload:async()=>{},getIdToken:async()=>{}};},signInWithEmailAndPassword:async()=>{},RecaptchaVerifier:class{clear(){}},linkWithPhoneNumber:async()=>{counts.sms++;return {confirm:async()=>{auth.currentUser.phoneNumber='+17875551234';}};}};
 vm.createContext(context);vm.runInContext(source,context);context.mountClientAccount({app:{},db:{},openPortal:async()=>{counts.opens++;}});observer(user);await tick();await tick();
 const q=s=>dom.window.document.querySelector(s);const click=async action=>{q(`[data-action="${action}"]`).click();await tick();await tick();};const submit=async()=>{const form=q('.account-wizard form');form.onsubmit({preventDefault(){},target:form});await tick();await tick();};
 return {q,click,submit,counts,auth,dom};
}
(async()=>{
 assert.equal(vm.runInNewContext(source+';accountStage({emailVerified:true,phoneNumber:null})',{console}),'phone');
 let user={uid:'u1',email:'client@example.com',emailVerified:true,phoneNumber:null,reload:async()=>{},getIdToken:async()=>{}};
 let h=await setup(user);assert.match(h.q('h1').textContent,/Confirma tu teléfono/);assert.equal(h.q('input[name=email]'),null);assert.equal(h.q('input[name=password]'),null);assert.equal(h.q('#legacyAccess').hidden,true);assert.equal(h.counts.sms,0);
 h.q('input[name=phone]').value='7875551234';await h.submit();assert.match(h.q('h1').textContent,/Escribe el código/);assert.equal(h.q('input[name=phone]'),null);h.q('input[name=code]').value='123456';await h.submit();assert.equal(h.counts.writes,1);assert.equal(h.counts.opens,1);assert.equal(h.counts.sms,1);
 h=await setup({...user,phoneNumber:'+17875551234'},{linked:true});assert.equal(h.counts.opens,1);assert.equal(h.counts.writes,0);
 h=await setup(null,{mailFailure:true});await h.click('register');h.q('input[name=email]').value='client@example.com';h.q('input[name=phone]').value='7875551234';h.q('input[name=password]').value='test-password-123';await h.submit();assert.match(h.q('h1').textContent,/Revisa tu correo/);assert.equal(h.q('input[name=password]'),null);assert.match(h.q('[role=status]').textContent,/conectarnos/);assert.equal(h.q('input[name=code]'),null);
 h=await setup(user,{readFailure:true});assert.match(h.q('h1').textContent,/intentarlo de nuevo/);assert.equal(h.q('button[data-action=resume]').disabled,false);
 console.log('PASS: verified-email resume skips registration; one step per screen; no automatic SMS; SMS confirmation links and opens; existing linkage is reused; partial registration survives mail failure; network errors expose retry.');
})().catch(e=>{console.error(e);process.exitCode=1;});
