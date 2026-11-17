const escapeHtml=value=>String(value??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
export function latestClientService(clientId,services,now=new Date()){
  const today=new Intl.DateTimeFormat('en-CA',{timeZone:'America/Puerto_Rico',year:'numeric',month:'2-digit',day:'2-digit'}).format(now);
  return services.filter(s=>s.clientId===clientId&&['Completado','Facturado','Terminado'].includes(s.status)&&/^\d{4}-\d{2}-\d{2}$/.test(s.date||'')&&s.date<=today).sort((a,b)=>b.date.localeCompare(a.date))[0]||null;
}
export function clientRecoveryInfo(client,services,now=new Date()){
  const latest=latestClientService(client.id,services,now);
  const cutoff=new Date(now);cutoff.setUTCMonth(cutoff.getUTCMonth()-6);
  const inactive=/^(inactivo|inactiva|inactive)$/i.test(String(client.status||'').trim());
  const overdue=!!latest&&new Date(latest.date+'T12:00:00-04:00')<=cutoff;
  return {latest,eligible:inactive||overdue||!latest,reason:inactive?'Cliente inactivo':!latest?'Sin servicios completados':overdue?'6+ meses sin servicio':'Servicio reciente'};
}
export function recoveryMessage(client,services,business={},now=new Date()){
  const latest=latestClientService(client.id,services,now),oasis=/oasis/i.test(business.businessName||'');
  const name=String(client.name||'').trim();
  const month=latest?new Date(latest.date+'T12:00:00-04:00').toLocaleDateString('es-PR',{month:'long',year:'numeric'}):'';
  const maintenance=latest&&/manten|limpieza/i.test([latest.type,latest.title,latest.serviceType,latest.serviceTitle,...(latest.items||[]).map(i=>i.description||'')].join(' '));
  const history=month?`Según nuestro registro, ${maintenance?'el último mantenimiento de tu aire':'tu último servicio con nosotros'} fue en ${month}. `:'';
  return `Hola${name?', '+name:''}, ${oasis?'soy Eliezel de Oasis':'te saludamos de '+(business.businessName||'nuestro equipo')}. ${history}${oasis?'Quería saber cómo está funcionando tu aire acondicionado: ¿enfría bien, tiene algún olor o has notado algo diferente? Si todavía no has coordinado el mantenimiento, puedo ayudarte con una fecha.':'Queríamos saber si necesitas algún servicio. Estamos a la orden para ayudarte y coordinar una fecha.'}`;
}
export function clientWhatsappUrl(client,message){
  let phone=String(client.whatsapp||client.phone||'').replace(/\D/g,'');if(phone.length===10)phone='1'+phone;
  return /^\d{11,15}$/.test(phone)?'https://wa.me/'+phone+'?text='+encodeURIComponent(message):'';
}
export function shortPortalInviteLink(link){
  const source=new URL(link),token=source.searchParams.get('access')||decodeURIComponent(source.hash.slice(1).split('/')[0]||'');
  if(!token)throw new Error('El portal no tiene un código privado válido.');
  const target=new URL('../p/',source);target.hash=encodeURIComponent(token);return target.href;
}
export function showRecoveryDialog({client,services,business,dialog,copy,whatsapp,onPrepared}){
  const info=clientRecoveryInfo(client,services);
  const modal=dialog('Recordatorio de servicio',`<p class="outreach-eyebrow">RECUPERACIÓN DE CLIENTES</p><h3>${escapeHtml(client.name)}</h3><p class="muted">${escapeHtml(info.reason)}${info.latest?' · Último servicio: '+escapeHtml(info.latest.date):''}</p><label for="recoveryMessage">Personaliza el mensaje</label><textarea id="recoveryMessage" rows="7">${escapeHtml(recoveryMessage(client,services,business))}</textarea><div class="actions outreach-actions"><button type="button" class="primary" data-recovery-whatsapp>Abrir WhatsApp</button><button type="button" data-recovery-copy>Copiar mensaje</button></div><p class="muted" data-recovery-status role="status">Revisa el mensaje y envíalo desde WhatsApp.</p>`);
  const input=modal.querySelector('textarea'),status=modal.querySelector('[data-recovery-status]');
  modal.querySelector('[data-recovery-copy]').onclick=async()=>{status.textContent=await copy(input.value)?'Mensaje copiado.':'No se pudo copiar; selecciona el texto del mensaje.';};
  modal.querySelector('[data-recovery-whatsapp]').onclick=async e=>{
    if(!input.value.trim()){status.textContent='Escribe un mensaje antes de continuar.';return;}
    const url=clientWhatsappUrl(client,input.value);if(!url){status.textContent='Añade un teléfono válido al cliente para abrir WhatsApp.';return;}
    if(!whatsapp.open(url))return;
    status.textContent='WhatsApp abierto. Completa el envío allí.';
    try{await onPrepared?.();}catch{status.textContent='WhatsApp abierto; no se pudo registrar la fecha de contacto.';}
  };
  return modal;
}
export function showPortalInviteDialog({client,business,link,dialog,copy,whatsapp}){
  const short=shortPortalInviteLink(link),brand=business.businessName||'Mi portal',portalName=/oasis/i.test(business.businessName||'')?'Mi Oasis':'Mi Portal',logo=business.logoDashboard||business.logoPdf||'';
  const logoUrl=/^(data:image\/(png|jpeg|webp);base64,|https?:\/\/|\.\.?\/|\/)/i.test(logo)?logo:'';
  const message=`Hola, ${client.name||'cliente'}. ${brand} te da la bienvenida a tu portal privado. Consulta tus equipos, servicios, facturas y próximos mantenimientos.\n\nEntra aquí: ${short}\n\nGuarda este enlace para acceder cuando lo necesites.`;
  const modal=dialog('Compartir portal del cliente',`<div class="portal-invite-card" data-invite-card>${logoUrl?`<img class="portal-invite-logo" src="${escapeHtml(logoUrl)}" alt="${escapeHtml(brand)}" crossorigin="anonymous">`:''}<p class="outreach-eyebrow">TU PORTAL PERSONAL</p><h3>Hola, ${escapeHtml(client.name||'cliente')}.</h3><p>Todo sobre tus servicios,<br>en un solo lugar.</p><div class="portal-invite-features"><span>Equipos y garantías</span><span>Facturas y pagos</span><span>Historial de servicios</span><span>Próximos mantenimientos</span></div><a class="portal-invite-enter" href="${escapeHtml(short)}" target="_blank" rel="noopener noreferrer">Entrar a ${portalName} ↗</a><p class="portal-invite-link">${escapeHtml(short)}</p><small>${escapeHtml(brand)} · Acceso privado</small></div><div class="actions outreach-actions"><button class="primary" type="button" data-invite-whatsapp>Enviar enlace por WhatsApp</button><button type="button" data-invite-share>Compartir tarjeta</button><button type="button" data-invite-download>Descargar tarjeta</button><button type="button" data-invite-copy>Copiar enlace</button></div><p class="muted" data-invite-status role="status">La tarjeta se comparte como imagen; acompáñala con el enlace para que el cliente pueda tocarlo.</p>`);
  const status=modal.querySelector('[data-invite-status]');
  modal.querySelector('[data-invite-copy]').onclick=async()=>{status.textContent=await copy(short)?'Enlace privado copiado.':'No se pudo copiar. Puedes seleccionar el enlace en la tarjeta.';};
  modal.querySelector('[data-invite-whatsapp]').onclick=()=>{const url=clientWhatsappUrl(client,message);if(!url){status.textContent='Añade un teléfono válido al cliente para abrir WhatsApp.';return;}if(whatsapp.open(url))status.textContent='WhatsApp abierto con el enlace individual. Completa el envío allí.';};
  const makeImage=async()=>{
    if(!window.html2canvas)throw new Error('No se cargó la herramienta de imagen. Actualiza la página e intenta nuevamente.');
    const card=modal.querySelector('[data-invite-card]');
    await Promise.all([...card.querySelectorAll('img')].map(img=>img.decode().catch(()=>{throw new Error('No se pudo cargar el logo. Revisa el logo del negocio e intenta nuevamente.');})));
    await document.fonts?.ready;
    const canvas=await window.html2canvas(card,{scale:2,useCORS:true,backgroundColor:'#ffffff',onclone:doc=>{const node=doc.querySelector('[data-invite-card]');node.style.boxShadow='none';}});
    const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));if(!blob)throw new Error('No se pudo preparar la imagen.');return new File([blob],'Mi-Portal.png',{type:'image/png'});
  };
  let imageFile=null,imageError=null;
  const imageButtons=[modal.querySelector('[data-invite-share]'),modal.querySelector('[data-invite-download]')];
  imageButtons.forEach(b=>b.disabled=true);
  const preparation=makeImage().then(file=>{imageFile=file;}).catch(error=>{imageError=error;status.textContent=error.message;}).finally(()=>imageButtons.forEach(b=>b.disabled=false));
  const download=file=>{const href=URL.createObjectURL(file),a=document.createElement('a');a.href=href;a.download=file.name;a.click();setTimeout(()=>URL.revokeObjectURL(href),30000);};
  for(const [selector,share] of [['[data-invite-share]',true],['[data-invite-download]',false]]){
    modal.querySelector(selector).onclick=async e=>{
      const button=e.currentTarget;button.disabled=true;status.textContent='Preparando tarjeta…';
      try{
        if(!imageFile)await preparation;
        if(imageError)throw imageError;
        const file=imageFile;
        if(share&&navigator.canShare?.({files:[file]})){await navigator.share({files:[file],title:'Tu portal privado',text:message});status.textContent='Tarjeta compartida.';}
        else{download(file);const copied=await copy(short);status.textContent='Tarjeta descargada.'+(copied?' Enlace copiado para acompañarla.':' Usa Copiar enlace para acompañarla.');}
      }catch(error){status.textContent=error.name==='AbortError'?'Puedes compartir la tarjeta cuando quieras.':error.message;}
      finally{button.disabled=false;}
    };
  }
  return modal;
}
