import {initializeTestEnvironment,assertFails,assertSucceeds} from '@firebase/rules-unit-testing';
import {doc,setDoc,getDoc,getDocs,collection,writeBatch,serverTimestamp,Timestamp} from 'firebase/firestore';
import fs from 'node:fs';
const env=await initializeTestEnvironment({projectId:'demo-oasis',firestore:{host:process.env.FIRESTORE_EMULATOR_HOST?.split(':')[0]||'127.0.0.1',port:Number(process.env.FIRESTORE_EMULATOR_HOST?.split(':')[1]||8089),rules:fs.readFileSync(new URL('../firestore.rules',import.meta.url),'utf8')}});
const ctx=(uid,extra={})=>env.authenticatedContext(uid,{email:'customer@example.com',email_verified:true,phone_number:'+17875551234',...extra}).firestore();
const anon=env.unauthenticatedContext().firestore();
const portal={ownerId:'business',token:'INVITE',enabled:true,identityPhone:'+17875551234',identityEmail:'customer@example.com',client:{id:'c1'},contractRevisions:{ct1:null,ct2:null,ct3:null},quoteRevisions:{q1:null},quoteExpires:{q1:Timestamp.fromDate(new Date('2099-01-01'))}};
await env.withSecurityRulesDisabled(async c=>{const db=c.firestore();await setDoc(doc(db,'clientPortals/INVITE'),portal);await setDoc(doc(db,'users/business/quotes/q1'),{status:'Pendiente',updatedAt:null});
 for(const [id,clientId,updatedAt] of [['ct1','c1',null],['ct2','c2',null],['ct3','c1',Timestamp.now()]]){
  await setDoc(doc(db,'users/business/contracts/'+id),{clientId,updatedAt,body:'Términos',status:'Registrado'});
 }
});
const claim=db=>{const b=writeBatch(db);b.set(doc(db,'clientAccounts/customer'),{portalToken:'INVITE',ownerId:'business',clientId:'c1',createdAt:serverTimestamp()});b.update(doc(db,'clientPortals/INVITE'),{claimedBy:'customer'});return b.commit();};
try{
 await assertFails(getDocs(collection(anon,'clientPortals')));
 await assertSucceeds(getDoc(doc(anon,'clientPortals/INVITE')));
 await assertFails(claim(ctx('customer',{email_verified:false})));
 await assertFails(claim(ctx('customer',{phone_number:'+17875559999'})));
 await assertFails(claim(ctx('customer',{email:'different@example.com'})));
 const customer=ctx('customer');
 await assertFails(setDoc(doc(customer,'clientAccounts/customer'),{portalToken:'INVITE',ownerId:'business',clientId:'c1',createdAt:serverTimestamp()}));
 await assertSucceeds(claim(customer));
 await assertSucceeds(getDoc(doc(customer,'clientPortals/INVITE')));
 await assertFails(getDoc(doc(anon,'clientPortals/INVITE')));
 await assertFails(getDoc(doc(ctx('other'),'clientPortals/INVITE')));
 await assertSucceeds(getDoc(doc(ctx('business'),'clientPortals/INVITE')));
 await assertFails(getDoc(doc(ctx('other'),'clientAccounts/customer')));
 await assertFails(setDoc(doc(customer,'clientAccounts/customer'),{portalToken:'OTHER'}));
 await assertFails(setDoc(doc(customer,'clientPortals/INVITE'),{ownerId:'customer'},{merge:true}));
 const decision={status:'Rechazada',name:'Cliente',signature:'',reason:'Prueba',at:serverTimestamp(),portalToken:'INVITE'};
 const decide=db=>{const b=writeBatch(db);b.set(doc(db,'clientPortals/INVITE/responses/q1'),decision);b.update(doc(db,'users/business/quotes/q1'),{status:'Rechazada',clientDecision:decision,updatedAt:serverTimestamp()});return b.commit();};
 await assertFails(decide(anon));await assertSucceeds(decide(customer));
 await assertFails(getDoc(doc(anon,'clientPortals/INVITE/responses/q1')));
 await assertSucceeds(getDoc(doc(customer,'clientPortals/INVITE/responses/q1')));
 const contractDecision={...decision,status:'Firmado',signature:'data:image/png;base64,'+'A'.repeat(120),reason:'',revision:null};
 const signContract=(db,id)=>{
  const batch=writeBatch(db);
  batch.set(doc(db,'clientPortals/INVITE/contractResponses/'+id),contractDecision);
  batch.update(doc(db,'users/business/contracts/'+id),{status:'Firmado',clientDecision:contractDecision,updatedAt:serverTimestamp()});
  return batch.commit();
 };
 await assertFails(signContract(anon,'ct1'));
 await assertFails(signContract(customer,'ct2'));
 await assertFails(signContract(customer,'ct3'));
 await assertSucceeds(signContract(customer,'ct1'));
 await assertFails(signContract(customer,'ct1'));
 await assertFails(setDoc(doc(ctx('business'),'users/business/contracts/ct1'),{body:'Editado'},{merge:true}));
 await assertSucceeds(getDoc(doc(customer,'clientPortals/INVITE/contractResponses/ct1')));
 console.log('PASS: no enumeration; verified email and phone; atomic claims; private account; owner access; linked quote responses; unauthorized reads and modifications denied.');
}finally{await env.cleanup();}
