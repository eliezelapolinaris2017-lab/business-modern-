import {getAuth,createUserWithEmailAndPassword,signInWithEmailAndPassword,sendEmailVerification,sendPasswordResetEmail,onAuthStateChanged,signOut,RecaptchaVerifier,linkWithPhoneNumber} from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js';
import {doc,getDoc,writeBatch,serverTimestamp} from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js';
import {normalizePortalPhone} from './client-portal-data.js?v=118';

const escapeHtml=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function accountStage(user){
  if(!user)return 'welcome';
  if(!user.emailVerified)return 'email';
  if(!user.phoneNumber)return 'phone';
  return 'ready';
}
export function accountError(error){
  return ({
    'auth/network-request-failed':'No pudimos conectarnos. Comprueba tu internet y vuelve a intentar. Tu progreso está guardado.',
    'auth/invalid-credential':'Revisa tu correo y contraseña e intenta de nuevo.',
    'auth/email-already-in-use':'Ya tienes una cuenta con ese correo. Selecciona «Ya tengo cuenta» para entrar.',
    'auth/weak-password':'Usa una contraseña de al menos 12 caracteres.',
    'auth/too-many-requests':'Has realizado varios intentos. Espera unos minutos antes de volver a intentar.',
    'auth/invalid-verification-code':'El código no coincide. Revisa el SMS e inténtalo de nuevo.',
    'auth/code-expired':'El código venció. Solicita uno nuevo.',
    'auth/credential-already-in-use':'Ese teléfono ya está asociado a otra cuenta. Contacta al negocio para recuperar tu acceso.',
    'auth/provider-already-linked':'Tu teléfono ya está confirmado. Continúa para abrir tu información.',
    'auth/operation-not-allowed':'No podemos completar esta verificación. Contacta al negocio para recibir ayuda.',
    'auth/unauthorized-domain':'No podemos verificar desde esta dirección. Abre el enlace original enviado por el negocio.',
    'auth/captcha-check-failed':'No se completó la comprobación de seguridad. Vuelve a intentarlo.',
    'permission-denied':'No pudimos abrir tu información. Contacta al negocio para revisar tu acceso.',
    'unavailable':'No pudimos conectarnos. Comprueba tu internet y vuelve a intentar.',
    'portal/timeout':'La conexión está tardando. Vuelve a intentar cuando tengas señal.'
  })[error?.code]||(error?.code?.startsWith('auth/')?'No pudimos completar la verificación. Vuelve a intentar o contacta al negocio.':error?.message)||'No pudimos completar el paso. Vuelve a intentar.';
}
function bounded(promise){
  let timer;
  return Promise.race([promise,new Promise((_,reject)=>{timer=setTimeout(()=>reject(Object.assign(new Error(),{code:'portal/timeout'})),10000);})]).finally(()=>clearTimeout(timer));
}
export function mountClientAccount({app,db,openPortal}){
  const auth=getAuth(app),host=document.querySelector('.login-card');
  if(!host)return;
  const legacy=document.getElementById('legacyAccess');
  const panel=document.createElement('section');panel.className='account-wizard';panel.setAttribute('aria-label','Acceso a tu cuenta');
  host.querySelector('.brand-mark')?.after(panel);
  const params=new URLSearchParams(location.search);
  let saved={};try{saved=JSON.parse(sessionStorage.getItem('oasisAccountProgress')||'{}');}catch{}
  let invitation=params.get('access')||params.get('token')||saved.invitation||'';
  if(!invitation){try{invitation=localStorage.getItem('nexusPortalAccess')||'';}catch{}}
  let email=saved.email||'',phone=saved.phone||'',stage='loading',busy=false,confirmation=null,verifier=null,notice='',failure=false,disposed=false;
  let linking=false;
  const persist=()=>{try{sessionStorage.setItem('oasisAccountProgress',JSON.stringify({invitation,email,phone}));}catch{}};
  const showLogin=()=>{document.getElementById('portalApp').classList.add('hidden');document.getElementById('portalLogin').classList.remove('hidden');};
  const status=(text,isError=false)=>{notice=text;failure=isError;const box=panel.querySelector('[role=status]');if(box){box.textContent=text;box.classList.toggle('is-error',isError);}};
  const clearChallenge=()=>{if(verifier){verifier.clear();verifier=null;}};
  function render(){
    // Never destroy a live reCAPTCHA container while its verification runs.
    clearChallenge();
    if(legacy)legacy.hidden=!!auth.currentUser;
    const progress={register:1,email:2,phone:3,sms:3,ready:4}[stage];
    const lead={
      loading:['Un momento…','Estamos recuperando tu progreso.'],
      welcome:['Todo sobre tus servicios, en un lugar','Consulta tus equipos, facturas, garantías y próximos mantenimientos.'],
      register:['Vamos a crear tu cuenta','Solo necesitamos estos datos para comenzar.'],
      login:['Qué bueno tenerte de vuelta','Entra con tu correo y contraseña.'],
      reset:['Recupera tu acceso','Te enviaremos instrucciones a tu correo.'],
      email:['Revisa tu correo','Abre el mensaje de verificación y toca el enlace. Después, vuelve aquí para continuar.'],
      phone:['Confirma tu teléfono','Te enviaremos un código por mensaje de texto para proteger tu información.'],
      sms:['Escribe el código','Revisa el mensaje de texto que enviamos a tu teléfono.'],
      ready:['Tu cuenta está lista','Ya confirmaste tu correo y teléfono. Vamos a abrir tu información.'],
      error:['Vamos a intentarlo de nuevo','Tu cuenta y tu información siguen guardadas.']
    }[stage];
    const input=(label,name,type,value,extra='')=>`<label>${label}<input name="${name}" type="${type}" value="${escapeHtml(value)}" ${extra}></label>`;
    const button=(text,action,secondary=false)=>`<button type="${action==='submit'?'submit':'button'}"${action!=='submit'?` data-action="${action}"`:''} class="${secondary?'wizard-link':'wizard-primary'}">${text}</button>`;
    let content='';
    if(stage==='welcome')content=button('Crear mi cuenta','register')+button('Ya tengo cuenta','login',true);
    if(stage==='register')content=input('Correo electrónico','email','email',email,'autocomplete="email" required maxlength="254"')+input('Teléfono','phone','tel',phone,'autocomplete="tel" placeholder="787-555-1234" required')+input('Crea una contraseña','password','password','','autocomplete="new-password" minlength="12" required')+'<p class="wizard-hint">Usa al menos 12 caracteres.</p>'+button('Crear mi cuenta','submit')+button('Ya tengo cuenta','login',true);
    if(stage==='login')content=input('Correo electrónico','email','email',email,'autocomplete="email" required')+input('Contraseña','password','password','','autocomplete="current-password" required')+button('Entrar','submit')+button('Olvidé mi contraseña','reset',true)+button('Crear una cuenta','register',true);
    if(stage==='reset')content=input('Correo electrónico','email','email',email,'autocomplete="email" required')+button('Enviar instrucciones','submit')+button('Volver a entrar','login',true);
    if(stage==='email')content=`<div class="wizard-destination">${escapeHtml(auth.currentUser?.email||email)}</div>`+button('Ya confirmé mi correo','submit')+button('Volver a enviar el correo','resend',true);
    if(stage==='phone')content=input('Tu número de teléfono','phone','tel',phone,'autocomplete="tel" placeholder="787-555-1234" required')+'<div id="phoneChallenge"></div>'+button('Recibir código','submit')+'<p class="wizard-hint">Usa el número registrado con el negocio. Podemos pedirte una comprobación de seguridad antes del envío.</p>';
    if(stage==='sms')content=`<div class="wizard-destination">${escapeHtml(phone)}</div>`+input('Código de 6 dígitos','code','text','','inputmode="numeric" autocomplete="one-time-code" pattern="[0-9]{6}" maxlength="6" required')+button('Confirmar y continuar','submit')+button('Cambiar número o pedir otro código','phone',true);
    if(stage==='ready')content=button('Abrir mi información','submit');
    if(stage==='error')content=button('Volver a intentar','resume');
    const accountExit=auth.currentUser?button('Usar otra cuenta','signout',true):'';
    const inviteHelp=!invitation&&['welcome','register'].includes(stage)?'<p class="wizard-hint">Para activar tu información, abre la invitación que te enviamos por WhatsApp.</p>':'';
    panel.innerHTML=`<p class="wizard-eyebrow">Tu portal de servicios</p>${progress?`<div class="wizard-progress" aria-label="Paso ${progress} de 4">${[1,2,3,4].map(n=>`<span class="${n<=progress?'done':''}"></span>`).join('')}</div><p class="wizard-step">Paso ${progress} de 4</p>`:''}<h1 tabindex="-1">${lead[0]}</h1><p class="wizard-description">${lead[1]}</p><form novalidate>${content}</form>${inviteHelp}<p role="status" aria-live="polite" class="wizard-status${failure?' is-error':''}">${escapeHtml(notice)}</p>${accountExit}`;
    panel.querySelector('form').onsubmit=e=>{e.preventDefault();if(!e.target.reportValidity())return;const f=e.target.elements;if(f.email)email=f.email.value.trim();if(f.phone)phone=f.phone.value.trim();persist();const password=f.password?.value,code=f.code?.value;void run(()=>submit(password,code));};
    panel.querySelectorAll('[data-action]').forEach(b=>b.onclick=()=>void action(b.dataset.action));
    setBusy(busy);
  }
  function setBusy(value){panel.querySelectorAll('button').forEach(b=>b.disabled=value);panel.setAttribute('aria-busy',String(value));}
  async function run(fn){
    if(busy)return;
    busy=true;setBusy(true);status('Un momento…');
    try{await fn();}catch(error){
      // An account can exist even when sending its verification email failed.
      if(auth.currentUser&&['register','login'].includes(stage)){stage=accountStage(auth.currentUser);render();}
      status(accountError(error),true);
    }finally{busy=false;setBusy(false);}
  }
  function nextScreen(next,message=''){stage=next;notice=message;failure=false;render();}
  async function resume(){
    const user=auth.currentUser;
    if(!user){nextScreen('welcome');return;}
    await bounded(user.reload());
    if(auth.currentUser?.uid!==user.uid)return;
    const account=await bounded(getDoc(doc(db,'clientAccounts',user.uid)));
    if(auth.currentUser?.uid!==user.uid)return;
    if(account.exists()){
      invitation=account.data().portalToken;persist();
      await openPortal(invitation);nextScreen('ready');return;
    }
    email=user.email||email;phone=user.phoneNumber||phone;persist();
    nextScreen(accountStage(user));
  }
  async function activate(){
    if(linking)return;linking=true;
    try{
      const user=auth.currentUser;if(!user)throw Error('Entra en tu cuenta para continuar.');
      await bounded(user.reload());await bounded(user.getIdToken(true));
      if(accountStage(user)!=='ready'){nextScreen(accountStage(user));return;}
      const account=await bounded(getDoc(doc(db,'clientAccounts',user.uid)));
      if(account.exists()){invitation=account.data().portalToken;persist();await openPortal(invitation);return;}
      if(!invitation||invitation.includes('/'))throw Error('Abre la invitación enviada por el negocio para activar tu información.');
      const ref=doc(db,'clientPortals',invitation),snap=await bounded(getDoc(ref));
      if(!snap.exists()||snap.data().enabled===false)throw Error('Esta invitación ya no está disponible. Solicita una nueva al negocio.');
      const p=snap.data();
      if(!p.client?.id)throw Error('Este enlace es para un documento. Solicita al negocio la invitación a tu cuenta.');
      if(p.identityPhone!==user.phoneNumber||(p.identityEmail&&p.identityEmail!==user.email.toLowerCase()))throw Error('Tu correo o teléfono no coincide con el registrado. Contacta al negocio para actualizarlo.');
      const batch=writeBatch(db);
      batch.set(doc(db,'clientAccounts',user.uid),{portalToken:invitation,ownerId:p.ownerId,clientId:p.client.id,createdAt:serverTimestamp()});
      batch.update(ref,{claimedBy:user.uid});
      await batch.commit();
      await openPortal(invitation);
      status('Tu información está lista.');
    }finally{linking=false;}
  }
  async function submit(password,code){
    if(stage==='register'){
      if(!invitation)throw Error('Abre primero la invitación que te enviamos por WhatsApp.');
      if(!normalizePortalPhone(phone))throw Error('Revisa tu número de teléfono. Debe tener 10 dígitos.');
      await createUserWithEmailAndPassword(auth,email,password);
      nextScreen('email');
      await sendEmailVerification(auth.currentUser);status('Te enviamos el correo. Si no lo ves, revisa Spam.');
    }else if(stage==='login'){
      await signInWithEmailAndPassword(auth,email,password);await resume();
    }else if(stage==='reset'){
      await sendPasswordResetEmail(auth,email);status('Si existe una cuenta, recibirás las instrucciones en tu correo.');
    }else if(stage==='email'){
      await bounded(auth.currentUser.reload());
      if(!auth.currentUser.emailVerified){status('El correo todavía no aparece confirmado. Abre el enlace del mensaje y vuelve aquí.',true);return;}
      await resume();
    }else if(stage==='phone'){
      phone=normalizePortalPhone(phone);if(!phone)throw Error('Revisa tu número de teléfono. Debe tener 10 dígitos.');persist();
      await bounded(auth.currentUser.reload());
      if(!auth.currentUser.emailVerified){nextScreen('email');return;}
      if(auth.currentUser.phoneNumber){nextScreen('ready');return;}
      verifier=new RecaptchaVerifier(auth,'phoneChallenge',{size:'normal'});
      try{confirmation=await linkWithPhoneNumber(auth.currentUser,phone,verifier);nextScreen('sms');}catch(e){clearChallenge();throw e;}
    }else if(stage==='sms'){
      if(!confirmation){nextScreen('phone','Solicita un código nuevo para continuar.');return;}
      await confirmation.confirm(code);confirmation=null;nextScreen('ready');await activate();
    }else if(stage==='ready'){await activate();}
  }
  async function action(name){
    if(busy)return;
    if(['register','login','reset','phone'].includes(name)){nextScreen(name);return;}
    if(name==='resend')return run(async()=>{await sendEmailVerification(auth.currentUser);status('Te enviamos otro correo. Usa el mensaje más reciente.');});
    if(name==='resume')return run(resume);
    if(name==='signout')return run(async()=>{await signOut(auth);confirmation=null;nextScreen('login');});
  }
  window.portalSignOut=()=>signOut(auth);
  const accountButton=document.createElement('button');accountButton.type='button';accountButton.className='secondary';accountButton.textContent='Mi cuenta';document.querySelector('.header-actions')?.prepend(accountButton);
  accountButton.onclick=()=>{showLogin();document.getElementById('loginMsg').textContent='';void run(resume);};
  const stop=onAuthStateChanged(auth,()=>{if(busy||disposed)return;void run(async()=>{try{await resume();}catch(e){nextScreen('error');throw e;}});});
  const refresh=()=>{if(auth.currentUser&&stage==='email'&&!busy)void run(resume);};
  window.addEventListener('focus',refresh);document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')refresh();});
  render();
  return ()=>{disposed=true;stop();clearChallenge();window.removeEventListener('focus',refresh);};
}
