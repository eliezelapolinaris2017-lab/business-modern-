// Shared protocol. Public portal documents contain authenticated ciphertext only.
export function randomToken(){return [...crypto.getRandomValues(new Uint8Array(24))].map(x=>x.toString(16).padStart(2,'0')).join('');}
export function employeeEmail(id){if(!/^[a-f0-9]{48}$/.test(id))throw new Error('Enlace inválido.');return `employee-${id}@nexus.invalid`;}
export function validPin(pin){return /^\d{6}$/.test(String(pin));}
export function employeePassword(secret,pin){if(!/^[a-f0-9]{48}$/.test(secret)||!validPin(pin))throw new Error('Introduce tu PIN de 6 números.');return `${secret}-${pin}`;}
export async function employeeKey(id,secret,pin){
  employeeEmail(id);const password=employeePassword(secret,pin);
  const material=await crypto.subtle.importKey('raw',new TextEncoder().encode(password),'PBKDF2',false,['deriveKey']);
  return crypto.subtle.deriveKey({name:'PBKDF2',salt:new TextEncoder().encode(`nexus-employee-v1:${id}`),iterations:210000,hash:'SHA-256'},material,{name:'AES-GCM',length:256},false,['encrypt','decrypt']);
}
function base64(bytes){let text='';for(let n=0;n<bytes.length;n+=8192)text+=String.fromCharCode(...bytes.subarray(n,n+8192));return btoa(text);}
function unbase64(text){return Uint8Array.from(atob(text),c=>c.charCodeAt(0));}
export async function seal(key,value,context){
  const iv=crypto.getRandomValues(new Uint8Array(12));
  const encrypted=await crypto.subtle.encrypt({name:'AES-GCM',iv,additionalData:new TextEncoder().encode(context)},key,new TextEncoder().encode(JSON.stringify(value)));
  return {version:1,iv:base64(iv),ciphertext:base64(new Uint8Array(encrypted))};
}
export async function unseal(key,envelope,context){
  if(envelope?.version!==1||typeof envelope.iv!=='string'||typeof envelope.ciphertext!=='string'||envelope.ciphertext.length>1200000)throw new Error('Datos de portal inválidos.');
  const decrypted=await crypto.subtle.decrypt({name:'AES-GCM',iv:unbase64(envelope.iv),additionalData:new TextEncoder().encode(context)},key,unbase64(envelope.ciphertext));
  return JSON.parse(new TextDecoder().decode(decrypted));
}
export function validateEmployeeEvent(event,service){
  if(!event||event.version!==1||!['start','complete','issue'].includes(event.action)||!event.eventId?.match(/^[a-f0-9]{48}$/)||event.serviceId!==service.id||event.dispatchKey!==service.employeeDispatchKey)throw new Error('El reporte no corresponde a la asignación vigente.');
  for(const [key,max] of [['report',12000],['materials',4000],['receivedBy',200]])if(typeof event[key]!=='string'||event[key].length>max)throw new Error('El reporte contiene campos inválidos.');
  if(event.action!=='start'&&!event.report.trim())throw new Error('Indica el trabajo realizado o el problema encontrado.');
  if(!/^\d{4}-\d{2}-\d{2}$/.test(event.date)||Number.isNaN(Date.parse(event.date)))throw new Error('Fecha de cierre inválida.');
  if(!Array.isArray(event.photos)||event.photos.length>3||event.photos.some(photo=>typeof photo!=='string'||photo.length>140000||!/^data:image\/jpeg;base64,[A-Za-z0-9+/]+=*$/.test(photo)))throw new Error('Las evidencias deben ser hasta 3 fotos comprimidas.');
  return event;
}
export function employeeEventUpdate(event,s){
  validateEmployeeEvent(event,s);
  if(s.invoiceId||s.status==='Facturado'||s.status==='Completado'||s.employeeLastEventId===event.eventId)return null;
  const base={employeeLastEventId:event.eventId,employeeLastAction:event.action};
  if(event.action==='start')return {...base,status:'En proceso'};
  if(event.action==='issue')return {...base,employeeIssue:{report:event.report,date:event.date,photos:event.photos},status:'En proceso'};
  return {...base,status:'Completado',completion:{date:event.date,report:event.report,materials:event.materials,receivedBy:event.receivedBy,photos:event.photos,teamId:s.teamId,teamName:s.teamName||'',source:'employee-portal'}};
}
export function whatsappNumber(value){let digits=String(value||'').replace(/\D/g,'');if(digits.length===10)digits='1'+digits;if(!/^\d{11,15}$/.test(digits))throw new Error('Registra un número de WhatsApp válido para el empleado.');return digits;}
