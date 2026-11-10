// One shared browser tab for every desktop WhatsApp action.
export function createWhatsappTab({win=window,notify=alert}={}){
  let tab=null, pending=false;
  function isWhatsappUrl(value){
    try{const url=new URL(value);return url.protocol==='https:'&&['wa.me','api.whatsapp.com','web.whatsapp.com'].includes(url.hostname);}catch{return false;}
  }
  function reserve(){
    if(pending){notify('Hay un envío de WhatsApp preparándose. Espera a que termine.');return null;}
    let created=false;
    if(!tab||tab.closed){
      tab=win.open('','NexusWhatsapp');
      if(!tab){notify('Safari bloqueó WhatsApp. Permite ventanas emergentes para Nexus e intenta nuevamente.');return null;}
      created=true;
      // Keep our WindowProxy for reuse without giving WhatsApp access to Nexus.
      try{tab.opener=null;}catch{}
    }
    const target=tab;
    pending=true;
    let settled=false;
    return {
      send(url){
        if(settled)throw new Error('Este envío ya terminó.');
        if(!isWhatsappUrl(url))throw new Error('Enlace de WhatsApp inválido.');
        if(target.closed)throw new Error('La pestaña de WhatsApp se cerró. Intenta enviar nuevamente.');
        // Do not read the external document: Safari enforces same-origin access.
        target.location.href=url;
        settled=true;pending=false;
        try{target.focus();}catch{}
      },
      cancel(){
        if(settled)return;
        settled=true;pending=false;
        // A failed document preparation must not close an existing conversation.
        if(created){try{target.close();}catch{}if(tab===target)tab=null;}
      }
    };
  }
  function open(url){
    if(!isWhatsappUrl(url))return false;
    const request=reserve();if(!request)return false;
    try{request.send(url);return true;}catch(error){request.cancel();notify(error.message);return false;}
  }
  return {reserve,open,isWhatsappUrl};
}
