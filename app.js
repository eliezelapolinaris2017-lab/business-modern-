import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { firebaseConfig } from "./firebase-config.js";
import { getAuth, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, onSnapshot, collection, addDoc, updateDoc, deleteDoc, getDocs, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const $ = id => document.getElementById(id);
const money = n => Number(n || 0).toLocaleString('en-US', { style:'currency', currency:'USD' });
const esc = s => String(s ?? '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const today = () => new Date().toISOString().slice(0,10);
const daysAgo = n => new Date(Date.now() - n*86400000).toISOString().slice(0,10);
const plusDays = n => new Date(Date.now() + n*86400000).toISOString().slice(0,10);
const links = () => window.NEXUS_PAYMENT_LINKS || {};
const ownerEmail = () => window.NEXUS_OWNER_EMAIL || 'nexustoolspr@gmail.com';
const uid = () => auth.currentUser?.uid;



const I18N_EN = {
  'Gestiona tu negocio de forma simple y eficiente':'Manage your business with clarity and speed',
  'Entrar':'Sign in','Crear cuenta':'Create account','Nombre del negocio':'Business name','Contraseña':'Password','Email':'Email','Procesando...':'Processing...','Salir':'Sign out','Conectando...':'Connecting...','Sincronizado':'Synced','Firebase bloqueado':'Firebase blocked','Buscar...':'Search...','Plan':'Plan','Mejorar':'Upgrade','Centro de Control':'Control Center','Home':'Home','Bienvenido a Nexus':'Welcome to Nexus','Configura tu operación inicial.':'Set up your initial operation.','Configurar':'Configure','Comenzar':'Start','Negocio':'Business','Logo':'Logo','Primer cliente':'First customer','Primera factura':'First invoice','Completo':'Complete','Pendiente':'Pending','Resumen operativo':'Operational summary','Dashboard':'Dashboard','Alertas':'Alerts','Acciones rápidas':'Quick actions','Agenda empresarial':'Business agenda','Búsqueda global':'Global search','Experiencia del plan':'Plan experience','Actividad reciente':'Recent activity',
  'Clientes':'Customers','clientes':'customers','Cliente':'Customer','Servicios':'Services','Servicio':'Service','Equipo':'Team','Nómina':'Payroll','Nómina / Pagos equipo':'Payroll / Team payments','Activos':'Assets','Suplidores':'Vendors','Pagos suplidores':'Vendor payments','Pagos a suplidores':'Vendor payments','Compras':'Purchases','Facturación':'Invoicing','Cobros':'Payments','Flujo de caja':'Cash Flow','Reportes':'Reports','Planes':'Plans','Configuración':'Settings','Guardar':'Save','Guardado.':'Saved.',
  'Industria':'Industry','Idioma':'Language','Español':'Spanish','Inglés':'English','Plan activo':'Active plan','Estado':'Status','Servicios de esta industria':'Services for this industry','Un servicio por línea':'One service per line','Nombre comercial':'Business name','Eslogan':'Tagline','Teléfono':'Phone','WhatsApp':'WhatsApp','Website':'Website','Dirección':'Address','Registro comerciante':'Merchant registry','Representante':'Representative','IVU %':'Tax %','Tarifa por milla':'Rate per mile','Cargo base ruta':'Route base charge','Color primario':'Primary color','Color secundario':'Secondary color','Logo Dashboard':'Dashboard logo','Logo PDF':'PDF logo','Favicon':'Favicon','Firma digital':'Digital signature','Actual: cargado':'Current: uploaded','Actual: sin logo':'Current: no logo','Actual: sin favicon':'Current: no favicon','Actual: cargada':'Current: uploaded','Actual: sin firma':'Current: no signature','Demo':'Demo','Cargar demo':'Load demo','Borrar demo':'Delete demo',
  'Hoy':'Today','Semana':'Week','Mes':'Month','Año':'Year','Fecha':'Date','Vence':'Due','Monto':'Amount','Balance':'Balance','Total':'Total','Subtotal':'Subtotal','Pagado':'Paid','Pendiente':'Pending','Parcial':'Partial','Pagada':'Paid','Vencida':'Overdue','Cancelada':'Canceled','Cancelada':'Canceled','Acción':'Action','Método':'Method','Nota':'Note','Notas':'Notes','Condiciones':'Terms','Descripción':'Description','Cant.':'Qty','Precio Unit.':'Unit Price','No. de Factura:':'Invoice No.:','FACTURA':'INVOICE','ESTADO':'STATUS','CLIENTE':'CUSTOMER','Teléfono:':'Phone:','Dirección:':'Address:','NOTAS':'NOTES','CONDICIONES':'TERMS','PAGADO':'PAID','BALANCE':'BALANCE','SUBTOTAL':'SUBTOTAL','TOTAL':'TOTAL','¡Gracias por su preferencia!':'Thank you for your business!','Gracias por su preferencia':'Thank you for your business','Pago según acuerdo.':'Payment according to agreement.','Pago a través del método acordado.':'Payment through the agreed method.',
  'Facturar próximo servicio sin factura':'Invoice next unbilled service','Preview Ejecutivo':'Executive Preview','Financiero':'Financial','Cuentas por cobrar':'Accounts receivable','Preview Facturas':'Invoice Preview','Preview Servicios':'Service Preview','Preview Cobros':'Payment Preview','Preview Nómina':'Payroll Preview','Preview Suplidores':'Vendor Preview','Compras / CxP':'Purchases / A/P','Operacional':'Operational','Activos por Cliente':'Assets by Customer','Activos por Estado':'Assets by Status','Imprimir':'Print','Descargar PDF':'Download PDF',
  'Límite alcanzado en plan':'Plan limit reached','Mejora tu plan.':'Upgrade your plan.','Límite de servicios alcanzado.':'Service limit reached.','Límite de facturas alcanzado.':'Invoice limit reached.','¿Cancelar esta factura?':'Cancel this invoice?','¿Borrar registro?':'Delete record?','Editar nombre/título/concepto principal:':'Edit main name/title/concept:','Selecciona suplidor.':'Select vendor.','Selecciona empleado/equipo.':'Select employee/team.','Selecciona factura.':'Select invoice.','No se puede cobrar una factura cancelada.':'Cannot collect a canceled invoice.','Monto inválido.':'Invalid amount.','El cobro excede el balance. ¿Registrar de todos modos?':'Payment exceeds balance. Register anyway?','No hay servicios pendientes de facturar.':'There are no unbilled services.','Reportes es premium.':'Reports are premium.',
  'Plan actual':'Current plan','Solicitud pendiente':'Pending request','Solicitud en revisión':'Request under review','Solicitar / pagar':'Request / pay','Solicitar revisión':'Request review','PLAN MÁXIMO':'MAX PLAN','PLAN EMPRESARIAL':'ENTERPRISE PLAN','Pendiente de activación':'Pending activation','Activación':'Activation','Ilimitado':'Unlimited','Soporte corporativo':'Corporate support','Dominio personalizado':'Custom domain','Roles futuros':'Future roles','White-label completo':'Full white-label','Nómina avanzada':'Advanced payroll','Control de suplidores':'Vendor control','Firma digital':'Digital signature','Reportes ejecutivos':'Executive reports','Nómina básica':'Basic payroll','Logo en facturas':'Logo on invoices','Reportes PDF':'PDF reports','Sin nómina':'No payroll','Sin suplidores':'No vendors','Sin reportes avanzados':'No advanced reports',
  'Servicios Hoy':'Today’s Services','Cobros Pendientes':'Pending Payments','Facturas Vencidas':'Overdue Invoices','Compras Pendientes':'Pending Purchases','Nómina Pendiente':'Pending Payroll','Clientes Nuevos':'New Customers','Resumen operativo, financiero y alertas':'Operational, financial and alert summary',
  'Servicio HVAC':'HVAC Service','Servicios HVAC':'HVAC Services','Técnicos':'Technicians','Nómina técnicos':'Technician payroll','Suplidores HVAC':'HVAC Vendors','Diagnósticos, mantenimientos, garantías, facturas, nómina, suplidores y cobros.':'Diagnostics, maintenance, warranties, invoices, payroll, vendors and payments.','Tipo de servicio':'Service type','Equipo / Marca':'Equipment / Brand','BTU / Modelo':'BTU / Model','Diagnóstico':'Diagnosis','Garantía':'Warranty','Marca':'Brand','Modelo':'Model','Serial':'Serial','Ubicación':'Location','Categoría':'Category','Marca principal':'Main brand','Términos':'Terms',
  'Salón / Barbería':'Salon / Barbershop','Cita':'Appointment','Agenda y Citas':'Schedule & Appointments','Estilistas':'Stylists','Pagos estilistas':'Stylist payments','Suplidores belleza':'Beauty Vendors','Agenda, servicios de belleza, productos, comisiones, cobros y reportes.':'Schedule, beauty services, products, commissions, payments and reports.','Profesional':'Professional','Hora':'Time','Duración':'Duration','Notas de estilo':'Style notes','Área':'Area','Silla / Estación':'Chair / Station','Producto principal':'Main product',
  'Transporte':'Transport','Servicios de Transporte':'Transport Services','Choferes':'Drivers','Pagos a choferes':'Driver payments','Suplidores / Talleres':'Vendors / Shops','Rutas, millas, facturación, cobros, comisiones, retenciones, flota y suplidores.':'Routes, miles, invoicing, payments, commissions, deductions, fleet and vendors.','Tipo de carga':'Cargo type','Evidencia / referencia':'Proof / reference','Unidad':'Unit','Tablilla':'Plate','Marbete':'Registration sticker','Seguro':'Insurance','Servicio principal':'Main service',
  'Trabajo':'Job','Trabajos':'Jobs','Personal':'Staff','Pagos personal':'Staff payments','Suplidores materiales':'Material vendors','Trabajos livianos, materiales, evidencias, cobros, nómina y suplidores.':'Light jobs, materials, proof, payments, payroll and vendors.','Materiales':'Materials','Prioridad':'Priority','Observaciones':'Observations','Herramienta':'Tool','Costo':'Cost','Asignado a':'Assigned to','Material principal':'Main material',
  'Limpieza':'Cleaning','Servicios de Limpieza':'Cleaning Services','Nómina personal':'Staff payroll','Suplidores productos':'Product vendors','Limpiezas residenciales/comerciales, productos, nómina, suplidores, cobros y reportes.':'Residential/commercial cleaning, products, payroll, vendors, payments and reports.','Tipo de limpieza':'Cleaning type','Frecuencia':'Frequency','Productos':'Products','Producto / Equipo':'Product / Equipment','Cantidad':'Quantity',
  'Construcción':'Construction','Proyecto':'Project','Proyectos':'Projects','Pagos de obra':'Jobsite payments','Suplidores construcción':'Construction vendors','Proyectos, etapas, materiales, pagos de obra, suplidores, evidencias y reportes.':'Projects, stages, materials, jobsite payments, vendors, proof and reports.','Tipo de proyecto':'Project type','Etapa':'Stage','Notas técnicas':'Technical notes','Material / Equipo':'Material / Equipment','Proveedor':'Vendor',
  'Nombre':'Name','Ciudad':'City','Contacto':'Contact','Cargo':'Role','Salario':'Salary','Activo':'Active','Inactivo':'Inactive','Normal':'Normal','Alta':'High','Baja':'Low','Nuevo':'New','Buscar':'Search','Duplicar':'Duplicate','Eliminar':'Delete','PDF':'PDF'
};
function lang(){return (profile().language||'es').toLowerCase()==='en'?'en':'es';}
function T(s){s=String(s ?? '');return lang()==='en'?(I18N_EN[s]||s):s;}
function tSub(s){s=String(s ?? '');if(lang()!=='en')return s;let out=s;Object.entries(I18N_EN).sort((a,b)=>b[0].length-a[0].length).forEach(([a,b])=>{out=out.split(a).join(b);});return out;}
function applyLanguage(){
  const en=lang()==='en'; document.documentElement.lang=en?'en':'es';
  const walk=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT,{acceptNode:n=>{const p=n.parentElement;if(!p||['SCRIPT','STYLE','TEXTAREA'].includes(p.tagName))return NodeFilter.FILTER_REJECT;return n.nodeValue.trim()?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_REJECT;}});
  const nodes=[]; while(walk.nextNode())nodes.push(walk.currentNode);
  nodes.forEach(n=>{const raw=n.nodeValue,trim=raw.trim();const translated=T(trim);if(translated!==trim)n.nodeValue=raw.replace(trim,translated);});
  document.querySelectorAll('input[placeholder],textarea[placeholder]').forEach(el=>{if(el.placeholder)el.placeholder=T(el.placeholder);});
  document.querySelectorAll('option').forEach(el=>{const trim=el.textContent.trim();const translated=T(trim);if(translated!==trim)el.textContent=translated;});
}
function setHtml(el,html){ if(!el)return; el.innerHTML = lang()==='en' ? tSub(html) : html; }

const COLS = ['clients','services','quotes','followups','contracts','team','assets','suppliers','supplierPayments','payroll','payrollRetentions','purchases','invoices','payments','cashflow','planRequests'];

const INDUSTRIES = {
  hvac:{name:'HVAC',logo:'HV',color:'#0ea5e9',client:'Cliente',clients:'Clientes',service:'Servicio HVAC',services:'Servicios HVAC',team:'Técnicos',payroll:'Nómina técnicos',assets:'Activos',suppliers:'Suplidores HVAC',supplierPayments:'Pagos a suplidores',hero:'Diagnósticos, mantenimientos, garantías, facturas, nómina, suplidores y cobros.',nav:['dashboard','clients','directory','contracts','services','quotes','followups','team','payroll','assets','suppliers','supplierPayments','purchases','billing','payments','cashflow','reports','plans','settings'],serviceFields:['Tipo de servicio','Equipo / Marca','BTU / Modelo','Diagnóstico','Garantía'],assetFields:['Marca','Modelo','BTU','Serial','Ubicación'],supplierFields:['Categoría','Marca principal','Términos','Notas']},
  salon:{name:'Salón / Barbería',logo:'SB',color:'#a855f7',client:'Cliente',clients:'Clientes',service:'Cita',services:'Agenda y Citas',team:'Estilistas',payroll:'Pagos estilistas',assets:'Activos',suppliers:'Suplidores belleza',supplierPayments:'Pagos a suplidores',hero:'Agenda, servicios de belleza, productos, comisiones, cobros y reportes.',nav:['dashboard','clients','directory','contracts','services','quotes','followups','team','payroll','assets','suppliers','supplierPayments','purchases','billing','payments','cashflow','reports','plans','settings'],serviceFields:['Servicio','Profesional','Hora','Duración','Notas de estilo'],assetFields:['Área','Silla / Estación','Estado','Notas'],supplierFields:['Categoría','Producto principal','Términos','Notas']},
  transport:{name:'Transporte',logo:'TR',color:'#2563eb',client:'Cliente',clients:'Clientes',service:'Servicio',services:'Servicios de Transporte',team:'Choferes',payroll:'Pagos a choferes',assets:'Activos',suppliers:'Suplidores / Talleres',supplierPayments:'Pagos a suplidores',hero:'Rutas, millas, facturación, cobros, comisiones, retenciones, flota y suplidores.',nav:['dashboard','clients','directory','contracts','services','quotes','followups','team','payroll','assets','suppliers','supplierPayments','purchases','billing','payments','cashflow','reports','plans','settings'],serviceFields:['Tipo de carga','Evidencia / referencia'],assetFields:['Unidad','Tablilla','VIN','Marbete','Seguro'],supplierFields:['Categoría','Servicio principal','Términos','Notas']},
  handyman:{name:'Handyman',logo:'HM',color:'#f97316',client:'Cliente',clients:'Clientes',service:'Trabajo',services:'Trabajos',team:'Personal',payroll:'Pagos personal',assets:'Activos',suppliers:'Suplidores materiales',supplierPayments:'Pagos a suplidores',hero:'Trabajos livianos, materiales, evidencias, cobros, nómina y suplidores.',nav:['dashboard','clients','directory','contracts','services','quotes','followups','team','payroll','assets','suppliers','supplierPayments','purchases','billing','payments','cashflow','reports','plans','settings'],serviceFields:['Categoría','Área','Materiales','Prioridad','Observaciones'],assetFields:['Herramienta','Estado','Costo','Asignado a'],supplierFields:['Categoría','Material principal','Términos','Notas']},
  cleaning:{name:'Limpieza',logo:'CL',color:'#14b8a6',client:'Cliente',clients:'Clientes',service:'Limpieza',services:'Servicios de Limpieza',team:'Personal',payroll:'Nómina personal',assets:'Activos',suppliers:'Suplidores productos',supplierPayments:'Pagos a suplidores',hero:'Limpiezas residenciales/comerciales, productos, nómina, suplidores, cobros y reportes.',nav:['dashboard','clients','directory','contracts','services','quotes','followups','team','payroll','assets','suppliers','supplierPayments','purchases','billing','payments','cashflow','reports','plans','settings'],serviceFields:['Tipo de limpieza','Área','Frecuencia','Productos','Notas'],assetFields:['Producto / Equipo','Cantidad','Costo','Ubicación'],supplierFields:['Categoría','Producto principal','Términos','Notas']},
  construction:{name:'Construcción',logo:'CO',color:'#64748b',client:'Cliente',clients:'Clientes',service:'Proyecto',services:'Proyectos',team:'Equipo',payroll:'Pagos de obra',assets:'Activos',suppliers:'Suplidores construcción',supplierPayments:'Pagos a suplidores',hero:'Proyectos, etapas, materiales, pagos de obra, suplidores, evidencias y reportes.',nav:['dashboard','clients','directory','contracts','services','quotes','followups','team','payroll','assets','suppliers','supplierPayments','purchases','billing','payments','cashflow','reports','plans','settings'],serviceFields:['Tipo de proyecto','Dirección','Etapa','Materiales','Notas técnicas'],assetFields:['Material / Equipo','Cantidad','Costo','Proveedor'],supplierFields:['Categoría','Material principal','Términos','Notas']}
};

const DEMOS = {
  hvac:{
    business:'Oasis Demo HVAC', color:'#0ea5e9', slogan:'Gestión administrativa para servicios HVAC.',
    clients:[['Condominio Brisas del Mar','787-555-1101','admin@brisasdemo.com','San Juan','Ave. Isla Verde #100'],['Café Miramar','787-555-1102','operaciones@cafemiramar.demo','Miramar','Calle Cerra #55'],['Residencia Santiago','787-555-1103','santiago@demo.com','Trujillo Alto','Urb. Encantada']],
    team:[['Luis Técnico','787-555-2101',18,5,'Técnico'],['Carlos Ayudante','787-555-2102',10,0,'Ayudante'],['Marta Coordinadora','787-555-2103',0,0,'Coordinación']],
    assets:[['Mini Split Sala 24k','Equipo','Lobby principal','Activo',1250,plusDays(330),'AirMax Inverter R32'],['Wallpack Oficina 15k','Equipo','Oficina administrativa','En garantía',1450,plusDays(520),'Unidad comercial'],['Condensador 36k','Equipo','Techo área norte','Requiere revisión',2200,plusDays(90),'Carrier 36k']],
    suppliers:[['AirMax Puerto Rico','787-555-3101','ventas@airmax.demo',850],['Refrigeración PR Supply','787-555-3102','orders@rpr.demo',420]],
    services:[['Mantenimiento profundo',275,'Lavado de evaporador y condensador',[{description:'Mantenimiento profundo 24k',qty:1,price:175},{description:'Filtro y desinfección',qty:1,price:100}]],['Diagnóstico HVAC',95,'Verificación de presiones y amperaje',[{description:'Diagnóstico técnico',qty:1,price:95}]],['Instalación mini split',750,'Instalación equipo inverter',[{description:'Mano de obra instalación',qty:1,price:600},{description:'Materiales básicos',qty:1,price:150}]]]
  },
  salon:{
    business:'Cynthia Demo Salón', color:'#a855f7', slogan:'Agenda, cobros y administración para salón.',
    clients:[['María López','787-555-1201','maria@demo.com','Carolina','Urb. Villa Fontana'],['Jessica Rivera','787-555-1202','jessica@demo.com','San Juan','Calle Loíza #88'],['Ana Morales','787-555-1203','ana@demo.com','Bayamón','Santa Rosa Mall']],
    team:[['Cynthia González','787-555-2201',45,0,'Estilista'],['Natalia Colorista','787-555-2202',35,0,'Colorista'],['Andrea Nails','787-555-2203',30,0,'Técnica uñas']],
    assets:[['Silla principal #1','Mobiliario','Estación frontal','Activo',900,plusDays(700),'Silla hidráulica'],['Lavacabezas negro','Mobiliario','Área shampoo','Activo',650,plusDays(420),'Unidad principal'],['Secadora profesional','Equipo','Área styling','En garantía',480,plusDays(280),'Secadora pedestal']],
    suppliers:[['Beauty Supply PR','787-555-3201','ventas@beauty.demo',300],['Color Pro Distributor','787-555-3202','color@demo.com',180]],
    services:[['Color y blower',125,'Servicio de color completo',[{description:'Color raíz',qty:1,price:75},{description:'Blower',qty:1,price:50}]],['Uñas gel',55,'Manicura gel',[{description:'Manicura gel',qty:1,price:55}]],['Tratamiento hidratante',85,'Tratamiento y secado',[{description:'Tratamiento',qty:1,price:60},{description:'Secado',qty:1,price:25}]]]
  },
  transport:{
    business:'Nexus Demo Transport', color:'#2563eb', slogan:'Rutas, cobros y control administrativo de transporte.',
    clients:[['Distribuidora Norte','787-555-1301','logistica@norte.demo','Arecibo','PR-2 Km 70'],['Farmacia Central','787-555-1302','compras@farmacia.demo','Caguas','Ave. Gautier Benítez'],['Almacén Metro','787-555-1303','metro@demo.com','Guaynabo','Zona Industrial']],
    team:[['Pedro Chofer','787-555-2301',22,0,'Chofer'],['Ángel Ruta','787-555-2302',20,0,'Chofer'],['Sofía Despacho','787-555-2303',0,0,'Despacho']],
    assets:[['Van Ford Transit','Vehículo','Base Bayamón','Activo',28500,plusDays(250),'Unidad TR-01'],['Camión pequeño','Vehículo','Base Caguas','Activo',42000,plusDays(180),'Unidad TR-02'],['Hand Truck','Herramienta','Van TR-01','Activo',220,plusDays(800),'Equipo carga']],
    suppliers:[['Taller Rápido PR','787-555-3301','servicio@taller.demo',650],['Gasolina Fleet','787-555-3302','fleet@fuel.demo',1200]],
    services:[['Ruta local',180,'Entrega zona metro',[{description:'Ruta local metro',qty:1,price:180}]],['Carga liviana',240,'Recogido y entrega',[{description:'Servicio carga liviana',qty:1,price:240}]],['Ruta larga',475,'San Juan a Mayagüez',[{description:'Ruta larga',qty:1,price:425},{description:'Peaje y manejo',qty:1,price:50}]]]
  },
  handyman:{
    business:'Axis Demo Property Solutions', color:'#f97316', slogan:'Trabajos livianos, materiales, cobros y equipo.',
    clients:[['Residencia Colón','787-555-1401','colon@demo.com','Guaynabo','Urb. Garden Hills'],['Oficina Legal Ríos','787-555-1402','admin@rioslegal.demo','Hato Rey','Milla de Oro'],['Apartamento Vega','787-555-1403','vega@demo.com','Carolina','Torres del Parque']],
    team:[['José Handyman','787-555-2401',25,0,'Técnico general'],['Raúl Auxiliar','787-555-2402',15,0,'Auxiliar'],['Lina Admin','787-555-2403',0,0,'Administración']],
    assets:[['Taladro inalámbrico','Herramienta','Vehículo HM-01','Activo',180,plusDays(400),'Milwaukee'],['Escalera 8 pies','Herramienta','Almacén','Activo',120,plusDays(900),'Fibra'],['Kit plomería básica','Herramienta','Vehículo HM-01','Activo',250,plusDays(350),'Servicio campo']],
    suppliers:[['Ferretería Central','787-555-3401','ventas@ferreteria.demo',275],['Pinturas Pro','787-555-3402','ordenes@pinturas.demo',150]],
    services:[['Plomería liviana',165,'Cambio de mezcladora',[{description:'Cambio mezcladora',qty:1,price:115},{description:'Materiales',qty:1,price:50}]],['Electricidad liviana',95,'Cambio receptáculos',[{description:'Cambio receptáculos',qty:3,price:25},{description:'Visita',qty:1,price:20}]],['Pintura',350,'Retoque oficina',[{description:'Mano de obra pintura',qty:1,price:275},{description:'Materiales',qty:1,price:75}]]]
  },
  cleaning:{
    business:'Clean Pro Demo Services', color:'#14b8a6', slogan:'Limpieza residencial y comercial con control financiero.',
    clients:[['Airbnb Ocean View','787-555-1501','host@ocean.demo','Luquillo','Condominio Playa Azul'],['Clínica Dental Sol','787-555-1502','admin@dental.demo','Bayamón','Ave. Main #10'],['Oficina Caribe','787-555-1503','office@caribe.demo','San Juan','Centro Internacional']],
    team:[['Rosa Supervisora','787-555-2501',18,0,'Supervisora'],['Marcos Limpieza','787-555-2502',14,0,'Personal'],['Diana Limpieza','787-555-2503',14,0,'Personal']],
    assets:[['Aspiradora comercial','Equipo','Almacén','Activo',450,plusDays(300),'Uso diario'],['Máquina vapor','Equipo','Van CL-01','Activo',750,plusDays(500),'Desinfección'],['Carrito productos','Equipo','Clínica Dental','Activo',180,plusDays(200),'Asignado cliente']],
    suppliers:[['Janitorial Supply PR','787-555-3501','ventas@janitorial.demo',390],['Eco Clean Products','787-555-3502','eco@clean.demo',210]],
    services:[['Limpieza profunda',325,'Limpieza inicial comercial',[{description:'Limpieza profunda',qty:1,price:275},{description:'Productos especiales',qty:1,price:50}]],['Mantenimiento recurrente',180,'Servicio semanal',[{description:'Limpieza semanal',qty:1,price:180}]],['Post-construcción',520,'Limpieza final obra',[{description:'Post-construcción',qty:1,price:520}]]]
  },
  construction:{
    business:'Build Demo Contractors', color:'#64748b', slogan:'Proyectos, suplidores, nómina y reportes de obra.',
    clients:[['Proyecto Terra Lugo','787-555-1601','terra@demo.com','Trujillo Alto','Solar 12'],['Local Comercial Plaza','787-555-1602','plaza@demo.com','Caguas','Plaza Central'],['Residencia Rivera','787-555-1603','rivera@demo.com','Dorado','Urb. Dorado Beach']],
    team:[['Miguel Maestro','787-555-2601',30,0,'Maestro obra'],['Ernesto Ayudante','787-555-2602',18,0,'Ayudante'],['Nadia Proyecto','787-555-2603',0,0,'Administración']],
    assets:[['Mezcladora cemento','Equipo','Obra Terra Lugo','Activo',900,plusDays(600),'Equipo obra'],['Andamio modular','Equipo','Almacén','Activo',1500,plusDays(400),'6 secciones'],['Generador obra','Equipo','Obra Plaza','En garantía',2200,plusDays(700),'Generador 6500W']],
    suppliers:[['Materiales del Este','787-555-3601','ventas@materiales.demo',1850],['Hormigón Express','787-555-3602','ordenes@hormigon.demo',2400]],
    services:[['Supervisión de obra',950,'Semana de supervisión',[{description:'Supervisión semanal',qty:1,price:950}]],['Electricidad',1250,'Instalación circuito comercial',[{description:'Mano de obra electricidad',qty:1,price:900},{description:'Materiales',qty:1,price:350}]],['Terminaciones',2100,'Fase de terminaciones',[{description:'Mano de obra terminaciones',qty:1,price:1600},{description:'Materiales',qty:1,price:500}]]]
  }
};

const PLANS = {
  free:{name:'Free',price:'$0',badge:'Básico',limits:{clients:5,services:10,quotes:10,followups:25,team:1,assets:0,suppliers:0,supplierPayments:0,payroll:0,purchases:0,invoices:3,payments:3,cashflow:5},modules:['dashboard','clients','directory','contracts','services','quotes','followups','billing','plans','settings'],features:['5 clientes','10 servicios','3 facturas','Sin nómina','Sin suplidores','Sin reportes avanzados']},
  pro:{name:'Pro',price:'$19.99/mes',badge:'Profesional',limits:{clients:500,services:1000,quotes:1000,followups:1000,team:10,assets:100,suppliers:25,supplierPayments:100,payroll:100,purchases:100,invoices:500,payments:500,cashflow:1000},modules:['dashboard','clients','directory','contracts','services','quotes','followups','team','payroll','assets','suppliers','supplierPayments','purchases','billing','payments','cashflow','reports','plans','settings'],features:['Nómina básica','Suplidores','Logo en facturas','Reportes PDF','500 clientes']},
  business:{name:'Business',price:'$39.99/mes',badge:'Premium',limits:{clients:5000,services:10000,quotes:10000,followups:10000,team:50,assets:1000,suppliers:500,supplierPayments:2000,payroll:2000,purchases:2000,invoices:5000,payments:5000,cashflow:10000},modules:['dashboard','clients','directory','contracts','services','quotes','followups','team','payroll','assets','suppliers','supplierPayments','purchases','billing','payments','cashflow','reports','plans','settings'],features:['White-label completo','Nómina avanzada','Control de suplidores','Firma digital','Reportes ejecutivos']},
  enterprise:{name:'Enterprise',price:'Custom',badge:'Corporativo',limits:{clients:Infinity,services:Infinity,quotes:Infinity,followups:Infinity,team:Infinity,assets:Infinity,suppliers:Infinity,supplierPayments:Infinity,payroll:Infinity,purchases:Infinity,invoices:Infinity,payments:Infinity,cashflow:Infinity},modules:['dashboard','clients','directory','contracts','services','quotes','followups','team','payroll','assets','suppliers','supplierPayments','purchases','billing','payments','cashflow','reports','plans','settings'],features:['Ilimitado','Dominio personalizado','Roles futuros','Soporte corporativo']}
};

const TITLES = {dashboard:'Home',clients:'Clientes',directory:'Directorio',contracts:'Contratos de servicios',services:'Servicios',quotes:'Cotizaciones Pro',followups:'Seguimiento',team:'Equipo',payroll:'Nómina',assets:'Activos',suppliers:'Suplidores',supplierPayments:'Pagos suplidores',purchases:'Compras',billing:'Facturación',payments:'Cobros',cashflow:'Flujo de caja',reports:'Reportes',plans:'Planes',settings:'Configuración'};
let mode = 'login', unsub = [];
let state = {profile:null,clients:[],services:[],quotes:[],followups:[],contracts:[],team:[],assets:[],suppliers:[],supplierPayments:[],payroll:[],payrollRetentions:[],purchases:[],invoices:[],payments:[],cashflow:[],planRequests:[],previewHtml:'',activeView:'dashboard',editingServiceId:null,editingQuoteId:null,editingContractId:null,billingFilter:'all',billingSearch:'',directorySearch:'',directoryFavoritesOnly:false};

function defaultProfile(){return {businessName:'Mi Negocio',industry:'hvac',language:'es',plan:'free',planStatus:'active',planChangeMode:'manual',pendingPlan:'',pendingPlanStatus:'none',phone:'',whatsapp:'',email:auth.currentUser?.email||'',address:'',web:'',tax:'11.5',merchant:'',representative:'',slogan:'',logoDashboard:'',logoPdf:'',favicon:'',signature:'',primaryColor:'#2563eb',secondaryColor:'#0f172a',customServices:{},transportRatePerMile:'2.50',transportBaseCharge:'0',dailyGoal:'1000',onboardingComplete:false,onboardingSkipped:false,createdAt:new Date().toISOString()};}
function profile(){return state.profile || defaultProfile();}
function industry(){return INDUSTRIES[profile().industry] || INDUSTRIES.hvac;}
function normalizePlanId(value){
  const v = String(value || 'free').toLowerCase().trim();
  const map = { gratis:'free', basico:'free', básico:'free', basic:'free', premium:'business', negocio:'business', business:'business', max:'enterprise', maximo:'enterprise', máximo:'enterprise', enterprise:'enterprise', corporativo:'enterprise', corporate:'enterprise', ilimitado:'enterprise' };
  return PLANS[v] ? v : (map[v] || 'free');
}
function currentPlanId(){ return normalizePlanId(profile().plan); }
function plan(){return PLANS[currentPlanId()] || PLANS.free;}
function isTopPlan(){return currentPlanId()==='enterprise';}
function canUpgradePlan(){return !isTopPlan();}
function colPath(c){return collection(db,'users',uid(),c);}
function docPath(c,id){return doc(db,'users',uid(),c,id);}
function profRef(){return doc(db,'users',uid());}
function limit(c){return plan().limits[c] ?? Infinity;}
function unlimited(v){return v === Infinity;}
function lockedModule(v){return !plan().modules.includes(v);}
function canCreate(c){const l=limit(c); return unlimited(l) || (state[c]||[]).length < l;}
function sum(a,k){return (a||[]).reduce((t,x)=>t+Number(x[k]||0),0);}
function teamBy(id){return state.team.find(x=>x.id===id)||{};}
function supplierBy(id){return state.suppliers.find(x=>x.id===id)||{};}
function clientBy(id){return state.clients.find(x=>x.id===id)||{};}
function assetBy(id){return state.assets.find(x=>x.id===id)||{};}
function assetName(a){return a?.name || (a?.fields?.[0]) || 'Activo';}
function assetCategory(a){return a?.category || (a?.fields?.[1]) || 'General';}
function assetLocation(a){return a?.location || (a?.fields?.[4]) || ''; }
function assetStatus(a){return a?.status || (a?.fields?.[2]) || 'Activo';}
function assetLabel(a){const client=a?.clientName?` · ${a.clientName}`:'';return `${assetName(a)}${client}`;}
function clientTagOptions(){return ['VIP','Corporativo','Residencial','Comercial','Moroso','Garantía','Contrato','Prospecto','Recurrente','Prioridad','Inactivo','Otro'];}
function clientTagsArray(v){return String(v||'').split(',').map(x=>x.trim()).filter(Boolean);}
function clientTagsSelectHtml(id,val=''){
  const selected=clientTagsArray(val);
  return `<div><label>Etiquetas</label><select id="${id}" class="tag-scroll-select" multiple size="5">${clientTagOptions().map(x=>`<option value="${esc(x)}" ${selected.includes(x)?'selected':''}>${esc(x)}</option>`).join('')}</select><small class="muted">Selecciona una o varias etiquetas.</small></div>`;
}
function readClientTags(id){const el=$(id); return el ? [...el.selectedOptions].map(o=>o.value).join(', ') : '';}
function cleanSSN(value){return String(value||'').replace(/\D/g,'').slice(0,9);}
function formatSSNInput(value){const d=cleanSSN(value); if(!d)return ''; if(d.length<=3)return d; if(d.length<=5)return `${d.slice(0,3)}-${d.slice(3)}`; return `${d.slice(0,3)}-${d.slice(3,5)}-${d.slice(5)}`;}
function maskSSN(value){const d=cleanSSN(value); return d.length>=4 ? `***-**-${d.slice(-4)}` : '***-**-****';}
function vehicleAssetOptions(){return state.assets.filter(a=>String(assetCategory(a)).toLowerCase().includes('veh') || String(assetName(a)).toLowerCase().includes('veh'))}

function invoicePaid(inv){const id=typeof inv==='string'?inv:inv?.id;return state.payments.filter(p=>p.invoiceId===id).reduce((t,p)=>t+Number(p.amount||0),0);}
function invoicePaymentMethods(inv){const id=typeof inv==='string'?inv:inv?.id;return [...new Set(state.payments.filter(p=>p.invoiceId===id).map(p=>String(p.method||'').trim()).filter(Boolean))];}
function invoicePaymentTerms(inv,fallback='Pago según acuerdo.'){const methods=invoicePaymentMethods(inv);if(!methods.length)return fallback;return `${methods.length>1?'Métodos de pago':'Método de pago'}: ${methods.join(', ')}.`;}
function invoiceBalance(inv){return Math.max(0,Number(inv.total||0)-invoicePaid(inv));}
function dateValue(d){return d ? new Date(String(d)+'T00:00:00').getTime() : 0;}
function invoiceStatus(inv){
  if(String(inv.status||'').toLowerCase()==='cancelada') return 'Cancelada';
  const bal=invoiceBalance(inv), paid=invoicePaid(inv), due=dateValue(inv.dueDate);
  if(bal<=0) return 'Pagada';
  if(due && due < dateValue(today())) return 'Vencida';
  if(paid>0) return 'Parcial';
  return 'Pendiente';
}
function statusChip(st){const cls=String(st||'').toLowerCase().replace(/\s+/g,'-');return `<span class="status-chip status-${cls}">${esc(st)}</span>`;}
function financialSummary(){
  const startMonth=today().slice(0,7);
  const paid=sum(state.payments,'amount');
  const invoiced=sum(state.invoices,'total');
  const receivable=state.invoices.reduce((a,inv)=>a+invoiceBalance(inv),0);
  const overdue=state.invoices.filter(inv=>invoiceStatus(inv)==='Vencida').reduce((a,inv)=>a+invoiceBalance(inv),0);
  const expenses=sum(state.payroll,'net')+sum(state.supplierPayments,'amount')+state.cashflow.filter(x=>x.type==='Gasto' && !String(x.concept||'').startsWith('Nómina ') && !String(x.concept||'').startsWith('Pago suplidor ')).reduce((a,x)=>a+Number(x.amount||0),0);
  const monthIncome=state.payments.filter(p=>String(p.date||'').startsWith(startMonth)).reduce((a,p)=>a+Number(p.amount||0),0);
  const monthExpenses=state.cashflow.filter(x=>String(x.date||'').startsWith(startMonth) && x.type==='Gasto').reduce((a,x)=>a+Number(x.amount||0),0);
  return {paid,invoiced,receivable,overdue,expenses,net:paid-expenses,monthIncome,monthExpenses,monthNet:monthIncome-monthExpenses};
}
function teamCommission(tid){const t=teamBy(tid);return state.services.filter(s=>s.teamId===tid).reduce((a,s)=>a+(serviceAmount(s)*Number(t.rate||0)/100),0);}
function teamRetention(tid){const t=teamBy(tid);return state.services.filter(s=>s.teamId===tid).reduce((a,s)=>a+(serviceAmount(s)*Number(t.retention||0)/100),0);}
function payrollRetention(p){return Number(p.retention ?? p.retenciones ?? 0);}
function payrollOtherDeductions(p){return Number(p.deductions||0);}
function payrollAdvance(p){return Number(p.advance||0);}
function payrollTotalDeductions(p){return payrollRetention(p)+payrollOtherDeductions(p)+payrollAdvance(p);}
function payrollGrossTotal(p){return Number(p.gross||0)+Number(p.bonus||0);}
function payrollNet(p){const stored=Number(p.net); if(!Number.isNaN(stored) && (p.net!==undefined && p.net!=='')) return stored; return Math.max(0,payrollGrossTotal(p)-payrollTotalDeductions(p));}

function retentionAmount(r){return Number(r.amount||0);}
function retentionStatus(r){return r.status || (r.paidAt ? 'Pagada' : 'Pendiente');}
function retentionPendingAmount(){return state.payrollRetentions.filter(r=>retentionStatus(r)!=='Pagada' && retentionStatus(r)!=='Aplicada').reduce((a,r)=>a+retentionAmount(r),0);}
function retentionPaidAmount(){return state.payrollRetentions.filter(r=>retentionStatus(r)==='Pagada').reduce((a,r)=>a+retentionAmount(r),0);}
function retentionDestinationOptions(){return ['Departamento de Hacienda','Seguro Social / Medicare','SINOT','Fondo del Seguro del Estado','ASUME','Empleado','Descuento interno','Otro'];}
function retentionTypeOptions(){return ['Hacienda','Seguro Social / Medicare','SINOT','Fondo del Seguro del Estado','ASUME','Adelanto al empleado','Descuento interno','Embargo','Otro'];}
function retentionLabel(r){return `${r.type||'Retención'} · ${r.destination||'Sin destino'}`;}
function payrollPaid(tid){return state.payroll.filter(p=>p.teamId===tid).reduce((a,p)=>a+payrollNet(p),0);}
function teamBalance(tid){return Math.max(0,teamCommission(tid)-teamRetention(tid)-payrollPaid(tid));}
function supplierPaid(sid){return state.supplierPayments.filter(p=>p.supplierId===sid).reduce((a,p)=>a+Number(p.amount||0),0);}
function supplierPurchasesTotal(sid){return state.purchases.filter(p=>p.supplierId===sid).reduce((a,p)=>a+Number(p.total||0),0);}
function paymentAllocations(p){return Array.isArray(p?.allocations)?p.allocations:[];}
function purchasePaid(pid){
  return state.supplierPayments.reduce((total,p)=>{
    const direct=p.purchaseId===pid?Number(p.amount||0):0;
    const allocated=paymentAllocations(p).filter(a=>a.purchaseId===pid).reduce((sum,a)=>sum+Number(a.amount||0),0);
    return total+direct+allocated;
  },0);
}
function purchaseBalance(p){return Math.max(0,Number(p.total||0)-purchasePaid(p.id));}
function supplierPurchaseSort(a,b){return String(a.date||a.dueDate||'').localeCompare(String(b.date||b.dueDate||'')) || String(a.createdAt?.seconds||0).localeCompare(String(b.createdAt?.seconds||0));}
function allocationsForGeneralPayment(supplierId,amount,{excludePaymentId=''}={}){
  let remaining=Math.max(0,Number(amount||0));
  if(!supplierId||remaining<=0)return [];
  const directPaid={};
  const allocatedPaid={};
  state.supplierPayments.forEach(p=>{
    if(p.id===excludePaymentId)return;
    if(p.purchaseId) directPaid[p.purchaseId]=(directPaid[p.purchaseId]||0)+Number(p.amount||0);
    paymentAllocations(p).forEach(a=>{allocatedPaid[a.purchaseId]=(allocatedPaid[a.purchaseId]||0)+Number(a.amount||0);});
  });
  const allocations=[];
  [...state.purchases].filter(p=>p.supplierId===supplierId && String(p.status||'')!=='Cancelada').sort(supplierPurchaseSort).forEach(p=>{
    if(remaining<=0)return;
    const already=(directPaid[p.id]||0)+(allocatedPaid[p.id]||0);
    const balance=Math.max(0,Number(p.total||0)-already);
    if(balance<=0)return;
    const applied=Math.min(balance,remaining);
    allocations.push({purchaseId:p.id,purchaseNumber:p.number||p.reference||p.concept||'',amount:applied});
    allocatedPaid[p.id]=(allocatedPaid[p.id]||0)+applied;
    remaining-=applied;
  });
  return allocations;
}
function syncSupplierPurchaseOptions(){
  const supplierId=$('spSupplier')?.value||'';
  const selectEl=$('spPurchase');if(!selectEl)return;
  const current=selectEl.value;
  const rows=state.purchases.filter(p=>purchaseBalance(p)>0 && (!supplierId||p.supplierId===supplierId));
  selectEl.innerHTML='<option value="">Pago general · aplicar automáticamente a compras antiguas</option>'+rows.map(p=>`<option value="${esc(p.id)}">${esc(p.number||p.reference||p.concept||'Compra')} · ${esc(p.supplierName||'')} · ${money(purchaseBalance(p))}</option>`).join('');
  if(rows.some(p=>p.id===current))selectEl.value=current;
}

async function reconcileGeneralSupplierPayments(){
  if(!state.supplierPayments.length)return alert('No hay pagos a suplidores para reconciliar.');
  if(!confirm('Nexus aplicará los pagos generales existentes a las compras pendientes más antiguas de cada suplidor. No se crearán pagos nuevos ni movimientos de caja. ¿Continuar?'))return;
  try{
    const directPaid={};
    state.supplierPayments.filter(p=>p.purchaseId).forEach(p=>{directPaid[p.purchaseId]=(directPaid[p.purchaseId]||0)+Number(p.amount||0);});
    const remainingByPurchase={};
    state.purchases.forEach(p=>{remainingByPurchase[p.id]=Math.max(0,Number(p.total||0)-(directPaid[p.id]||0));});
    const general=[...state.supplierPayments].filter(p=>!p.purchaseId).sort((a,b)=>String(a.date||'').localeCompare(String(b.date||'')));
    let updated=0,appliedTotal=0;
    for(const pay of general){
      let remaining=Math.max(0,Number(pay.amount||0));
      const allocations=[];
      const purchases=[...state.purchases].filter(p=>p.supplierId===pay.supplierId && String(p.status||'')!=='Cancelada').sort(supplierPurchaseSort);
      for(const p of purchases){
        if(remaining<=0)break;
        const bal=Math.max(0,remainingByPurchase[p.id]||0);
        if(bal<=0)continue;
        const applied=Math.min(bal,remaining);
        allocations.push({purchaseId:p.id,purchaseNumber:p.number||p.reference||p.concept||'',amount:applied});
        remainingByPurchase[p.id]=bal-applied; remaining-=applied; appliedTotal+=applied;
      }
      const before=JSON.stringify(paymentAllocations(pay));
      const after=JSON.stringify(allocations);
      if(before!==after){await updateDoc(docPath('supplierPayments',pay.id),{allocations,allocationUpdatedAt:new Date().toISOString()});updated++;}
    }
    alert(`Reconciliación completada. ${updated} pago(s) general(es) actualizados. ${money(appliedTotal)} aplicado a compras.`);
  }catch(err){console.error(err);alert('No se pudo reconciliar: '+(err?.message||err));}
}
function purchaseStatus(p){if(String(p.status||'')==='Cancelada')return 'Cancelada';const bal=purchaseBalance(p), paid=purchasePaid(p.id);if(bal<=0)return 'Pagada';if(p.dueDate && p.dueDate<today())return 'Vencida';return paid>0?'Parcial':'Pendiente';}
function supplierBalance(sid){const s=supplierBy(sid);return Math.max(0,Number(s.openingBalance||0)+supplierPurchasesTotal(sid)-supplierPaid(sid));}
function operationalSummary(){const payrollDue=state.team.reduce((a,t)=>a+teamBalance(t.id),0);const purchaseDebt=state.purchases.reduce((a,p)=>a+purchaseBalance(p),0);const overduePurchases=state.purchases.filter(p=>purchaseStatus(p)==='Vencida').reduce((a,p)=>a+purchaseBalance(p),0);return {employees:state.team.filter(t=>String(t.status||'Activo')!=='Inactivo').length,payrollDue,purchaseDebt,overduePurchases,purchases:state.purchases.length,suppliers:state.suppliers.length};}

function obligationItems(){
  const items=[];
  state.payrollRetentions
    .filter(r=>retentionStatus(r)!=='Pagada' && retentionStatus(r)!=='Aplicada')
    .forEach(r=>items.push({date:r.dueDate||r.date||today(),type:'Retención',title:`${r.destination||'Destino'} · ${r.type||'Retención'} · ${r.teamName||''}`,amount:retentionAmount(r),view:'payroll',status:retentionStatus(r)}));
  state.purchases
    .filter(p=>purchaseBalance(p)>0 && purchaseStatus(p)!=='Cancelada')
    .forEach(p=>items.push({date:p.dueDate||p.date||today(),type:'Compra',title:`${p.supplierName||'Suplidor'} · ${p.concept||p.number||'Compra'}`,amount:purchaseBalance(p),view:'purchases',status:purchaseStatus(p)}));
  state.team
    .map(t=>({team:t,amount:teamBalance(t.id)}))
    .filter(x=>x.amount>0)
    .forEach(x=>items.push({date:today(),type:'Nómina',title:x.team.name||'Empleado',amount:x.amount,view:'payroll',status:'Pendiente'}));
  state.suppliers
    .map(s=>({supplier:s,amount:supplierBalance(s.id),hasPurchases:state.purchases.some(p=>p.supplierId===s.id)}))
    .filter(x=>x.amount>0 && !x.hasPurchases)
    .forEach(x=>items.push({date:today(),type:'Suplidor',title:x.supplier.name||'Suplidor',amount:x.amount,view:'suppliers',status:'Pendiente'}));
  return items.sort((a,b)=>String(a.date||'').localeCompare(String(b.date||'')) || String(b.amount-a.amount));
}
function obligationSummary(){
  const items=obligationItems();
  const t=today(), week=plusDays(7), month=plusDays(30);
  const total=items.reduce((a,x)=>a+Number(x.amount||0),0);
  const dueToday=items.filter(x=>String(x.date||'')<=t).reduce((a,x)=>a+Number(x.amount||0),0);
  const dueWeek=items.filter(x=>String(x.date||'')<=week).reduce((a,x)=>a+Number(x.amount||0),0);
  const dueMonth=items.filter(x=>String(x.date||'')<=month).reduce((a,x)=>a+Number(x.amount||0),0);
  const overdue=items.filter(x=>String(x.date||'')<t).reduce((a,x)=>a+Number(x.amount||0),0);
  return {items,total,dueToday,dueWeek,dueMonth,overdue,count:items.length};
}
function financialHubSummary(){
  const f=financialSummary(), o=obligationSummary();
  const receivableToday=state.invoices.filter(inv=>invoiceBalance(inv)>0 && String(inv.dueDate||'')<=today()).reduce((a,inv)=>a+invoiceBalance(inv),0);
  const projectedIncome=f.receivable;
  const projectedOut=o.total;
  const projectedNet=f.net + projectedIncome - projectedOut;
  return {f,o,receivableToday,projectedIncome,projectedOut,projectedNet};
}
function renderFinancialHub(){
  const hub=$('financialHub');
  if(!hub) return;
  const h=financialHubSummary();
  const next=h.o.items.slice(0,6);
  const dueClass=h.o.overdue>0?'danger':h.o.dueWeek>0?'warn':'ok';
  hub.innerHTML=`
    <div class="financial-hub-head">
      <div><h3>Financial Hub</h3><p>Qué debes cobrar y qué debes pagar.</p></div>
      <span class="health-badge ${dueClass}">${h.o.overdue>0?'🔴 Vencido':h.o.dueWeek>0?'🟡 Próximo':'🟢 Al día'}</span>
    </div>
    <div class="financial-hub-grid">
      <button type="button" class="finance-tile" data-finance-view="billing"><span>Debes cobrar</span><b>${money(h.f.receivable)}</b><small>Hoy / vencido: ${money(h.receivableToday)}</small></button>
      <button type="button" class="finance-tile" data-finance-view="payroll"><span>Debes pagar</span><b>${money(h.o.total)}</b><small>${h.o.count} obligaciones</small></button>
      <button type="button" class="finance-tile" data-finance-view="cashflow"><span>Flujo proyectado</span><b>${money(h.projectedNet)}</b><small>Caja + cobros - pagos</small></button>
      <button type="button" class="finance-tile" data-finance-view="purchases"><span>Esta semana</span><b>${money(h.o.dueWeek)}</b><small>Próximos vencimientos</small></button>
    </div>
    <div class="obligation-box">
      <div class="section-head mini"><h4>Próximas obligaciones</h4><span>${money(h.o.dueMonth)}</span></div>
      <div class="obligation-list">${next.length?next.map(x=>`<button type="button" class="obligation-row" data-obligation-view="${esc(x.view)}"><span><b>${esc(x.date||'—')}</b><small>${esc(x.type)} · ${esc(x.title)}</small></span><strong>${money(x.amount)}</strong></button>`).join(''):'<p class="muted">Sin obligaciones pendientes.</p>'}</div>
    </div>`;
  document.querySelectorAll('[data-finance-view]').forEach(b=>b.onclick=()=>{const v=b.dataset.financeView;if(v==='billing') return openBilling('receivable','');show(v);});
  document.querySelectorAll('[data-obligation-view]').forEach(b=>b.onclick=()=>show(b.dataset.obligationView));
}
function imgOrText(data,text){return data?`<img src="${data}" alt="Logo" class="logo-img">`:esc(text);}

function isTransport(){return (profile().industry||'')==='transport';}
function mapsRouteUrl(origin='',destination=''){
  const o=String(origin||'').trim(), d=String(destination||'').trim();
  if(!o || !d) return '';
  return `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(o)}&destination=${encodeURIComponent(d)}&travelmode=driving`;
}
function routeLink(origin='',destination='',label='Abrir ruta'){
  const url=mapsRouteUrl(origin,destination);
  return url?`<a class="route-link" href="${url}" target="_blank" rel="noopener">${esc(label)}</a>`:'';
}
function transportRouteFromForm(){
  if(!isTransport()) return null;
  const miles=Number($('sRouteMiles')?.value||0);
  const rate=Number($('sRouteRate')?.value||0);
  const base=Number($('sRouteBase')?.value||0);
  return {origin:$('sOrigin')?.value||'',destination:$('sDestination')?.value||'',miles,rate,base,total:base+(miles*rate)};
}
function transportRouteFromService(s){
  if(s?.route) return s.route;
  const f=s?.fields||[];
  return {origin:f[0]||'',destination:f[1]||'',miles:Number(f[2]||0),rate:Number(f[3]||0),base:Number(f[4]||0),total:Number(s?.amount||0)};
}
function updateTransportTotal(){
  if(!isTransport()) return;
  const r=transportRouteFromForm();
  const amount=$('sAmount');
  if(amount && r) amount.value=(r.total||0).toFixed(2);
  const preview=$('routeCalcPreview');
  if(preview && r) preview.textContent=`${Number(r.miles||0).toFixed(2)} mi × ${money(r.rate)} + ${money(r.base)} = ${money(r.total)}`;
  const open=$('openRouteBtn');
  if(open && r){
    const url=mapsRouteUrl(r.origin,r.destination);
    open.disabled=!url;
    open.onclick=()=>{ if(url) window.open(url,'_blank','noopener'); };
  }
}
function transportRouteFormHtml(){
  if(!isTransport()) return '';
  const p=profile();
  return `<div class="wide route-box"><div class="route-grid">${input('Origen','sOrigin','text','','wide')}${input('Destino','sDestination','text','','wide')}${input('Millas Google','sRouteMiles','number','')}${input('Tarifa por milla','sRouteRate','number',p.transportRatePerMile||'2.50')}${input('Cargo base','sRouteBase','number',p.transportBaseCharge||'0')}<div><label>Ruta</label><button id="openRouteBtn" type="button" class="ghost" disabled>Abrir ruta</button></div></div><small id="routeCalcPreview" class="muted"></small></div>`;
}
function defaultServiceOptions(indId=profile().industry){
  const map={
    hvac:['Diagnóstico HVAC','Mantenimiento preventivo','Mantenimiento profundo','Instalación mini split','Reparación','Garantía','Carga de refrigerante','Limpieza de evaporador','Limpieza de condensador'],
    salon:['Corte','Blower','Color','Tratamiento','Uñas','Barbería','Cejas','Peinado'],
    transport:['Recogido','Entrega','Ruta local','Ruta larga','Carga liviana','Servicio especial'],
    handyman:['Plomería liviana','Electricidad liviana','Construcción liviana','Pintura','Reparación menor','Instalación'],
    cleaning:['Limpieza residencial','Limpieza comercial','Limpieza profunda','Mantenimiento recurrente','Cristales','Post-construcción'],
    construction:['Estimado','Demolición','Plomería','Electricidad','Pisos','Hormigón','Terminaciones','Supervisión']
  };
  return map[indId]||['Servicio general'];
}
function serviceOptions(){
  const p=profile(), id=p.industry||'hvac';
  const custom=p.customServices?.[id];
  const arr=Array.isArray(custom)?custom:[];
  return (arr.length?arr:defaultServiceOptions(id)).filter(Boolean);
}



function clientTagHtml(c){
  const tags=String(c.tags||'').split(',').map(x=>x.trim()).filter(Boolean);
  return tags.map(t=>`<span class="tag">${esc(t)}</span>`).join('');
}
function clientSummary(c){
  const services=state.services.filter(s=>s.clientId===c.id);
  const invoices=state.invoices.filter(i=>i.clientId===c.id);
  const paid=invoices.reduce((a,inv)=>a+(Number(inv.total||0)-invoiceBalance(inv)),0);
  const balance=invoices.reduce((a,inv)=>a+invoiceBalance(inv),0);
  const assets=state.assets.filter(a=>a.clientId===c.id).length;
  return {services:services.length,invoices:invoices.length,paid,balance,assets};
}
function dashboardAlerts(){
  const pendingInvoices=state.invoices.filter(inv=>invoiceBalance(inv)>0);
  const overdueInvoices=state.invoices.filter(inv=>invoiceStatus(inv)==='Vencida');
  const unpaid=pendingInvoices.reduce((a,inv)=>a+invoiceBalance(inv),0);
  const pendingPlans=latestPlanRequest()?1:0;
  const servicesToday=state.services.filter(s=>s.date===today()).length;
  const payrollBalance=state.team.reduce((a,t)=>a+teamBalance(t.id),0);
  const q=quoteSummary();
  const alerts=[];
  if(q.open>0) alerts.push(`Cotizaciones abiertas: ${q.open} · ${money(q.openValue)}`);
  if(q.approved>0) alerts.push(`Cotizaciones aprobadas sin facturar: ${q.approved} · ${money(q.approvedValue)}`);
  if(q.expired>0) alerts.push(`Cotizaciones vencidas: ${q.expired}`);
  if(unpaid>0) alerts.push(`Facturas con balance: ${pendingInvoices.length} · ${money(unpaid)}`);
  if(overdueInvoices.length) alerts.push(`Facturas vencidas: ${overdueInvoices.length} · ${money(overdueInvoices.reduce((a,inv)=>a+invoiceBalance(inv),0))}`);
  if(servicesToday>0) alerts.push(`Servicios para hoy: ${servicesToday}`);
  if(payrollBalance>0) alerts.push(`Nómina pendiente: ${money(payrollBalance)}`);
  const ops=operationalSummary();
  if(ops.purchaseDebt>0) alerts.push(`Cuentas por pagar: ${money(ops.purchaseDebt)}`);
  const retPend=retentionPendingAmount();
  if(retPend>0) alerts.push(`Retenciones pendientes: ${money(retPend)}`);
  if(ops.overduePurchases>0) alerts.push(`Compras vencidas: ${money(ops.overduePurchases)}`);
  if(pendingPlans) alerts.push('Solicitud de plan pendiente');
  return alerts;
}


function businessDayStats(){
  const t=today();
  const tomorrow=plusDays(1);
  const f=financialSummary();
  const o=operationalSummary();
  const q=quoteSummary();
  const todayServices=state.services.filter(s=>String(s.date||'')===t);
  const tomorrowServices=state.services.filter(s=>String(s.date||'')===tomorrow);
  const weekServices=state.services.filter(s=>String(s.date||'')>=t && String(s.date||'')<=plusDays(7));
  const pendingInvoices=state.invoices.filter(i=>invoiceBalance(i)>0 && invoiceStatus(i)!=='Cancelada');
  const overdueInvoices=state.invoices.filter(i=>invoiceStatus(i)==='Vencida');
  const pendingPurchases=state.purchases.filter(p=>purchaseBalance(p)>0);
  const overduePurchases=state.purchases.filter(p=>purchaseStatus(p)==='Vencida');
  const paymentsToday=state.payments.filter(p=>String(p.date||'')===t).reduce((a,p)=>a+Number(p.amount||0),0);
  const invoicesDueToday=state.invoices.filter(i=>invoiceBalance(i)>0 && String(i.dueDate||'')===t);
  const purchasesDueToday=state.purchases.filter(p=>purchaseBalance(p)>0 && String(p.dueDate||'')===t);
  return {t,tomorrow,f,o,q,todayServices,tomorrowServices,weekServices,pendingInvoices,overdueInvoices,pendingPurchases,overduePurchases,paymentsToday,invoicesDueToday,purchasesDueToday};
}
function greetingText(){
  const h=new Date().getHours();
  if(h<12) return 'Buenos días.';
  if(h<18) return 'Buenas tardes.';
  return 'Buenas noches.';
}
function businessHealth(stats){
  let score=100;
  score-=Math.min(40,stats.overdueInvoices.length*12);
  score-=Math.min(25,stats.overduePurchases.length*10);
  if(stats.o.payrollDue>0) score-=15;
  if(stats.f.receivable>0 && stats.f.paid>0 && stats.f.receivable>stats.f.paid) score-=10;
  if(score>=80) return {label:'Excelente',icon:'🟢',className:'ok'};
  if(score>=55) return {label:'Atención',icon:'🟡',className:'warn'};
  return {label:'Crítico',icon:'🔴',className:'danger'};
}
function industryQuickActions(){
  const base=[['clients','+ Cliente'],['services','+ Servicio'],['quotes','+ Cotización'],['billing','+ Factura'],['payments','+ Cobro'],['purchases','+ Compra'],['team','+ Empleado']];
  const specific={
    hvac:[['services','Nuevo mantenimiento'],['services','Nueva instalación']],
    transport:[['services','Nueva ruta'],['services','Nuevo viaje']],
    salon:[['services','Nueva cita'],['clients','Nuevo cliente']],
    construction:[['services','Nuevo proyecto'],['purchases','Nueva compra']],
    cleaning:[['services','Nueva limpieza'],['clients','Nuevo cliente']],
    handyman:[['services','Nuevo trabajo'],['purchases','Nueva compra']]
  }[profile().industry]||[];
  return [...specific,...base].filter(([v])=>!lockedModule(v)).slice(0,8);
}
function recentActivity(){
  const rows=[];
  state.clients.slice(-3).forEach(x=>rows.push({date:x.createdAt?.seconds||x.date||'',text:`Cliente creado: ${x.name}`,view:'clients'}));
  state.services.slice(-4).forEach(x=>rows.push({date:x.createdAt?.seconds||x.date||'',text:`Servicio: ${x.clientName} · ${serviceTitle(x)} · ${money(serviceAmount(x))}`,view:'services'}));
  state.quotes.slice(-4).forEach(x=>rows.push({date:x.createdAt?.seconds||x.date||'',text:`Cotización: ${x.number} · ${x.clientName} · ${money(quoteTotals(x).total)}`,view:'quotes'}));
  state.invoices.slice(-4).forEach(x=>rows.push({date:x.createdAt?.seconds||x.date||'',text:`Factura: ${x.number} · ${x.clientName} · ${money(x.total)}`,view:'billing'}));
  state.payments.slice(-4).forEach(x=>rows.push({date:x.createdAt?.seconds||x.date||'',text:`Cobro recibido: ${x.invoiceNumber} · ${money(x.amount)}`,view:'payments'}));
  state.purchases.slice(-3).forEach(x=>rows.push({date:x.createdAt?.seconds||x.date||'',text:`Compra: ${x.supplierName||''} · ${money(x.total)}`,view:'purchases'}));
  return rows.slice(-8).reverse();
}
function renderNexusDaily(){
  const s=businessDayStats();
  const h=businessHealth(s);
  const p=profile();
  const goal=Number(p.dailyGoal||1000);
  const progress=goal>0?Math.min(100,(s.paymentsToday/goal)*100):0;
  if($('coachGreeting')) $('coachGreeting').textContent=T(greetingText());
  if($('coachSummary')) $('coachSummary').textContent=`${p.businessName||'Nexus'} · ${new Date().toLocaleDateString('es-PR',{weekday:'long',month:'short',day:'numeric'})}`;
  if($('businessHealth')){$('businessHealth').className=`health-badge ${h.className}`;$('businessHealth').textContent=`${h.icon} ${T(h.label)}`;}
  if($('dailyDate')) $('dailyDate').textContent=new Date().toLocaleDateString('es-PR');
  if($('dailyStrip')) $('dailyStrip').innerHTML=[
    ['Servicios',s.todayServices.length,'services'],['Cotizaciones',s.q.open,'quotes'],['Potencial COT',money(s.q.openValue),'quotes'],['Cobros',money(s.paymentsToday),'payments'],['Facturas',s.pendingInvoices.length,'billing'],['Compras',s.pendingPurchases.length,'purchases'],['Nómina',money(s.o.payrollDue),'payroll']
  ].filter(([_,__,v])=>!lockedModule(v)).map(([a,b,v])=>`<button class="daily-card" type="button" data-daily-view="${v}"><span>${T(a)}</span><b>${esc(b)}</b></button>`).join('');
  document.querySelectorAll('[data-daily-view]').forEach(b=>b.onclick=()=>show(b.dataset.dailyView));
  if($('myDayList')) $('myDayList').innerHTML=[
    ['Servicios de hoy',`${s.todayServices.length}`,s.todayServices.length?'services':''],
    ['Cotizaciones abiertas',`${s.q.open} · ${money(s.q.openValue)}`,s.q.open?'quotes':''],
    ['Facturas vencidas',`${s.overdueInvoices.length}`,s.overdueInvoices.length?'billing':''],
    ['Cobros recibidos hoy',money(s.paymentsToday),'payments'],
    ['Compras por pagar',`${s.pendingPurchases.length}`,s.pendingPurchases.length?'purchases':''],
    ['Nómina pendiente',money(s.o.payrollDue),s.o.payrollDue>0?'payroll':'']
  ].map(([a,b,v])=>`<button class="day-row" type="button" ${v?`data-day-view="${v}"`:''}><span>${T(a)}</span><b>${esc(b)}</b></button>`).join('');
  document.querySelectorAll('[data-day-view]').forEach(b=>b.onclick=()=>show(b.dataset.dayView));
  if($('dailyGoalBox')) $('dailyGoalBox').innerHTML=`<div class="goal-main"><span>${T('Meta')}</span><strong>${money(goal)}</strong></div><div class="goal-main"><span>${T('Cobrado')}</span><strong>${money(s.paymentsToday)}</strong></div><div class="goal-bar"><i style="width:${progress}%"></i></div><small>${Math.round(progress)}% ${T('completado')}</small>`;
  if($('goalStatus')) $('goalStatus').textContent=progress>=100?T('Completado'):T('En progreso');
  if($('priorityList')){
    const priorities=[];
    if(s.overdueInvoices.length) priorities.push(['danger','Facturas vencidas',`${s.overdueInvoices.length} · ${money(s.overdueInvoices.reduce((a,i)=>a+invoiceBalance(i),0))}`,'billing']);
    if(s.invoicesDueToday.length) priorities.push(['warn','Facturas vencen hoy',`${s.invoicesDueToday.length}`,'billing']);
    if(s.overduePurchases.length) priorities.push(['danger','Compras vencidas',`${s.overduePurchases.length}`,'purchases']);
    if(s.o.payrollDue>0) priorities.push(['warn','Nómina pendiente',money(s.o.payrollDue),'payroll']);
    if(!priorities.length) priorities.push(['ok','Operación al día','Sin pendientes críticos','dashboard']);
    $('priorityList').innerHTML=priorities.map(([cls,a,b,v])=>`<button class="priority-item ${cls}" type="button" data-priority-view="${v}"><span>${T(a)}</span><b>${esc(b)}</b></button>`).join('');
    document.querySelectorAll('[data-priority-view]').forEach(b=>b.onclick=()=>show(b.dataset.priorityView));
  }
  if($('quickActions')) $('quickActions').innerHTML=industryQuickActions().map(([v,l])=>`<button type="button" data-quick-view="${v}">${T(l)}</button>`).join('');
  document.querySelectorAll('[data-quick-view]').forEach(b=>b.onclick=()=>show(b.dataset.quickView));
  if($('recentList')){const r=recentActivity();$('recentList').innerHTML=r.length?r.map(x=>`<button class="activity-item" type="button" data-activity-view="${x.view}">${esc(T(x.text))}</button>`).join(''):'<p class="muted">Sin actividad.</p>';document.querySelectorAll('[data-activity-view]').forEach(b=>b.onclick=()=>show(b.dataset.activityView));}
}


function agendaItems(){
  const items=[];
  state.services.filter(x=>x.date && x.date>=today()).forEach(x=>items.push({date:x.date,type:'Servicio',title:`${x.clientName||'Cliente'} · ${serviceTitle(x)}`,view:'services'}));
  state.invoices.filter(x=>invoiceBalance(x)>0 && x.dueDate).forEach(x=>items.push({date:x.dueDate,type:'Factura',title:`${x.number} · ${x.clientName} · ${money(invoiceBalance(x))}`,view:'billing'}));
  state.purchases.filter(x=>purchaseBalance(x)>0 && x.dueDate).forEach(x=>items.push({date:x.dueDate,type:'Compra',title:`${x.number||x.concept} · ${x.supplierName} · ${money(purchaseBalance(x))}`,view:'purchases'}));
  state.payrollRetentions.filter(x=>retentionStatus(x)==='Pendiente' && x.dueDate).forEach(x=>items.push({date:x.dueDate,type:'Retención',title:`${x.destination||x.type} · ${money(retentionAmount(x))}`,view:'payroll'}));
  state.payroll.filter(x=>x.date).slice(-8).forEach(x=>items.push({date:x.date,type:'Nómina',title:`${x.teamName} · ${money(x.net)}`,view:'payroll'}));
  return items.sort((a,b)=>String(a.date).localeCompare(String(b.date))).slice(0,8);
}
function globalSearchResults(q){
  const term=String(q||'').toLowerCase().trim();
  if(!term) return [];
  const hit=(...v)=>v.join(' ').toLowerCase().includes(term);
  const rows=[];
  state.clients.forEach(x=>hit(x.name,x.phone,x.email,x.city,x.tags)&&rows.push({type:'Cliente',title:x.name,meta:[x.phone,x.city].filter(Boolean).join(' · '),view:'clients'}));
  state.services.forEach(x=>hit(x.clientName,serviceTitle(x),x.assetName,x.status)&&rows.push({type:'Servicio',title:`${x.clientName} · ${serviceTitle(x)}`,meta:[x.date,money(serviceAmount(x))].join(' · '),view:'services'}));
  state.quotes.forEach(x=>hit(x.number,x.clientName,x.title,quoteStatus(x))&&rows.push({type:'Cotización',title:`${x.number} · ${x.clientName}`,meta:`${quoteStatus(x)} · ${money(quoteTotals(x).total)}`,view:'quotes'}));
  state.invoices.forEach(x=>hit(x.number,x.clientName,x.serviceTitle,invoiceStatus(x))&&rows.push({type:'Factura',title:`${x.number} · ${x.clientName}`,meta:`${invoiceStatus(x)} · ${money(invoiceBalance(x))}`,view:'billing'}));
  state.assets.forEach(x=>hit(assetName(x),x.clientName,assetCategory(x),assetLocation(x),assetStatus(x))&&rows.push({type:'Activo',title:assetName(x),meta:[x.clientName,assetStatus(x)].filter(Boolean).join(' · '),view:'assets'}));
  state.team.forEach(x=>hit(x.name,x.role,x.phone,x.email,x.personalId,cleanSSN(x.ssn).slice(-4))&&rows.push({type:'Empleado',title:x.name,meta:[x.role,x.status,maskSSN(x.ssn)].filter(Boolean).join(' · '),view:'team'}));
  state.suppliers.forEach(x=>hit(x.name,x.phone,x.email,x.category)&&rows.push({type:'Suplidor',title:x.name,meta:[x.category,money(supplierBalance(x.id))].join(' · '),view:'suppliers'}));
  return rows.slice(0,10);
}
function renderGlobalSearch(){
  const input=$('globalSearch');
  const box=$('globalResults');
  if(!input || !box) return;
  const q=input.value||'';
  const rows=globalSearchResults(q);
  box.innerHTML=q.trim()? (rows.length?rows.map(r=>`<button class="search-hit" type="button" data-search-view="${esc(r.view)}"><b>${esc(r.type)}</b><span>${esc(r.title)}</span><small>${esc(r.meta||'')}</small></button>`).join(''):'<p class="muted">Sin resultados.</p>') : '<p class="muted">Busca clientes, facturas, servicios, activos, empleados o suplidores.</p>';
  document.querySelectorAll('[data-search-view]').forEach(b=>b.onclick=()=>show(b.dataset.searchView));
}
function controlCenter(){
  const f=financialSummary(), o=operationalSummary(), q=quoteSummary();
  if($('controlStrip')) $('controlStrip').innerHTML=[
    ['Cotizaciones abiertas',q.open,'quotes'],
    ['Potencial COT',money(q.openValue+q.approvedValue),'quotes'],
    ['Por cobrar',money(f.receivable),'billing'],
    ['Vencido',money(f.overdue),'billing'],
    ['Por pagar',money(o.purchaseDebt),'purchases'],
    ['Nómina',money(o.payrollDue),'payroll'],
    ['Obligaciones',money(obligationSummary().total),'payroll']
  ].map(([a,b,v])=>`<button class="control-card" type="button" data-control-view="${v}"><span>${T(a)}</span><b>${b}</b></button>`).join('');
  document.querySelectorAll('[data-control-view]').forEach(b=>b.onclick=()=>show(b.dataset.controlView));
  if($('agendaList')){const ag=agendaItems();$('agendaList').innerHTML=ag.length?ag.map(x=>`<button class="agenda-item" type="button" data-agenda-view="${esc(x.view)}"><b>${esc(x.date)}</b><span>${esc(x.type)}</span><small>${esc(x.title)}</small></button>`).join(''):'<p class="muted">Sin eventos próximos.</p>';document.querySelectorAll('[data-agenda-view]').forEach(b=>b.onclick=()=>show(b.dataset.agendaView));}
  renderGlobalSearch();
  renderFinancialHub();
}

function enforceModuleView(){const active=state.activeView||'dashboard';document.querySelectorAll('.main > section.view').forEach(view=>{const ok=view.id===active;view.classList.toggle('active',ok);view.hidden=!ok;view.setAttribute('aria-hidden',ok?'false':'true');view.style.display=ok?'block':'none';view.style.visibility=ok?'visible':'hidden';view.style.height=ok?'auto':'0px';view.style.overflow=ok?'visible':'hidden';});}
function show(v){state.activeView=lockedModule(v)?'plans':(v||'dashboard');render();if(innerWidth<921)document.querySelector('.sidebar')?.classList.remove('open');}
function openBilling(filter='all', search=''){
  state.billingFilter = filter || 'all';
  state.billingSearch = search || '';
  show('billing');
  setTimeout(()=>{
    const q=$('billingSearch'); if(q) q.value=state.billingSearch||'';
    const f=$('billingFilter'); if(f) f.value=state.billingFilter||'all';
  },50);
}
function clearBillingFilter(){state.billingFilter='all';state.billingSearch='';renderBillingTable();}
function openDashboardAction(view, filter=''){
  if(view==='billing') return openBilling(filter||'all','');
  if(view==='quotes') state.quoteDashboardFilter=filter||'';
  show(view||'dashboard');
}

function latestPlanRequest(){
  return [...(state.planRequests||[])]
    .filter(r => r.status === 'pending' && normalizePlanId(r.planId) !== currentPlanId())
    .sort((a,b)=>String(b.createdAt?.seconds||b.createdAt||'').localeCompare(String(a.createdAt?.seconds||a.createdAt||'')))[0]||null;
}
function pendingPlanRequest(planId){
  const target = normalizePlanId(planId);
  if(target === currentPlanId()) return null;
  return (state.planRequests||[]).find(r=>normalizePlanId(r.planId)===target && r.status==='pending') || null;
}
function hasAnyPendingPlanRequest(){return !!latestPlanRequest();}
function activePlanName(){return plan().name;}
function planRequestStatusText(){const r=latestPlanRequest();if(!r)return 'Sin solicitudes pendientes';return `Solicitud pendiente: ${PLANS[normalizePlanId(r.planId)]?.name||r.planName||r.planId}`;}
function notifyOwnerByEmail(req){const subject=encodeURIComponent(`Solicitud de plan ${req.planName} - ${profile().businessName||'Cliente Nexus'}`);const body=encodeURIComponent(`Nueva solicitud de cambio de plan.

Negocio: ${profile().businessName||''}
Email usuario: ${auth.currentUser?.email||profile().email||''}
Plan actual: ${activePlanName()}
Plan solicitado: ${req.planName}
Modo: ${req.paymentMode}
UID: ${uid()}

Acción requerida: confirma el pago y activa el plan desde admin.html.`);window.open(`mailto:${ownerEmail()}?subject=${subject}&body=${body}`,'_blank');}
async function requestPlanChange(planId){
  const targetId = normalizePlanId(planId);
  const target = PLANS[targetId];
  if(!target) return;
  if(targetId === currentPlanId()){
    alert('Ese plan ya está activo.');
    return;
  }
  if(hasAnyPendingPlanRequest()){
    alert('Ya existe una solicitud pendiente. Espera aprobación o rechazo antes de solicitar otro plan.');
    return;
  }
  const paymentUrl = links()[targetId] || '';
  const req = {
    planId:targetId,
    planName:target.name,
    fromPlan:currentPlanId(),
    fromPlanName:activePlanName(),
    businessName:profile().businessName||'',
    userEmail:auth.currentUser?.email||profile().email||'',
    uid:uid(),
    status:'pending',
    paymentMode:paymentUrl?'stripe_or_manual':'manual_review',
    paymentUrl,
    createdAt:serverTimestamp(),
    updatedAt:serverTimestamp()
  };
  await setDoc(profRef(),{pendingPlan:targetId,pendingPlanName:target.name,pendingPlanStatus:'pending',pendingPlanRequestedAt:serverTimestamp()},{merge:true});
  await addDoc(colPath('planRequests'),req);
  if(paymentUrl){window.open(paymentUrl,'_blank');}
  notifyOwnerByEmail({...req, planName:target.name});
  alert(paymentUrl?'Solicitud registrada. Se abrió el enlace de pago. El plan se activa después de confirmarse el pago.':'Solicitud registrada. El dueño activará el plan después de confirmar el pago.');
}
function setVisuals(){const p=profile(), ind=industry(); if(p.plan!==currentPlanId()) p.plan=currentPlanId(); document.documentElement.style.setProperty('--brand',p.primaryColor||ind.color);document.documentElement.style.setProperty('--brand2',p.secondaryColor||'#0f172a');$('sideLogo').innerHTML=imgOrText(p.logoDashboard,ind.logo);$('dashboardLogo').innerHTML=imgOrText(p.logoDashboard,ind.logo);$('sideLogo').classList.toggle('has-logo',!!p.logoDashboard);$('dashboardLogo').classList.toggle('has-logo',!!p.logoDashboard);const authLogoEl=$('authLogo'); if(authLogoEl){authLogoEl.innerHTML='<img src="assets/logo.png" alt="Nexus Business PR">';}$('sideName').textContent=p.businessName||'Nexus Business';$('sideIndustry').textContent=ind.name;$('dashboardTitle').textContent=p.businessName||ind.name;$('dashboardText').textContent=p.slogan||'';$('faviconLink').href=p.favicon||$('faviconLink').href;$('planBadge').textContent=isTopPlan()?'👑 Plan Enterprise Activo':plan().name;$('sidePlan').innerHTML=isTopPlan()?'👑 Enterprise Activo':plan().name;$('sideQuota').textContent=isTopPlan()?'Funciones y registros ilimitados':`${state.clients.length}/${unlimited(limit('clients'))?'∞':limit('clients')} ${T('clientes')}`;const upgrade=$('sideUpgrade');if(upgrade){upgrade.hidden=isTopPlan();upgrade.disabled=isTopPlan();upgrade.setAttribute('aria-hidden',isTopPlan()?'true':'false');}}
function nav(){const ind=industry();$('sideNav').innerHTML=ind.nav.map(v=>`<button type="button" data-view="${v}" class="${state.activeView===v?'active':''} ${lockedModule(v)?'locked':''}">${T(TITLES[v]||v)}<span>${lockedModule(v)?'🔒':''}</span></button>`).join('');document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>show(b.dataset.view));}
function input(label,id,type='text',val='',cls='',step=''){const extra=type==='number'?(step?` step="${step}" min="0"`:' step="0.01" min="0"'):'';return `<div class="${cls}"><label>${esc(label)}</label><input id="${id}" type="${type}" value="${esc(val)}" placeholder="${esc(label)}"${extra}></div>`;}
function select(label,id,opts,val='',cls=''){return `<div class="${cls}"><label>${esc(label)}</label><select id="${id}">${opts.map(o=>`<option value="${esc(o.value)}" ${String(o.value)===String(val)?'selected':''}>${esc(o.label)}</option>`).join('')}</select></div>`;}
function table(head,rows){return `<div class="table-wrap"><table><thead><tr>${head.map(h=>`<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>${rows.length?rows.join(''):`<tr><td colspan="${head.length}" class="muted">Sin registros.</td></tr>`}</tbody></table></div>`;}
function action(c,id){return `<div class="actions"><button data-edit="${c}:${id}" type="button">Editar</button><button class="danger" data-del="${c}:${id}" type="button">Borrar</button></div>`;}


function quoteSummary(){
  const quotes=state.quotes||[];
  const ym=today().slice(0,7);
  const converted=quotes.filter(q=>q.convertedInvoiceId || q.convertedServiceId || String(q.status||'')==='Convertida');
  const open=quotes.filter(q=>['Borrador','Enviada'].includes(quoteStatus(q)));
  const approved=quotes.filter(q=>quoteStatus(q)==='Aprobada' && !q.convertedInvoiceId);
  const expired=quotes.filter(q=>quoteStatus(q)==='Vencida');
  const rejected=quotes.filter(q=>quoteStatus(q)==='Rechazada');
  const month=quotes.filter(q=>String(q.date||q.createdAt?.seconds||'').slice(0,7)===ym);
  const value=quotes.reduce((a,q)=>a+quoteTotals(q).total,0);
  const monthValue=month.reduce((a,q)=>a+quoteTotals(q).total,0);
  const openValue=open.reduce((a,q)=>a+quoteTotals(q).total,0);
  const approvedValue=approved.reduce((a,q)=>a+quoteTotals(q).total,0);
  const convertedValue=converted.reduce((a,q)=>a+quoteTotals(q).total,0);
  const conversionRate=quotes.length?Math.round((converted.length/quotes.length)*100):0;
  return {total:quotes.length,month:month.length,open:open.length,approved:approved.length,expired:expired.length,rejected:rejected.length,converted:converted.length,value,monthValue,openValue,approvedValue,convertedValue,conversionRate};
}

function quoteTotals(q){
  const subtotal = Number(q?.subtotal ?? serviceItemsTotal(q?.items||[]) ?? 0);
  const taxPercentValue = Number(q?.taxPercent ?? profile().tax ?? 0);
  const ivu = Number(q?.ivu ?? (subtotal * (taxPercentValue/100)));
  const total = Number(q?.total ?? (subtotal + ivu));
  return {subtotal, ivu, total, taxPercent:taxPercentValue};
}
function quoteStatus(q){
  if(!q) return 'Borrador';
  if(q.convertedInvoiceId || q.convertedServiceId || String(q.status||'')==='Convertida') return 'Convertida';
  if(q.validUntil && String(q.validUntil)<today() && !['Aprobada','Rechazada'].includes(String(q.status||''))) return 'Vencida';
  if(q.status) return q.status;
  return 'Borrador';
}
function quoteNumber(){return 'COT-'+new Date().getFullYear()+'-'+String(Date.now()).slice(-6);}
function quoteCanConvert(q){return q && !q.convertedServiceId && !q.convertedInvoiceId && ['Aprobada','Enviada','Borrador'].includes(quoteStatus(q));}
function quoteCanInvoice(q){return q && !q.convertedInvoiceId && ['Aprobada','Enviada','Borrador','Convertida'].includes(quoteStatus(q));}
function quoteItemsFallback(q){return (q?.items&&q.items.length)?q.items:[{description:q?.title||'Servicio profesional',qty:1,price:Number(q?.subtotal||0)}];}
function serviceTitle(s){
  return s?.title || (Array.isArray(s?.items) && s.items[0]?.description) || industry().service;
}
function serviceItemsTotal(items){
  return (items || []).reduce((a,it)=>a+(Number(it.qty||1)*Number(it.price||0)),0);
}
function taxPercent(){
  return Math.max(0, Number(profile().tax || 0));
}
function taxRate(){
  return taxPercent() / 100;
}
function serviceSubtotal(s){
  const itemsTotal = serviceItemsTotal(s.items || []);
  return itemsTotal > 0 ? itemsTotal : Number(s.amount || 0);
}
function invoiceTotalsFromService(s){
  const subtotal = serviceSubtotal(s);
  const ivu = subtotal * taxRate();
  return { subtotal, ivu, total: subtotal + ivu, taxPercent: taxPercent() };
}
function invoiceTotals(inv){
  const subtotal = Number(inv.subtotal ?? ((inv.items && inv.items.length) ? serviceItemsTotal(inv.items) : Number(inv.total || 0)));
  const ivu = Number(inv.ivu ?? 0);
  const total = Number(inv.total ?? (subtotal + ivu));
  return { subtotal, ivu, total, taxPercent: Number(inv.taxPercent ?? profile().tax ?? 0) };
}
function serviceAmount(s){
  return serviceSubtotal(s);
}
function itemRowsHtml(items){
  const arr = (items && items.length) ? items : [{description:'',qty:1,price:''}];
  return arr.map((it,idx)=>`<div class="service-line" data-service-line>
    <div class="line-number">${idx+1}</div>
    <input class="svc-desc" placeholder="Descripción del servicio / partida" value="${esc(it.description||'')}">
    <input class="svc-qty" type="number" step="0.01" min="0" placeholder="Cant." value="${esc(it.qty ?? 1)}">
    <input class="svc-price" type="number" step="0.01" min="0" placeholder="Precio" value="${esc(it.price ?? '')}">
    <button class="danger mini" data-remove-line type="button">×</button>
  </div>`).join('');
}
function getServiceItems(){
  const box=$('serviceItemsBox');
  if(!box) return [];
  return [...box.querySelectorAll('[data-service-line]')].map(row=>({
    description: row.querySelector('.svc-desc')?.value.trim() || '',
    qty: Number(row.querySelector('.svc-qty')?.value || 1),
    price: Number(row.querySelector('.svc-price')?.value || 0)
  })).filter(it=>it.description || it.price > 0);
}
function updateServiceTotal(){
  const total = serviceItemsTotal(getServiceItems());
  const amount = $('sAmount');
  const badge = $('sItemsTotal');
  if (badge) badge.textContent = money(total);
  if (amount && total > 0) amount.value = total.toFixed(2);
}
function bindServiceItems(){
  const addBtn = $('addServiceLine');
  if (!addBtn) return;
  addBtn.onclick = () => {
    const box = $('serviceItemsBox');
    box.insertAdjacentHTML('beforeend', itemRowsHtml([{description:'',qty:1,price:''}]));
    bindServiceItems();
    updateServiceTotal();
  };
  $('serviceItemsBox')?.querySelectorAll('[data-remove-line]').forEach(btn=>btn.onclick=()=>{
    const rows = $('serviceItemsBox')?.querySelectorAll('[data-service-line]') || [];
    if(rows.length > 1) btn.closest('[data-service-line]').remove();
    else btn.closest('[data-service-line]').querySelectorAll('input').forEach((i,idx)=>i.value=idx===1?'1':'');
    updateServiceTotal();
  });
  $('serviceItemsBox')?.querySelectorAll('.svc-desc,.svc-qty,.svc-price').forEach(el=>el.oninput=updateServiceTotal);
  updateServiceTotal();
}


function getQuoteItems(){
  const box=$('quoteItemsBox'); if(!box) return [];
  return [...box.querySelectorAll('[data-service-line]')].map(row=>({description:row.querySelector('.svc-desc')?.value.trim()||'',qty:Number(row.querySelector('.svc-qty')?.value||1),price:Number(row.querySelector('.svc-price')?.value||0)})).filter(it=>it.description || it.price>0);
}
function updateQuoteTotal(){
  const subtotal=serviceItemsTotal(getQuoteItems());
  const badge=$('qItemsTotal');
  if(badge) badge.textContent=money(subtotal + subtotal*taxRate());
}
function bindQuoteItems(){
  const addBtn=$('addQuoteLine'), box=$('quoteItemsBox');
  if(!addBtn || !box) return;
  addBtn.onclick=()=>{box.insertAdjacentHTML('beforeend', itemRowsHtml([{description:'',qty:1,price:''}])); bindQuoteItems(); updateQuoteTotal();};
  box.querySelectorAll('[data-remove-line]').forEach(btn=>btn.onclick=()=>{const rows=box.querySelectorAll('[data-service-line]'); if(rows.length>1) btn.closest('[data-service-line]').remove(); else btn.closest('[data-service-line]').querySelectorAll('input').forEach((i,idx)=>i.value=idx===1?'1':''); updateQuoteTotal();});
  box.querySelectorAll('.svc-desc,.svc-qty,.svc-price').forEach(el=>el.oninput=updateQuoteTotal);
  updateQuoteTotal();
}
function normalizeLineItems(items){
  return (items&&items.length?items:[{description:'',qty:1,price:''}]).map(it=>{
    if(Array.isArray(it)){ const [description,qty,price]=it; return {description,qty,price}; }
    return {description:it?.description||'', qty:it?.qty ?? 1, price:it?.price ?? ''};
  });
}
function setServiceItems(items){
  const box=$('serviceItemsBox');
  if(!box) return;
  box.innerHTML=itemRowsHtml(normalizeLineItems(items));
  bindServiceItems();
}
function setQuoteItems(items){
  const box=$('quoteItemsBox');
  if(!box) return;
  box.innerHTML=itemRowsHtml(normalizeLineItems(items));
  bindQuoteItems();
}

function resetServiceEditMode(){
  state.editingServiceId=null;
  const btn=$('serviceSubmitBtn'); if(btn) btn.textContent='Guardar';
  const cancel=$('cancelServiceEdit'); if(cancel) cancel.classList.add('hidden');
  const banner=$('serviceEditBanner'); if(banner) banner.classList.add('hidden');
}

function resetQuoteEditMode(){
  state.editingQuoteId=null;
  const btn=$('quoteSubmitBtn'); if(btn) btn.textContent='Guardar cotización';
  const cancel=$('cancelQuoteEdit'); if(cancel) cancel.classList.add('hidden');
  const banner=$('quoteEditBanner'); if(banner) banner.classList.add('hidden');
}
function fillQuoteForm(q){
  if(!q) return;
  if($('qClient')) $('qClient').value=q.clientId||'';
  if($('qAsset')) $('qAsset').value=q.assetId||'';
  if($('qTeam')) $('qTeam').value=q.teamId||'';
  if($('qDate')) $('qDate').value=q.date||today();
  if($('qValid')) $('qValid').value=q.validUntil||plusDays(15);
  if($('qStatus')){
    const st=quoteStatus(q)||'Borrador';
    if(![...$('qStatus').options].some(o=>o.value===st)) $('qStatus').insertAdjacentHTML('beforeend',`<option value="${esc(st)}">${esc(st)}</option>`);
    $('qStatus').value=st;
  }
  if($('qPriority')) $('qPriority').value=q.priority||'Normal';
  if($('qServiceType')){
    const val=q.serviceType||q.title||serviceOptions()[0]||'';
    if(val && ![...$('qServiceType').options].some(o=>o.value===val)) $('qServiceType').insertAdjacentHTML('beforeend',`<option value="${esc(val)}">${esc(val)}</option>`);
    $('qServiceType').value=val;
  }
  if($('qTitle')) $('qTitle').value=q.title||'';
  if($('qNotes')) $('qNotes').value=q.notes||'';
  if($('qTerms')) $('qTerms').value=q.terms||'Precios válidos hasta la fecha indicada. Aprobación requerida para iniciar servicio.';
  setQuoteItems(quoteItemsFallback(q));
}
function startQuoteEdit(id){
  const q=state.quotes.find(x=>x.id===id);
  if(!q) return alert('No se encontró la cotización.');
  show('quotes');
  state.editingQuoteId=id;
  fillQuoteForm(q);
  const btn=$('quoteSubmitBtn'); if(btn) btn.textContent='Actualizar cotización';
  const cancel=$('cancelQuoteEdit'); if(cancel) cancel.classList.remove('hidden');
  const banner=$('quoteEditBanner');
  if(banner){ banner.classList.remove('hidden'); banner.innerHTML=`Editando <b>${esc(q.number||'Cotización')}</b>. Puedes cambiar cliente, estado, partidas, notas y términos.`; }
  $('quoteForm')?.scrollIntoView({behavior:'smooth',block:'start'});
}
async function editQuoteRecord(id){
  startQuoteEdit(id);
}

function fillServiceForm(s){
  if(!s) return;
  if($('sClient')) $('sClient').value=s.clientId||'';
  if($('sAsset')) $('sAsset').value=s.assetId||'';
  if($('sTeam')) $('sTeam').value=s.teamId||'';
  if($('sDate')) $('sDate').value=s.date||today();
  if($('sStatus')) $('sStatus').value=s.status||'Pendiente';
  if($('sPriority')) $('sPriority').value=s.priority||'Normal';
  if($('sServiceType')){
    const val=s.serviceType||serviceTitle(s)||serviceOptions()[0]||'';
    if(val && ![...$('sServiceType').options].some(o=>o.value===val)){
      $('sServiceType').insertAdjacentHTML('beforeend',`<option value="${esc(val)}">${esc(val)}</option>`);
    }
    $('sServiceType').value=val;
  }
  if($('sTitle')) $('sTitle').value=s.title||serviceTitle(s)||'';
  if($('sAmount')) $('sAmount').value=Number(s.amount ?? serviceSubtotal(s) ?? 0).toFixed(2);
  (s.fields||[]).forEach((v,n)=>{ const el=$('sF'+n); if(el) el.value=v||''; });
  if(isTransport()){
    const r=s.route||transportRouteFromService(s)||{};
    if($('sOrigin')) $('sOrigin').value=r.origin||'';
    if($('sDestination')) $('sDestination').value=r.destination||'';
    if($('sRouteMiles')) $('sRouteMiles').value=r.miles??'';
    if($('sRouteRate')) $('sRouteRate').value=r.rate??(profile().transportRatePerMile||'2.50');
    if($('sRouteBase')) $('sRouteBase').value=r.base??(profile().transportBaseCharge||'0');
    updateTransportTotal();
  }
  setServiceItems((s.items&&s.items.length)?s.items:[{description:serviceTitle(s),qty:1,price:s.amount||0}]);
  updateServiceTotal();
}
function startServiceEdit(id){
  const s=state.services.find(x=>x.id===id);
  if(!s) return;
  state.editingServiceId=id;
  show('services');
  setTimeout(()=>{
    fillServiceForm(s);
    const btn=$('serviceSubmitBtn'); if(btn) btn.textContent='Actualizar servicio';
    const cancel=$('cancelServiceEdit'); if(cancel) cancel.classList.remove('hidden');
    const banner=$('serviceEditBanner'); if(banner){ banner.textContent=`Editando: ${serviceTitle(s)} · ${s.clientName||''}`; banner.classList.remove('hidden'); }
    $('serviceForm')?.scrollIntoView({behavior:'smooth',block:'start'});
  },0);
}
function bindServiceProductivity(){
  const dup=$('duplicateLastService');
  if(dup) dup.onclick=()=>{
    const last=[...state.services].sort((a,b)=>String(b.createdAt?.seconds||b.date||'').localeCompare(String(a.createdAt?.seconds||a.date||'')))[0];
    if(!last) return alert('No hay servicios para duplicar.');
    if($('sClient')) $('sClient').value=last.clientId||'';
    if($('sAsset')) $('sAsset').value=last.assetId||'';
    if($('sTeam')) $('sTeam').value=last.teamId||'';
    if($('sServiceType')) $('sServiceType').value=last.serviceType||serviceOptions()[0];
    if($('sTitle')) $('sTitle').value=serviceTitle(last);
    if($('sStatus')) $('sStatus').value='Pendiente';
    if($('sPriority')) $('sPriority').value=last.priority||'Normal';
    (last.fields||[]).forEach((v,n)=>{const el=$('sF'+n); if(el) el.value=v||'';});
    if(last.route){if($('sOrigin')) $('sOrigin').value=last.route.origin||'';if($('sDestination')) $('sDestination').value=last.route.destination||'';if($('sRouteMiles')) $('sRouteMiles').value=last.route.miles||'';if($('sRouteRate')) $('sRouteRate').value=last.route.rate||'';if($('sRouteBase')) $('sRouteBase').value=last.route.base||'';}
    setServiceItems((last.items||[]).map(it=>[it.description,it.qty,it.price]));
    updateTransportTotal();
  };
}
function serviceItemsText(s){
  const items = s.items || [];
  if(items.length) return items.map(it=>`${it.qty || 1} × ${it.description || 'Servicio'} · ${money(it.price || 0)}`).join('<br>');
  return (s.fields||[]).map(esc).join(' · ');
}
function limitText(c){const l=limit(c);return unlimited(l)?`${(state[c]||[]).length}/∞`:`${(state[c]||[]).length}/${l}`;}
function limits(){['clients','services','quotes','followups','team','assets','suppliers','supplierPayments','payroll','invoices','payments','cashflow'].forEach(c=>{const el=$(c+'Limit');if(el)el.textContent=`Uso: ${limitText(c)}`;});}


let currentDemoIndustry='';
async function addDemoRecord(col, data){
  return await addDoc(colPath(col), {...data, demo:true, demoIndustry:currentDemoIndustry, createdAt:serverTimestamp(), updatedAt:serverTimestamp()});
}
async function clearDemoData(industryId=''){
  if(!uid()) return;
  const demoCols = ['clients','services','quotes','followups','team','assets','suppliers','supplierPayments','payroll','payrollRetentions','purchases','invoices','payments','cashflow','planRequests'];
  const id=String(industryId||'').toLowerCase();
  for(const c of demoCols){
    const snap = await getDocs(colPath(c));
    await Promise.all(snap.docs.filter(d=>{
      const x=d.data()||{};
      const docIndustry=String(x.demoIndustry||x.industry||'').toLowerCase();
      const num=String(x.number||'').toLowerCase();
      if(!id) return x.demo===true || num.includes('demo');
      return (x.demo===true && docIndustry===id) || num.includes(`demo-${id}`);
    }).map(d=>deleteDoc(d.ref)));
  }
}
function demoTotals(items){
  const subtotal = serviceItemsTotal(items || []);
  const ivu = subtotal * taxRate();
  return {subtotal, ivu, total:subtotal+ivu, taxPercent:taxPercent()};
}
async function loadIndustryDemo(industryId){
  const demo = DEMOS[industryId];
  if(!demo) return alert('Demo no disponible.');
  currentDemoIndustry=industryId;
  const selectedPlan = currentPlanId();
  await setDoc(profRef(),{
    businessName:demo.business,
    slogan:demo.slogan,
    industry:industryId,
    primaryColor:demo.color,
    plan:selectedPlan,
    demoIndustryLoaded:industryId,
    demoLoadedAt:serverTimestamp(),
    updatedAt:serverTimestamp()
  },{merge:true});

  const clients=[];
  for(const c of demo.clients){
    const ref=await addDemoRecord('clients',{name:c[0],phone:c[1],email:c[2],city:c[3],address:c[4]});
    clients.push({id:ref.id,name:c[0]});
  }
  const team=[];
  for(const t of demo.team){
    const ref=await addDemoRecord('team',{name:t[0],phone:t[1],rate:t[2],retention:t[3],role:t[4]});
    team.push({id:ref.id,name:t[0],rate:t[2]});
  }
  const assets=[];
  for(let i=0;i<demo.assets.length;i++){
    const a=demo.assets[i], c=clients[i%clients.length];
    const ref=await addDemoRecord('assets',{clientId:c.id,clientName:c.name,industry:industryId,name:a[0],category:a[1],location:a[2],status:a[3],value:a[4],date:today(),warranty:a[5],notes:a[6]});
    assets.push({id:ref.id,name:a[0],clientId:c.id,clientName:c.name});
  }
  const suppliers=[];
  for(const sp of demo.suppliers){
    const ref=await addDemoRecord('suppliers',{name:sp[0],phone:sp[1],email:sp[2],openingBalance:sp[3],fields:['Demo','Activo','30 días','']});
    suppliers.push({id:ref.id,name:sp[0],openingBalance:sp[3]});
  }
  for(let i=0;i<suppliers.length;i++){
    const sp=suppliers[i], subtotal=Math.round(Number(sp.openingBalance||0)*0.75*100)/100, tax=Math.round(subtotal*0.115*100)/100, total=subtotal+tax;
    await addDemoRecord('purchases',{supplierId:sp.id,supplierName:sp.name,date:daysAgo(14+i),dueDate:plusDays(10+i),concept:'Compra demo operacional',reference:`PO-DEMO-${industryId.toUpperCase()}-${String(i+1).padStart(3,'0')}`,number:`PO-DEMO-${industryId.toUpperCase()}-${String(i+1).padStart(3,'0')}`,subtotal,tax,total,status:i===0?'Parcial':'Pendiente',note:'Compra demo'});
  }
  const services=[];
  for(let i=0;i<demo.services.length;i++){
    const sv=demo.services[i], c=clients[i%clients.length], t=team[i%team.length], a=assets[i%assets.length];
    const demoRoute = industryId==='transport' ? [
      {origin:'San Juan, Puerto Rico',destination:'Caguas, Puerto Rico',miles:22.4,rate:Number(profile().transportRatePerMile||2.50),base:Number(profile().transportBaseCharge||0)},
      {origin:'Bayamón, Puerto Rico',destination:'Arecibo, Puerto Rico',miles:45.8,rate:Number(profile().transportRatePerMile||2.50),base:Number(profile().transportBaseCharge||0)},
      {origin:'Guaynabo, Puerto Rico',destination:'Ponce, Puerto Rico',miles:73.6,rate:Number(profile().transportRatePerMile||2.50),base:Number(profile().transportBaseCharge||0)}
    ][i%3] : null;
    if(demoRoute) demoRoute.total = demoRoute.base + (demoRoute.miles * demoRoute.rate);
    const ref=await addDemoRecord('services',{clientId:c.id,clientName:c.name,assetId:a.id,assetName:a.name,teamId:t.id,teamName:t.name,date:daysAgo(18-i*4),serviceType:sv[0],title:sv[2],amount:demoRoute?demoRoute.total:sv[1],items:sv[3],fields:industryId==='transport'?[sv[0],'Demo']: [sv[0],a.name,'Demo','Completado','Notas administrativas'],route:demoRoute});
    services.push({id:ref.id,clientId:c.id,clientName:c.name,title:sv[2],items:sv[3]});
  }
  const invoices=[];
  for(let i=0;i<services.length;i++){
    const sv=services[i], totals=demoTotals(sv.items), number=`INV-DEMO-${industryId.toUpperCase()}-${String(i+1).padStart(3,'0')}`;
    const ref=await addDemoRecord('invoices',{number,date:daysAgo(15-i*3),dueDate:plusDays(15-i*3),serviceId:sv.id,clientId:sv.clientId,clientName:sv.clientName,serviceTitle:sv.title,items:sv.items,fields:[],subtotal:totals.subtotal,ivu:totals.ivu,taxPercent:totals.taxPercent,total:totals.total,status:i===0?'Pagada':'Pendiente'});
    invoices.push({id:ref.id,number,total:totals.total});
  }
  for(let i=0;i<invoices.length;i++){
    const inv=invoices[i];
    const amount=i===0?inv.total:Math.round(inv.total*0.45*100)/100;
    await addDemoRecord('payments',{invoiceId:inv.id,invoiceNumber:inv.number,date:daysAgo(10-i*2),method:i===0?'Tarjeta':'ATH Móvil',amount,note:'Cobro demo'});
    await addDemoRecord('cashflow',{date:daysAgo(10-i*2),type:'Ingreso',concept:`Cobro ${inv.number}`,amount});
  }
  for(let i=0;i<suppliers.length;i++){
    const sp=suppliers[i], amount=Math.round(sp.openingBalance*0.55*100)/100;
    await addDemoRecord('supplierPayments',{supplierId:sp.id,supplierName:sp.name,date:daysAgo(7+i),method:'Transferencia',amount,note:'Pago demo suplidor'});
    await addDemoRecord('cashflow',{date:daysAgo(7+i),type:'Gasto',concept:`Pago suplidor ${sp.name}`,amount});
  }
  for(let i=0;i<team.length;i++){
    const gross=team[i].rate?320+i*80:0;
    if(gross>0){
      const deductions=Math.round(gross*0.05*100)/100, net=gross-deductions;
      await addDemoRecord('payroll',{teamId:team[i].id,teamName:team[i].name,date:daysAgo(5+i),period:'Semana demo',gross,bonus:0,retention:deductions,advance:0,deductions:0,totalDeductions:deductions,net,method:'ATH Móvil',note:'Pago demo'});
      await addDemoRecord('cashflow',{date:daysAgo(5+i),type:'Gasto',concept:`Nómina ${team[i].name}`,amount:net});
    }
  }
  currentDemoIndustry='';
  alert('Demo cargado.');
  show('dashboard');
}
async function cleanDemoFromSettings(){
  const id=profile().industry||'hvac';
  if(!confirm('¿Borrar demo?')) return;
  await clearDemoData(id);
  await setDoc(profRef(),{demoIndustryLoaded:'',demoLoadedAt:null,updatedAt:serverTimestamp()},{merge:true});
  alert('Demo borrado.');
}
function bindDemoSettings(){
  const load=$('loadDemoBtn'); if(load) load.onclick=async()=>{
    const id=profile().industry||'hvac';
    await clearDemoData(id);
    await loadIndustryDemo(id);
  };
  const clean=$('cleanDemoBtn'); if(clean) clean.onclick=cleanDemoFromSettings;
}


// ===== V67 IMPORTADOR MASIVO DE CONTACTOS =====
let clientImportRows=[];
function importKey(v){return String(v||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]/g,'');}
function firstImportValue(row,aliases){const keyed={};Object.entries(row||{}).forEach(([k,v])=>keyed[importKey(k)]=v);for(const alias of aliases){const v=keyed[importKey(alias)];if(v!==undefined&&v!==null&&String(v).trim()!=='')return String(v).trim();}return '';}
function splitImportTags(v){return String(v||'').split(/[,;|]/).map(x=>x.trim()).filter(Boolean).slice(0,20);}
function normalizeImportedClient(row){
  const name=firstImportValue(row,['name','nombre','full name','display name','first name','given name','company','organization','nombre completo']);
  const phone=firstImportValue(row,['phone','telefono','teléfono','mobile','movil','móvil','contact','contacto','phone 1 - value','primary phone']);
  const email=firstImportValue(row,['email','correo','e-mail','email 1 - value','primary email']);
  const city=firstImportValue(row,['city','municipio','ciudad','address 1 - city']);
  const address=firstImportValue(row,['address','direccion','dirección','addr','street','address 1 - formatted','address 1 - street']);
  const altName=firstImportValue(row,['altname','contacto alterno','secondary contact']);
  const altPhone=firstImportValue(row,['altphone','telefono alterno','phone 2 - value']);
  const altEmail=firstImportValue(row,['altemail','email alterno','email 2 - value']);
  const tags=splitImportTags(firstImportValue(row,['tags','etiquetas','group membership','categories','categoria','categoría']));
  const notes=firstImportValue(row,['notes','nota','notas','note','comments']);
  const status=firstImportValue(row,['status','estado']);
  return {name,phone,email,city,address,altName,altPhone,altEmail,tags,notes,status};
}
function parseDelimitedContacts(text){
  if(window.XLSX){const wb=XLSX.read(String(text||''),{type:'string'}),ws=wb.Sheets[wb.SheetNames[0]];return XLSX.utils.sheet_to_json(ws,{defval:''});}
  const lines=String(text||'').trim().split(/\r?\n/);if(!lines.length)return[];const d=lines[0].includes('\t')?'\t':',';const h=lines.shift().split(d);return lines.map(line=>Object.fromEntries(line.split(d).map((v,i)=>[h[i]||`col${i+1}`,v])));
}
function parseVcardContacts(text){return String(text||'').split(/END:VCARD/i).map(card=>{const get=(re)=>(card.match(re)||[])[1]||'';return {name:get(/\nFN[^:]*:([^\r\n]+)/i)||get(/\nN[^:]*:([^\r\n]+)/i).replace(/;/g,' '),phone:get(/\nTEL[^:]*:([^\r\n]+)/i),email:get(/\nEMAIL[^:]*:([^\r\n]+)/i),address:get(/\nADR[^:]*:([^\r\n]+)/i).replace(/;/g,' '),notes:get(/\nNOTE[^:]*:([^\r\n]+)/i)};}).filter(x=>x.name||x.phone||x.email);}
async function parseClientImportFile(file){
  const ext=(file.name.split('.').pop()||'').toLowerCase();
  if(['xlsx','xls'].includes(ext)){const buf=await file.arrayBuffer(),wb=XLSX.read(buf,{type:'array'}),ws=wb.Sheets[wb.SheetNames[0]];return XLSX.utils.sheet_to_json(ws,{defval:''});}
  const text=await file.text();
  if(ext==='json'){const j=JSON.parse(text);return Array.isArray(j)?j:(j.db?.clients||j.data?.clients||j.clients||[]);}
  if(ext==='vcf')return parseVcardContacts(text);
  return parseDelimitedContacts(text);
}
function clientDuplicate(row){const phone=String(row.phone||'').replace(/\D/g,''),email=String(row.email||'').trim().toLowerCase(),name=String(row.name||'').trim().toLowerCase();return state.clients.find(c=>(phone&&String(c.phone||'').replace(/\D/g,'')===phone)||(email&&String(c.email||'').trim().toLowerCase()===email)||(name&&String(c.name||'').trim().toLowerCase()===name));}
function renderClientImportPreview(raw){
  clientImportRows=(raw||[]).map(normalizeImportedClient).filter(x=>x.name||x.phone||x.email);
  const preview=$('clientImportPreview'),summary=$('clientImportSummary'),commit=$('commitClientImport');if(!preview||!summary||!commit)return;
  const dup=clientImportRows.filter(clientDuplicate).length,invalid=clientImportRows.filter(x=>!x.name).length;
  summary.textContent=`${clientImportRows.length} contactos detectados · ${dup} posibles duplicados · ${invalid} sin nombre.`;
  preview.innerHTML=table(['Nombre','Teléfono','Email','Municipio','Resultado'],clientImportRows.slice(0,25).map(r=>`<tr><td>${esc(r.name||'Sin nombre')}</td><td>${esc(r.phone)}</td><td>${esc(r.email)}</td><td>${esc(r.city)}</td><td>${clientDuplicate(r)?'<span class="tag">Duplicado</span>':'<span class="status-chip">Nuevo</span>'}</td></tr>`))+(clientImportRows.length>25?`<p class="muted">Vista previa de 25 de ${clientImportRows.length} contactos.</p>`:'');
  commit.disabled=!clientImportRows.length;
}
async function commitClientImport(){
  if(!clientImportRows.length)return;const mode=$('clientImportMode')?.value||'skip';const created=[],updated=[];let skipped=0,failed=0;
  $('commitClientImport').disabled=true;$('clientImportSummary').textContent='Importando contactos...';
  for(const row of clientImportRows){
    try{if(!row.name){skipped++;continue;}const duplicate=clientDuplicate(row);const data={...row,tags:row.tags||[],importedAt:new Date().toISOString(),importSource:'bulk-contact-import'};
      if(duplicate&&mode==='skip'){skipped++;continue;}
      if(duplicate&&mode==='update'){await updateDoc(docPath('clients',duplicate.id),{...data,updatedAt:serverTimestamp()});updated.push(duplicate.id);continue;}
      const ref=await add('clients',data);if(ref?.id)created.push(ref.id);else failed++;
    }catch(e){console.error('Import contact',e);failed++;}
  }
  localStorage.setItem('nexusLastClientImport',JSON.stringify({created,updated,at:new Date().toISOString()}));
  clientImportRows=[];$('clientImportPreview').innerHTML='';$('commitClientImport').disabled=true;$('clientImportSummary').textContent=`Importación completada: ${created.length} creados, ${updated.length} actualizados, ${skipped} omitidos, ${failed} con error.`;
}
async function undoLastClientImport(){
  const last=JSON.parse(localStorage.getItem('nexusLastClientImport')||'null');if(!last?.created?.length){alert('No hay una importación reciente que se pueda deshacer.');return;}if(!confirm(`¿Eliminar ${last.created.length} contactos creados en la última importación? Los contactos actualizados no se eliminarán.`))return;
  for(const id of last.created){try{await deleteDoc(docPath('clients',id));}catch(e){console.error(e);}}
  localStorage.removeItem('nexusLastClientImport');alert('Última importación deshecha.');
}
function bindClientImporter(){
  const read=$('readClientImport'),analyze=$('analyzeClientPaste'),commit=$('commitClientImport'),undo=$('undoClientImport');
  if(read)read.onclick=async()=>{const file=$('clientImportFile')?.files?.[0];if(!file){alert('Selecciona un archivo.');return;}try{renderClientImportPreview(await parseClientImportFile(file));}catch(e){alert('No se pudo leer el archivo: '+(e.message||e));}};
  if(analyze)analyze.onclick=()=>{const text=$('clientImportPaste')?.value||'';if(!text.trim()){alert('Pega contactos o filas desde Excel.');return;}try{renderClientImportPreview(text.includes('BEGIN:VCARD')?parseVcardContacts(text):parseDelimitedContacts(text));}catch(e){alert('No se pudo analizar el texto: '+(e.message||e));}};
  if(commit)commit.onclick=commitClientImport;if(undo)undo.onclick=undoLastClientImport;
}

function forms(){const i=industry();
  $('clientsTitle').textContent=i.clients;$('servicesTitle').textContent=i.services;if($('quotesTitle'))$('quotesTitle').textContent='Cotizaciones Pro';if($('followupsTitle'))$('followupsTitle').textContent='Seguimiento';$('teamTitle').textContent=i.team;$('assetsTitle').textContent=i.assets;$('payrollTitle').textContent=i.payroll;$('suppliersTitle').textContent=i.suppliers;$('supplierPaymentsTitle').textContent=i.supplierPayments;
  $('clientForm').innerHTML=input('Nombre','cName')+input('Teléfono','cPhone')+input('Email','cEmail')+input('Municipio','cCity')+input('Dirección completa','cAddress','text','','wide')+input('Referencia / instrucciones de acceso','cAccessNotes','text','','wide')+input('Enlace GPS opcional','cGpsUrl','url','','wide')+input('Contacto alterno','cAltName')+input('Tel. alterno','cAltPhone')+input('Email alterno','cAltEmail')+clientTagsSelectHtml('cTags','VIP')+input('Notas administrativas','cNotes','text','','wide')+'<button class="primary" type="submit">Guardar</button>';
  $('serviceForm').innerHTML=select(i.client,'sClient',state.clients.map(c=>({value:c.id,label:c.name})))+select('Activo relacionado','sAsset',[{value:'',label:'Sin activo'}].concat(state.assets.map(a=>({value:a.id,label:assetLabel(a)}))),'')+select(i.team,'sTeam',state.team.map(t=>({value:t.id,label:t.name})))+input('Fecha','sDate','date',today())+select('Estado','sStatus',[{value:'Pendiente',label:'Pendiente'},{value:'En proceso',label:'En proceso'},{value:'Completado',label:'Completado'},{value:'Facturado',label:'Facturado'}],'Pendiente')+select('Prioridad','sPriority',[{value:'Normal',label:'Normal'},{value:'Alta',label:'Alta'},{value:'Urgente',label:'Urgente'}],'Normal')+select('Servicio','sServiceType',serviceOptions().map(x=>({value:x,label:x})))+input('Descripción principal','sTitle','text','','wide')+input('Monto facturado','sAmount','number')+transportRouteFormHtml()+i.serviceFields.map((f,n)=>input(f,'sF'+n,'text','','wide')).join('')+`<div id="serviceEditBanner" class="wide edit-banner hidden"></div><div class="wide service-lines-card"><div class="line-head"><div><b>Partidas</b></div><strong id="sItemsTotal">$0.00</strong></div><div id="serviceItemsBox">${itemRowsHtml()}</div><button id="addServiceLine" class="ghost" type="button">+ Añadir servicio</button></div><div class="wide form-actions"><button id="serviceSubmitBtn" class="primary" type="submit">Guardar</button><button id="cancelServiceEdit" class="ghost hidden" type="button">Cancelar edición</button></div>`;
  if($('quoteForm')) $('quoteForm').innerHTML=select(i.client,'qClient',state.clients.map(c=>({value:c.id,label:c.name})))+select('Activo relacionado','qAsset',[{value:'',label:'Sin activo'}].concat(state.assets.map(a=>({value:a.id,label:assetLabel(a)}))),'')+select(i.team,'qTeam',[{value:'',label:'Sin asignar'}].concat(state.team.map(t=>({value:t.id,label:t.name}))))+input('Fecha','qDate','date',today())+input('Válida hasta','qValid','date',plusDays(15))+select('Estado','qStatus',['Borrador','Enviada','Aprobada','Rechazada','Convertida'].map(x=>({value:x,label:x})),'Borrador')+select('Prioridad','qPriority',['Normal','Alta','Urgente'].map(x=>({value:x,label:x})),'Normal')+select('Servicio','qServiceType',serviceOptions().map(x=>({value:x,label:x})))+input('Descripción profesional','qTitle','text','','wide')+input('Notas','qNotes','text','','wide')+input('Términos','qTerms','text','Precios válidos hasta la fecha indicada. Aprobación requerida para iniciar servicio.','wide')+`<div id="quoteEditBanner" class="wide edit-banner hidden"></div><div class="wide service-lines-card quote-lines-card"><div class="line-head"><div><b>Partidas de cotización</b><small class="muted">Servicio, materiales, mano de obra y extras.</small></div><strong id="qItemsTotal">$0.00</strong></div><div id="quoteItemsBox">${itemRowsHtml()}</div><button id="addQuoteLine" class="ghost" type="button">+ Añadir partida</button></div><div class="wide form-actions"><button id="quoteSubmitBtn" class="primary" type="submit">Guardar cotización</button><button id="cancelQuoteEdit" class="ghost hidden" type="button">Cancelar edición</button></div>`;
  $('teamForm').innerHTML=input('Nombre','tName')+input('Teléfono','tPhone')+input('Email','tEmail')+input('Identificación personal ID','tPersonalId')+input('Seguro Social','tSsn','text','','','')+input('Licencia de conducir','tDriverLicense')+select('Vehículo asignado','tAssignedVehicle',[{value:'',label:'Sin vehículo'}].concat(vehicleAssetOptions().map(a=>({value:a.id,label:assetLabel(a)}))))+input('Puesto / Rol','tRole')+select('Estado','tStatus',['Activo','Inactivo','Contratista'].map(x=>({value:x,label:x})))+input('Salario base','tSalary','number','0')+input('% Comisión','tRate','number','0')+input('% Retención','tRetention','number','0')+input('Fecha ingreso','tStart','date',today())+'<button class="primary" type="submit">Guardar</button>';
  $('assetForm').innerHTML=select('Cliente asignado','aClient',[{value:'',label:'Sin cliente'}].concat(state.clients.map(c=>({value:c.id,label:c.name}))))+input('Nombre del activo','aName')+select('Categoría','aCategory',['Equipo','Vehículo','Herramienta','Mobiliario','Infraestructura','Tecnología','Inventario Especial','Otro'].map(x=>({value:x,label:x})))+input('Marca','aBrand')+input('Modelo','aModel')+input('Número de serie','aSerial')+input('Ubicación','aLocation')+select('Estado','aStatus',['Activo','En uso','En garantía','Requiere mantenimiento','Fuera de servicio','Inactivo','Baja'].map(x=>({value:x,label:x})))+input('Valor estimado','aValue','number')+input('Fecha de registro','aDate','date',today())+input('Fecha de compra','aPurchaseDate','date')+input('Caducidad del activo/documento','aExpiration','date')+input('Vencimiento de garantía','aWarrantyExpiration','date')+input('Próximo mantenimiento','aNextMaintenance','date')+input('Garantía / vigencia','aWarranty','text','','wide')+input('Notas administrativas','aNotes','text','','wide')+'<button class="primary" type="submit">Guardar activo</button>';
  $('supplierForm').innerHTML=input('Nombre suplidor','supName')+input('Teléfono','supPhone')+input('WhatsApp','supWhatsapp')+input('Email','supEmail')+input('Contacto','supContact')+input('Categoría','supCategory')+input('Límite crédito','supCredit','number','0')+input('Balance inicial / deuda','supOpening','number','0')+i.supplierFields.map((f,n)=>input(f,'supF'+n,'text','','wide')).join('')+'<button class="primary" type="submit">Guardar suplidor</button>';
  $('supplierPaymentForm').innerHTML=select('Suplidor','spSupplier',state.suppliers.map(s=>({value:s.id,label:`${s.name} · balance ${money(supplierBalance(s.id))}`})))+select('Compra relacionada','spPurchase',[{value:'',label:'Pago general · aplicar automáticamente a compras antiguas'}].concat(state.purchases.filter(p=>purchaseBalance(p)>0).map(p=>({value:p.id,label:`${p.number||p.concept} · ${p.supplierName} · ${money(purchaseBalance(p))}`}))))+input('Fecha','spDate','date',today())+select('Método','spMethod',['ATH Móvil','Stripe','PayPal','Transferencia','Cheque','Efectivo','Tarjeta'].map(x=>({value:x,label:x})))+input('Monto','spAmount','number')+input('Nota','spNote','text','','wide')+'<button class="primary" type="submit">Registrar pago</button><button id="reconcileSupplierPayments" type="button">Reconciliar pagos generales existentes</button>';
  $('payrollForm').innerHTML=select(i.team,'prTeam',state.team.map(t=>({value:t.id,label:`${t.name} · balance ${money(teamBalance(t.id))} · ret. ${money(teamRetention(t.id))}`})))+input('Fecha','prDate','date',today())+input('Periodo','prPeriod','text')+input('Horas','prHours','number','0')+input('Horas extra','prOvertime','number','0')+input('Bruto','prGross','number')+input('Bonos / comisiones','prBonus','number','0')+input('Retenciones','prRetention','number','0')+select('Tipo retención','prRetentionType',retentionTypeOptions().map(x=>({value:x,label:x})))+input('Entidad / destino retención','prRetentionDest','text','Departamento de Hacienda')+input('Fecha límite retención','prRetentionDue','date',plusDays(15))+input('Adelantos','prAdvance','number','0')+input('Otros descuentos','prDeductions','number','0')+select('Método','prMethod',['ATH Móvil','Transferencia','Cheque','Efectivo','Tarjeta'].map(x=>({value:x,label:x})))+input('Nota','prNote','text','','wide')+'<button class="primary" type="submit">Registrar pago de nómina</button>';
  $('purchaseForm').innerHTML=select('Suplidor','puSupplier',state.suppliers.map(s=>({value:s.id,label:s.name})))+input('Fecha','puDate','date',today())+input('Vence','puDue','date',plusDays(15))+input('Concepto','puConcept')+input('Referencia / factura','puRef')+input('Subtotal','puSubtotal','number')+input('IVU / impuestos','puTax','number','0')+select('Estado','puStatus',['Pendiente','Parcial','Pagada','Vencida','Cancelada'].map(x=>({value:x,label:x})))+input('Notas','puNote','text','','wide')+'<button class="primary" type="submit">Registrar compra</button>';
  $('paymentForm').innerHTML=select('Factura','pInvoice',state.invoices.filter(inv=>invoiceStatus(inv)!=='Cancelada' && invoiceBalance(inv)>0).map(inv=>({value:inv.id,label:`${inv.number} · ${inv.clientName} · balance ${money(invoiceBalance(inv))}`})))+input('Fecha','pDate','date',today())+select('Método','pMethod',['ATH Móvil','Stripe','PayPal','Transferencia','Cheque','Efectivo','Tarjeta'].map(x=>({value:x,label:x})))+input('Monto','pAmount','number')+input('Nota','pNote','text','','wide')+'<button class="primary" type="submit">Registrar cobro</button>';
  $('cashForm').innerHTML=input('Fecha','xDate','date',today())+select('Tipo','xType',[{value:'Ingreso',label:'Ingreso'},{value:'Gasto',label:'Gasto'}])+input('Concepto','xConcept')+input('Monto','xAmount','number')+'<button class="primary" type="submit">Guardar movimiento</button>';
  const p=profile();$('settingsForm').innerHTML=`<div><label>${T('Industria')}</label><select id="set_industry">${Object.entries(INDUSTRIES).map(([id,x])=>`<option value="${id}" ${p.industry===id?'selected':''}>${T(x.name)}</option>`).join('')}</select></div><div><label>${T('Idioma')}</label><select id="set_language"><option value="es" ${(p.language||'es')==='es'?'selected':''}>Español</option><option value="en" ${(p.language||'es')==='en'?'selected':''}>English</option></select></div><div><label>${T('Plan activo')}</label><input value="${esc(activePlanName())}" disabled></div><div><label>Estado</label><input value="${esc(planRequestStatusText())}" disabled></div><div class="wide"><label>Servicios de esta industria</label><textarea id="set_services" rows="5" placeholder="Un servicio por línea">${esc(serviceOptions().join('\n'))}</textarea></div>`+input('Nombre comercial','set_businessName','text',p.businessName)+input('Eslogan','set_slogan','text',p.slogan)+input('Teléfono','set_phone','text',p.phone)+input('WhatsApp','set_whatsapp','text',p.whatsapp)+input('Email','set_email','text',p.email)+input('Website','set_web','text',p.web)+input('Dirección','set_address','text',p.address,'wide')+input('Registro comerciante','set_merchant','text',p.merchant)+input('Representante','set_representative','text',p.representative)+input('IVU %','set_tax','number',p.tax)+input('Meta diaria','set_dailyGoal','number',p.dailyGoal||'1000')+(p.industry==='transport'?input('Tarifa por milla','set_transportRatePerMile','number',p.transportRatePerMile||'2.50')+input('Cargo base ruta','set_transportBaseCharge','number',p.transportBaseCharge||'0'):'')+input('Color primario','set_primaryColor','color',p.primaryColor)+input('Color secundario','set_secondaryColor','color',p.secondaryColor)+`<div><label>Logo Dashboard</label><input id="set_logoDashboard" type="file" accept="image/*"><small class="muted">Actual: ${p.logoDashboard?'cargado':'sin logo'}</small></div><div><label>Logo PDF</label><input id="set_logoPdf" type="file" accept="image/*"><small class="muted">Actual: ${p.logoPdf?'cargado':'sin logo'}</small></div><div><label>Favicon</label><input id="set_favicon" type="file" accept="image/*"><small class="muted">Actual: ${p.favicon?'cargado':'sin favicon'}</small></div><div><label>Firma digital</label><input id="set_signature" type="file" accept="image/*"><small class="muted">Actual: ${p.signature?'cargada':'sin firma'}</small></div><div class="wide data-settings calendar-settings"><h3>Calendario y agenda</h3><p class="muted">Selecciona el calendario activo. El Dashboard y los mensajes de Seguimiento usarán este enlace automáticamente.</p><div class="form-grid"><div><label>Proveedor activo</label><select id="set_calendarProvider"><option value="confirmafy" ${(p.calendarProvider||'confirmafy')==='confirmafy'?'selected':''}>Confirmafy</option><option value="google" ${(p.calendarProvider||'confirmafy')==='google'?'selected':''}>Google Calendar</option></select></div><div><label>Enlace de Confirmafy</label><input id="set_confirmafyCalendarUrl" type="url" value="${esc(p.confirmafyCalendarUrl||OASIS_BOOKING_URL)}" placeholder="https://confirmafy.com/..."></div><div class="wide"><label>Enlace de Google Calendar</label><input id="set_googleCalendarUrl" type="url" value="${esc(p.googleCalendarUrl||'')}" placeholder="https://calendar.google.com/..."></div><div class="wide"><button id="testCalendarBtn" type="button">Abrir calendario configurado</button></div></div></div><div class="wide data-settings"><h3>Importar / Exportar</h3><p class="muted">Herramientas de respaldo, importación y mantenimiento de data. No elimina funciones del sistema.</p><div class="demo-buttons"><button id="exportBackupBtn" type="button">Exportar backup JSON</button><label class="file-action">Importar JSON<input id="importDataFile" type="file" accept="application/json,.json" hidden></label></div><small id="importDataStatus" class="muted"></small></div><div class="wide danger-zone"><h3>Zona peligrosa</h3><p class="muted">Borra toda la data de esta cuenta en Firebase. No borra el código ni la app publicada.</p><button id="wipeAllDataBtn" type="button" class="danger">Borrar toda la data de la app</button></div><div class="wide demo-settings"><h3>Demo</h3><div class="demo-buttons"><button id="loadDemoBtn" type="button" class="primary">Cargar demo</button><button id="cleanDemoBtn" type="button" class="danger">Borrar demo</button></div></div>`;
  limits();
  bindDemoSettings();
  bindClientImporter();
  bindDataSettings();
  const testCalendarBtn=$('testCalendarBtn'); if(testCalendarBtn) testCalendarBtn.onclick=()=>{const provider=$('set_calendarProvider')?.value||'confirmafy';const url=provider==='google'?$('set_googleCalendarUrl')?.value:$('set_confirmafyCalendarUrl')?.value;if(!String(url||'').trim()){alert('Escribe el enlace del calendario seleccionado.');return;}window.open(String(url).trim(),'_blank','noopener');};
}

function kpis(){
  const billed=sum(state.invoices,'total'), collected=sum(state.payments,'amount'), expenses=state.cashflow.filter(x=>x.type==='Gasto').reduce((a,x)=>a+Number(x.amount||0),0), payroll=sum(state.payroll,'net'), supp=sum(state.supplierPayments,'amount');
  const balances=state.invoices.reduce((a,inv)=>a+invoiceBalance(inv),0);
  const todayServices=state.services.filter(s=>s.date===today()).length;
  const completed=state.services.filter(s=>String(s.status||'').toLowerCase()==='completado').length;
  const ops=operationalSummary();
  const q=quoteSummary();
  const kpiCards=[
    {a:'Clientes',b:state.clients.length,view:'clients'},
    {a:'Servicios hoy',b:todayServices,view:'services'},
    {a:'Cotizaciones',b:q.total,view:'quotes'},
    {a:'COT mes',b:q.month,view:'quotes'},
    {a:'COT abiertas',b:q.open,view:'quotes'},
    {a:'COT aprobadas',b:q.approved,view:'quotes'},
    {a:'Potencial COT',b:money(q.openValue+q.approvedValue),view:'quotes'},
    {a:'Conversión COT',b:q.conversionRate+'%',view:'quotes'},
    {a:'Facturado',b:money(billed),view:'billing',filter:'all'},
    {a:'Cobrado',b:money(collected),view:'payments'},
    {a:'Balance por cobrar',b:money(balances),view:'billing',filter:'receivable'},
    {a:'Caja neta',b:money(collected-expenses),view:'cashflow'}
  ];
  $('kpis').innerHTML=kpiCards.map(x=>`<button type="button" class="kpi kpi-action" data-kpi-view="${esc(x.view)}" data-kpi-filter="${esc(x.filter||'')}"><span>${T(x.a)}</span><strong>${x.b}</strong><small>Ver acción</small></button>`).join('')+`<button type="button" class="kpi kpi-action calendar-kpi" id="dashboardCalendarBtn"><span>Calendario</span><strong>${esc(configuredCalendarLabel())}</strong><small>Ver calendario configurado</small></button>`;
  document.querySelectorAll('[data-kpi-view]').forEach(b=>b.onclick=()=>openDashboardAction(b.dataset.kpiView,b.dataset.kpiFilter||''));
  const dashboardCalendarBtn=$('dashboardCalendarBtn'); if(dashboardCalendarBtn) dashboardCalendarBtn.onclick=openConfiguredCalendar;
  const alerts=dashboardAlerts();
  if($('alertList')) $('alertList').innerHTML=alerts.length?alerts.map(x=>`<div class="alert-item">${esc(x)}</div>`).join(''):'<p class="muted">Sin alertas.</p>';
  if($('planExperience')) $('planExperience').innerHTML=isTopPlan()?`<div class="experience enterprise-active"><b>👑 Plan Enterprise Activo</b><span>${plan().features.map(T).join(' · ')}</span><div class="quota"><i style="width:100%"></i></div><small>Todos los módulos y límites están desbloqueados.</small></div>`:`<div class="experience"><b>${plan().badge}: ${plan().name}</b><span>${plan().features.map(T).join(' · ')}</span><div class="quota"><i style="width:${Math.min(100,(state.clients.length/(unlimited(limit('clients'))?Math.max(1,state.clients.length):limit('clients')))*100)}%"></i></div><button id="upgradeBtn" type="button">${T('Ver planes')}</button></div>`;
  $('upgradeBtn')&&($('upgradeBtn').onclick=()=>show('plans'));
  controlCenter();
}


function invoiceMatchesBillingFilter(inv){
  const st=invoiceStatus(inv);
  const bal=invoiceBalance(inv);
  const filter=state.billingFilter||'all';
  if(filter==='receivable') return bal>0 && st!=='Cancelada';
  if(filter==='overdue') return st==='Vencida';
  if(filter==='paid') return st==='Pagada';
  if(filter==='pending') return ['Pendiente','Vencida','Parcial'].includes(st) && bal>0;
  if(filter==='partial') return st==='Parcial';
  if(filter==='cancelled') return st==='Cancelada';
  return true;
}
function filteredBillingInvoices(){
  const q=String(state.billingSearch||'').toLowerCase().trim();
  return (state.invoices||[]).filter(inv=>{
    if(!invoiceMatchesBillingFilter(inv)) return false;
    if(!q) return true;
    const hay=[inv.number,inv.clientName,inv.serviceTitle,inv.quoteNumber,inv.status,inv.dueDate,inv.date]
      .map(x=>String(x||'').toLowerCase()).join(' ');
    return hay.includes(q);
  }).sort((a,b)=>String(b.date||'').localeCompare(String(a.date||'')) || String(b.number||'').localeCompare(String(a.number||'')));
}
function renderBillingTable(){
  const box=$('invoiceTable'); if(!box) return;
  const rows=filteredBillingInvoices();
  const allCount=(state.invoices||[]).length;
  const receivableTotal=rows.reduce((a,inv)=>a+invoiceBalance(inv),0);
  box.innerHTML=`<div class="billing-tools card-lite">
    <div class="toolbar">
      <input id="billingSearch" type="search" placeholder="Buscar por cliente, número de factura o servicio..." value="${esc(state.billingSearch||'')}">
      <select id="billingFilter">
        <option value="all" ${(state.billingFilter||'all')==='all'?'selected':''}>Todas</option>
        <option value="receivable" ${state.billingFilter==='receivable'?'selected':''}>Por cobrar</option>
        <option value="overdue" ${state.billingFilter==='overdue'?'selected':''}>Vencidas</option>
        <option value="pending" ${state.billingFilter==='pending'?'selected':''}>Pendientes</option>
        <option value="partial" ${state.billingFilter==='partial'?'selected':''}>Parciales</option>
        <option value="paid" ${state.billingFilter==='paid'?'selected':''}>Pagadas</option>
        <option value="cancelled" ${state.billingFilter==='cancelled'?'selected':''}>Canceladas</option>
      </select>
      <button id="clearBillingFilter" type="button">Limpiar</button>
    </div>
    <small class="muted">Mostrando ${rows.length} de ${allCount} facturas · Balance filtrado ${money(receivableTotal)}</small>
  </div>`+
  table(['Factura','Cliente','Vence','Total','Pagado','Balance','Estado','Acción'],rows.map(inv=>{const bal=invoiceBalance(inv),paid=invoicePaid(inv),st=invoiceStatus(inv);return `<tr><td><b>${esc(inv.number)}</b><br><span class="muted">${esc(inv.serviceTitle||'')}</span></td><td>${esc(inv.clientName)}</td><td>${esc(inv.dueDate||'—')}</td><td>${money(inv.total)}</td><td>${money(paid)}</td><td><b>${money(bal)}</b></td><td>${statusChip(st)}</td><td><div class="actions"><button data-prev-inv="${inv.id}" type="button">Preview</button><button data-dup-inv="${inv.id}" type="button">Duplicar</button>${st!=='Cancelada'?`<button class="danger" data-cancel-inv="${inv.id}" type="button">Cancelar</button>`:''}${action('invoices',inv.id)}</div></td></tr>`;}));
  const q=$('billingSearch'), f=$('billingFilter'), c=$('clearBillingFilter');
  if(q) q.oninput=()=>{state.billingSearch=q.value;renderBillingTable();setTimeout(()=>{$('billingSearch')?.focus(); const el=$('billingSearch'); if(el) el.setSelectionRange(el.value.length,el.value.length);},0);};
  if(f) f.onchange=()=>{state.billingFilter=f.value;renderBillingTable();};
  if(c) c.onclick=clearBillingFilter;
  document.querySelectorAll('[data-prev-inv]').forEach(b=>b.onclick=()=>previewInvoice(b.dataset.prevInv));
  document.querySelectorAll('[data-dup-inv]').forEach(b=>b.onclick=()=>duplicateInvoice(b.dataset.dupInv));
  document.querySelectorAll('[data-cancel-inv]').forEach(b=>b.onclick=()=>cancelInvoice(b.dataset.cancelInv));
  document.querySelectorAll('[data-del]').forEach(b=>b.onclick=()=>remove(...b.dataset.del.split(':')));
  document.querySelectorAll('[data-edit]').forEach(b=>b.onclick=()=>editRecord(...b.dataset.edit.split(':')));
}


function renderQuotesTable(){
  const box=$('quotesTable'); if(!box) return;
  box.innerHTML=table(['Cotización','Cliente','Válida','Total','Estado','Acción'],state.quotes.map(q=>{const t=quoteTotals(q), st=quoteStatus(q);return `<tr><td><b>${esc(q.number||'')}</b><br><span class="muted">${esc(q.title||q.serviceType||'')}</span></td><td>${esc(q.clientName||'')}</td><td>${esc(q.validUntil||'—')}</td><td>${money(t.total)}</td><td>${statusChip(st)}</td><td><div class="actions"><button data-prev-quote="${q.id}" type="button">Preview</button><button data-edit-quote="${q.id}" type="button">Editar</button>${quoteCanInvoice(q)?`<button data-invoice-quote="${q.id}" type="button">Convertir a factura</button>`:''}${quoteCanConvert(q)?`<button data-convert-quote="${q.id}" type="button">Crear servicio</button>`:''}<button class="danger" data-del="quotes:${q.id}" type="button">Borrar</button></div></td></tr>`;}));
  document.querySelectorAll('[data-prev-quote]').forEach(b=>b.onclick=()=>previewQuote(b.dataset.prevQuote));
  document.querySelectorAll('[data-edit-quote]').forEach(b=>b.onclick=()=>editQuoteRecord(b.dataset.editQuote));
  document.querySelectorAll('[data-convert-quote]').forEach(b=>b.onclick=()=>convertQuoteToService(b.dataset.convertQuote));
  document.querySelectorAll('[data-invoice-quote]').forEach(b=>b.onclick=()=>convertQuoteToInvoice(b.dataset.invoiceQuote));
}
async function convertQuoteToService(id){
  const q=state.quotes.find(x=>x.id===id); if(!q)return;
  if(!quoteCanConvert(q)) return alert('Esta cotización ya fue convertida o no está disponible.');
  if(!canCreate('services')){alert('Límite de servicios alcanzado.');show('plans');return;}
  const t=quoteTotals(q);
  const ref=await add('services',{clientId:q.clientId||'',clientName:q.clientName||'',assetId:q.assetId||'',assetName:q.assetName||'',teamId:q.teamId||'',teamName:q.teamName||'',date:today(),status:'Pendiente',priority:q.priority||'Normal',serviceType:q.serviceType||'',title:q.title||q.serviceType||'Servicio aprobado',amount:t.subtotal,items:quoteItemsFallback(q),fields:q.fields||[],quoteId:q.id,quoteNumber:q.number||''});
  if(ref?.id) await updateDoc(docPath('quotes',id),{status:'Convertida',convertedServiceId:ref.id,approvedAt:q.approvedAt||today(),updatedAt:serverTimestamp()});
  show('services');
}
async function convertQuoteToInvoice(id){
  const q=state.quotes.find(x=>x.id===id); if(!q)return;
  if(!quoteCanInvoice(q)) return alert('Esta cotización ya tiene factura o no está disponible.');
  if(!canCreate('invoices')){alert('Límite de facturas alcanzado.');show('plans');return;}
  const existing=state.invoices.find(inv=>inv.quoteId===q.id || inv.quoteNumber===q.number);
  if(existing){
    await updateDoc(docPath('quotes',id),{status:'Convertida',convertedInvoiceId:existing.id,updatedAt:serverTimestamp()});
    show('billing');
    alert('Esta cotización ya tenía factura. Te llevé a Facturación.');
    return;
  }
  const t=quoteTotals(q);
  const number='INV-'+String(Date.now()).slice(-7);
  const ref=await add('invoices',{
    number,
    date:today(),
    quoteId:q.id,
    quoteNumber:q.number||'',
    sourceType:'quote',
    serviceId:q.convertedServiceId||'',
    clientId:q.clientId||'',
    clientName:q.clientName||'',
    serviceTitle:q.title||q.serviceType||'Servicio cotizado',
    items:quoteItemsFallback(q),
    fields:q.fields||[],
    subtotal:t.subtotal,
    ivu:t.ivu,
    taxPercent:t.taxPercent,
    total:t.total,
    status:'Pendiente',
    dueDate:plusDays(15),
    notes:q.notes||'Factura generada desde cotización aprobada.',
    terms:q.terms||'Pago según acuerdo.'
  });
  if(ref?.id){
    await updateDoc(docPath('quotes',id),{status:'Convertida',convertedInvoiceId:ref.id,approvedAt:q.approvedAt||today(),updatedAt:serverTimestamp()});
    show('billing');
    alert('Factura creada desde la cotización. Ya está en Facturación lista para cobrar.');
  }else{
    show('billing');
  }
}


function directoryNormalize(value){return String(value||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,' ').trim();}
function clientFullAddress(c){return [c.address,c.city].map(x=>String(x||'').trim()).filter(Boolean).join(', ');}
function mapsUrl(c){
  const direct=String(c.gpsUrl||'').trim();
  if(direct) return direct;
  const address=clientFullAddress(c);
  return address ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}` : '';
}
function wazeUrl(c){const address=clientFullAddress(c);return address?`https://www.waze.com/ul?q=${encodeURIComponent(address)}&navigate=yes`:'';}
function directoryFilteredClients(){
  const q=directoryNormalize(state.directorySearch);
  return [...(state.clients||[])].filter(c=>{
    if(state.directoryFavoritesOnly && !c.directoryFavorite) return false;
    if(!q) return true;
    const hay=directoryNormalize([c.name,c.address,c.city,c.accessNotes,c.notes,c.phone,c.altName,c.altPhone,c.tags].join(' '));
    return q.split(' ').every(part=>hay.includes(part));
  }).sort((a,b)=>Number(!!b.directoryFavorite)-Number(!!a.directoryFavorite)||String(a.name||'').localeCompare(String(b.name||''),'es',{sensitivity:'base'}));
}
async function copyDirectoryAddress(id){
  const c=clientBy(id),text=clientFullAddress(c);if(!text)return alert('Este cliente no tiene dirección registrada.');
  try{if(navigator.clipboard&&window.isSecureContext){await navigator.clipboard.writeText(text);}else{const t=document.createElement('textarea');t.value=text;document.body.appendChild(t);t.select();document.execCommand('copy');t.remove();}alert('Dirección copiada.');}catch(e){prompt('Copia la dirección:',text);}
}
async function toggleDirectoryFavorite(id){const c=clientBy(id);if(!c.id)return;await updateDoc(docPath('clients',id),{directoryFavorite:!c.directoryFavorite,updatedAt:serverTimestamp()});}
function bindDirectoryControls(){const input=$('directorySearch');if(input&&!input.dataset.bound){input.dataset.bound='1';input.addEventListener('input',()=>{state.directorySearch=input.value;renderDirectory();});}const fav=$('directoryFavoritesOnly');if(fav&&!fav.dataset.bound){fav.dataset.bound='1';fav.addEventListener('change',()=>{state.directoryFavoritesOnly=fav.checked;renderDirectory();});}const clear=$('directoryClear');if(clear&&!clear.dataset.bound){clear.dataset.bound='1';clear.onclick=()=>{state.directorySearch='';state.directoryFavoritesOnly=false;if(input)input.value='';if(fav)fav.checked=false;renderDirectory();};}}
function renderDirectory(){
  const box=$('directoryList');if(!box)return;
  const rows=directoryFilteredClients();
  const input=$('directorySearch');if(input && input.value!==state.directorySearch)input.value=state.directorySearch||'';
  const fav=$('directoryFavoritesOnly');if(fav)fav.checked=!!state.directoryFavoritesOnly;
  const count=$('directoryCount');if(count)count.textContent=`${rows.length} cliente${rows.length===1?'':'s'}`;
  box.innerHTML=rows.length?rows.map(c=>{
    const address=clientFullAddress(c),map=mapsUrl(c),waze=wazeUrl(c),phone=String(c.phone||'').replace(/\D/g,'');
    return `<article class="directory-card"><div class="directory-card-main"><div class="directory-name-row"><button class="directory-star" type="button" data-directory-fav="${c.id}" title="Favorito">${c.directoryFavorite?'★':'☆'}</button><div><h3>${esc(c.name||'Cliente')}</h3>${c.tags?`<small class="muted">${esc(c.tags)}</small>`:''}</div></div><div class="directory-address">${address?`<strong>📍 ${esc(address)}</strong>`:'<span class="muted">Sin dirección registrada</span>'}</div>${c.accessNotes?`<div class="directory-access"><b>Referencia:</b> ${esc(c.accessNotes)}</div>`:''}${c.notes?`<div class="directory-note">${esc(c.notes)}</div>`:''}${c.phone?`<div class="directory-phone">Tel. ${esc(c.phone)}</div>`:''}</div><div class="directory-actions">${map?`<a class="primary button-link" href="${esc(map)}" target="_blank" rel="noopener">Google Maps</a>`:''}${waze?`<a class="button-link" href="${esc(waze)}" target="_blank" rel="noopener">Waze</a>`:''}${address?`<button type="button" data-directory-copy="${c.id}">Copiar dirección</button>`:''}${phone?`<a class="button-link" href="tel:${phone}">Llamar</a><a class="button-link" href="https://wa.me/${phone}" target="_blank" rel="noopener">WhatsApp</a>`:''}<button type="button" data-client-summary="${c.id}">Ver ficha</button></div></article>`;
  }).join(''):'<div class="empty-directory"><b>No encontramos clientes.</b><p>Prueba con otro nombre, calle, urbanización, pueblo o número de casa.</p></div>';
  box.querySelectorAll('[data-directory-copy]').forEach(b=>b.onclick=()=>copyDirectoryAddress(b.dataset.directoryCopy));
  box.querySelectorAll('[data-directory-fav]').forEach(b=>b.onclick=()=>toggleDirectoryFavorite(b.dataset.directoryFav));
  box.querySelectorAll('[data-client-summary]').forEach(b=>b.onclick=()=>showClientSummary(b.dataset.clientSummary));
}
function tables(){const i=industry();
  $('clientsTable').innerHTML=table(['Cliente','Contacto','Etiquetas','Historial','Acción'],state.clients.map(c=>{const cs=clientSummary(c);return `<tr><td><b>${esc(c.name)}</b><br><span class="muted">${esc(c.email)} · ${esc(c.city)}</span><br>${clientTagHtml(c)}</td><td>${esc(c.phone)}<br><span class="muted">${esc(c.altName||'')} ${c.altPhone?'· '+esc(c.altPhone):''}</span></td><td>${clientTagHtml(c)||'<span class="muted">Sin etiquetas</span>'}</td><td><b>${cs.assets}</b> activos · <b>${cs.services}</b> servicios<br><span class="muted">Balance ${money(cs.balance)}</span></td><td><div class="actions"><button data-client-summary="${c.id}" type="button">Ver historial</button><button data-client-portal="${c.id}" type="button">Portal</button>${action('clients',c.id)}</div></td></tr>`;}));
  renderDirectory();
  $('teamTable').innerHTML=table([i.team,'Información personal','Vehículo','Estado','Comisión','Nómina pagada','Balance','Acción'],state.team.map(t=>`<tr><td><b>${esc(t.name)}</b><br><span class="muted">${esc(t.role)} · ${esc(t.phone||'')}</span></td><td><span class="muted">ID: ${esc(t.personalId||'—')}</span><br><span class="muted">SSN: ${esc(maskSSN(t.ssn||t.socialSecurity||''))}</span><br><span class="muted">Lic.: ${esc(t.driverLicense||'—')}</span></td><td>${esc(t.assignedVehicleName||'Sin vehículo')}</td><td>${statusChip(t.status||'Activo')}</td><td>${money(teamCommission(t.id))}<br><span class="muted">Ret. ${money(teamRetention(t.id))}</span></td><td>${money(payrollPaid(t.id))}</td><td><b>${money(teamBalance(t.id))}</b></td><td>${action('team',t.id)}</td></tr>`));
  $('payrollTable').innerHTML=table(['Fecha',i.team,'Periodo','Bruto','Bonos','Retención / salida','Adelantos / otros','Neto','Acción'],state.payroll.map(p=>`<tr><td>${esc(p.date)}</td><td>${esc(p.teamName)}</td><td>${esc(p.period)}<br><span class="muted">${Number(p.hours||0)}h + ${Number(p.overtime||0)}h extra</span></td><td>${money(p.gross)}</td><td>${money(p.bonus)}</td><td>${money(payrollRetention(p))}<br><span class="muted">${esc(p.retentionType||'')} ${p.retentionDestination?'→ '+esc(p.retentionDestination):''}</span></td><td>${money(payrollAdvance(p)+payrollOtherDeductions(p))}</td><td><b>${money(payrollNet(p))}</b><br><span class="muted">${esc(p.method)}</span></td><td><div class="actions"><button data-paystub="${p.id}" type="button">PDF</button>${action('payroll',p.id)}</div></td></tr>`));
  if($('retentionsTable')) $('retentionsTable').innerHTML=`<div class="section-head"><h3>Retenciones por pagar</h3><span class="limit-chip">Pendiente ${money(retentionPendingAmount())}</span></div>`+table(['Fecha','Empleado','Tipo','Destino','Monto','Estado','Fecha límite','Pagado','Acción'],state.payrollRetentions.map(r=>`<tr><td>${esc(r.date)}</td><td>${esc(r.teamName)}</td><td>${esc(r.type)}</td><td>${esc(r.destination)}</td><td><b>${money(r.amount)}</b></td><td>${statusChip(retentionStatus(r))}</td><td>${esc(r.dueDate||'—')}</td><td>${esc(r.paidAt||'—')}</td><td><div class="actions">${retentionStatus(r)==='Pendiente'?`<button data-pay-retention="${r.id}" type="button">Marcar pagada</button>`:''}${action('payrollRetentions',r.id)}</div></td></tr>`));
  $('assetsTable').innerHTML=table(['Activo','Cliente','Categoría','Ubicación','Estado','Garantía','Acción'],state.assets.map(a=>`<tr><td><b>${esc(assetName(a))}</b><br><span class="muted">${esc(a.notes||'')}</span></td><td>${esc(a.clientName||'Sin cliente')}</td><td>${esc(assetCategory(a))}</td><td>${esc(assetLocation(a))}</td><td>${esc(assetStatus(a))}</td><td>${esc(a.warranty||'')}</td><td>${action('assets',a.id)}</td></tr>`));
  $('suppliersTable').innerHTML=table(['Suplidor','Contacto','Crédito','Compras','Pagado','Balance','Acción'],state.suppliers.map(s=>`<tr><td><b>${esc(s.name)}</b><br><span class="muted">${esc(s.category||'')} ${(s.fields||[]).filter(Boolean).map(esc).join(' · ')}</span></td><td>${esc(s.phone)}<br><span class="muted">${esc(s.email)}</span><br>${s.whatsapp?`<a href="https://wa.me/${String(s.whatsapp).replace(/\D/g,'')}" target="_blank">WhatsApp</a>`:''}</td><td>${money(s.creditLimit)}</td><td>${money(supplierPurchasesTotal(s.id))}</td><td>${money(supplierPaid(s.id))}</td><td><b>${money(supplierBalance(s.id))}</b></td><td>${action('suppliers',s.id)}</td></tr>`));
  $('supplierPaymentsTable').innerHTML=table(['Fecha','Suplidor','Compra','Método','Monto','Nota','Acción'],state.supplierPayments.map(p=>`<tr><td>${esc(p.date)}</td><td>${esc(p.supplierName)}</td><td>${esc(p.purchaseNumber||'General')}</td><td>${esc(p.method)}</td><td>${money(p.amount)}</td><td>${esc(p.note)}</td><td>${action('supplierPayments',p.id)}</td></tr>`));
  $('purchasesTable').innerHTML=table(['Fecha','Suplidor','Concepto','Vence','Total','Pagado','Balance','Estado','Acción'],state.purchases.map(p=>`<tr><td>${esc(p.date)}</td><td>${esc(p.supplierName)}</td><td><b>${esc(p.number||p.reference||'')}</b><br><span class="muted">${esc(p.concept)}</span></td><td>${esc(p.dueDate||'—')}</td><td>${money(p.total)}</td><td>${money(purchasePaid(p.id))}</td><td><b>${money(purchaseBalance(p))}</b></td><td>${statusChip(purchaseStatus(p))}</td><td>${action('purchases',p.id)}</td></tr>`));
  renderQuotesTable();
  $('servicesTable').innerHTML=table(['Fecha',i.client,'Activo','Servicio','Estado','Monto','Factura','Acción'],state.services.map(s=>{const inv=state.invoices.find(x=>x.serviceId===s.id),amount=serviceAmount(s);return `<tr><td>${esc(s.date)}<br><span class="tag">${esc(s.priority||'Normal')}</span></td><td>${esc(s.clientName)}</td><td>${esc(s.assetName||'')}</td><td><b>${esc(serviceTitle(s))}</b><br>${isTransport()?(()=>{const r=transportRouteFromService(s);return `<span class="muted">${esc(r.origin||'')} → ${esc(r.destination||'')} ${r.miles?`· ${Number(r.miles).toFixed(2)} mi`:''}</span><br>${routeLink(r.origin,r.destination,'Abrir ruta')}`})():`<span class="muted">${esc((s.fields||[]).filter(Boolean).slice(0,3).join(' · '))}</span>`}</td><td><span class="status-chip">${esc(s.status||'Pendiente')}</span></td><td>${money(amount)}</td><td>${inv?esc(inv.number):`<button data-invoice="${s.id}" type="button">Facturar</button>`}</td><td><div class="actions"><button data-dup-service="${s.id}" type="button">Duplicar</button>${action('services',s.id)}</div></td></tr>`}));
  document.querySelectorAll('[data-invoice]').forEach(b=>b.onclick=()=>createInvoice(b.dataset.invoice));
  document.querySelectorAll('[data-client-summary]').forEach(b=>b.onclick=()=>showClientSummary(b.dataset.clientSummary));
  document.querySelectorAll('[data-dup-service]').forEach(b=>b.onclick=()=>duplicateService(b.dataset.dupService));
  document.querySelectorAll('[data-paystub]').forEach(b=>b.onclick=()=>previewPaystub(b.dataset.paystub));
  document.querySelectorAll('[data-pay-retention]').forEach(b=>b.onclick=()=>markRetentionPaid(b.dataset.payRetention));
  renderBillingTable();
  $('paymentsTable').innerHTML=table(['Fecha','Factura','Método','Monto','Balance factura','Nota','Acción'],state.payments.map(p=>{const inv=state.invoices.find(x=>x.id===p.invoiceId)||{};return `<tr><td>${esc(p.date)}</td><td>${esc(p.invoiceNumber)}</td><td>${esc(p.method)}</td><td>${money(p.amount)}</td><td>${inv.id?money(invoiceBalance(inv)):'—'}</td><td>${esc(p.note)}</td><td>${action('payments',p.id)}</td></tr>`;}));
  let running=0;
  const cashRows=[...state.cashflow].sort((a,b)=>String(a.date||'').localeCompare(String(b.date||''))).map(x=>{running += (x.type==='Gasto'?-1:1)*Number(x.amount||0);return `<tr><td>${esc(x.date)}</td><td>${esc(x.type)}</td><td>${esc(x.concept)}</td><td>${money(x.amount)}</td><td><b>${money(running)}</b></td><td>${action('cashflow',x.id)}</td></tr>`;});
  $('cashTable').innerHTML=table(['Fecha','Tipo','Concepto','Monto','Balance','Acción'],cashRows);
  document.querySelectorAll('[data-del]').forEach(b=>b.onclick=()=>remove(...b.dataset.del.split(':')));
  document.querySelectorAll('[data-edit]').forEach(b=>b.onclick=()=>editRecord(...b.dataset.edit.split(':')));
}

function plans(){
  const pendingAny = latestPlanRequest();
  $('plansGrid').innerHTML=`<div class="plan full"><h3>Activación</h3><small class="muted">${esc(planRequestStatusText())}</small></div>`+
  Object.entries(PLANS).map(([id,p])=>{
    const active=currentPlanId()===id;
    const pending=pendingPlanRequest(id);
    const blockedByOtherPending=!!pendingAny && !pending && !active;
    const isEnterprise=id==='enterprise';
    const label=isEnterprise&&active?'PLAN MÁXIMO':active?'Plan actual':pending?'Solicitud pendiente':blockedByOtherPending?'Solicitud en revisión':(links()[id]?'Solicitar / pagar':'Solicitar revisión');
    const chip=isEnterprise?`<small class="ok-chip">👑 PLAN EMPRESARIAL</small>`:(active?`<small class="ok-chip">Plan actual</small>`:(pending?`<small class="pending-chip">Pendiente de activación</small>`:''));
    return `<div class="plan ${active?'featured':''} ${isEnterprise?'enterprise-plan':''}"><h3>${isEnterprise?'👑 '+p.name:p.name}</h3><div class="price">${p.price}</div><p>${p.features.join('<br>')}</p>${chip}<button type="button" data-plan="${id}" class="${active?'ghost':'primary'}" ${(active&&isEnterprise)||active||pending||blockedByOtherPending?'disabled':''}>${label}</button></div>`
  }).join('');
  document.querySelectorAll('[data-plan]').forEach(b=>b.onclick=()=>requestPlanChange(b.dataset.plan));
}

function onboardingSteps(){
  const p=profile();
  return [
    {icon:'🏢', title:'Negocio', done:!!p.businessName && p.businessName!=='Mi Negocio', text:p.businessName||'Mi Negocio'},
    {icon:'🏭', title:'Industria', done:!!p.industry, text:industry().name},
    {icon:'🌐', title:'Idioma', done:!!p.language, text:(p.language||'es')==='en'?'English':'Español'},
    {icon:'🖼', title:'Logo', done:!!(p.logoDashboard||p.logoPdf), text:(p.logoDashboard||p.logoPdf)?'Completo':'Pendiente'},
    {icon:'👥', title:'Primer cliente', done:state.clients.length>0, text:String(state.clients.length)},
    {icon:'🧾', title:'Primera factura', done:state.invoices.length>0, text:String(state.invoices.length)}
  ];
}
function onboardingProgress(){
  const steps=onboardingSteps();
  return Math.round((steps.filter(x=>x.done).length/steps.length)*100);
}
function shouldShowWelcome(){
  const p=profile();
  if(p.onboardingComplete || p.onboardingSkipped) return false;
  return onboardingProgress() < 100;
}
function renderWelcomeCenter(){
  const box=$('welcomeCenter'); if(!box) return;
  const steps=onboardingSteps();
  const pct=onboardingProgress();
  $('welcomeProgressBar') && ($('welcomeProgressBar').style.width=pct+'%');
  $('welcomeSteps') && ($('welcomeSteps').innerHTML=steps.map(s=>`<div class="welcome-step ${s.done?'done':''}"><span>${s.done?'✓':s.icon}</span><div><b>${T(s.title)}</b><small>${esc(T(s.text))}</small></div></div>`).join(''));
  box.classList.toggle('hidden',!shouldShowWelcome());
  box.setAttribute('aria-hidden',shouldShowWelcome()?'false':'true');
  const close=$('welcomeClose'); if(close) close.onclick=async()=>{await setDoc(profRef(),{onboardingSkipped:true,updatedAt:serverTimestamp()},{merge:true});};
  const settings=$('welcomeSettings'); if(settings) settings.onclick=()=>{box.classList.add('hidden');show('settings');};
  const demo=$('welcomeLoadDemo'); if(demo) demo.onclick=async()=>{await clearDemoData(profile().industry||'hvac'); await loadIndustryDemo(profile().industry||'hvac');};
  const finish=$('welcomeFinish'); if(finish) finish.onclick=async()=>{await setDoc(profRef(),{onboardingComplete:true,onboardingSkipped:false,updatedAt:serverTimestamp()},{merge:true});};
}
function renderHomePolish(){
  renderNexusDaily();
  const ct=$('controlStrip'); if(!ct) return;
  const f=financialSummary(), o=operationalSummary();
  const q=quoteSummary();
  ct.innerHTML=[
    ['Cotizaciones abiertas',q.open,'quotes'],
    ['Potencial COT',money(q.openValue+q.approvedValue),'quotes'],
    ['Por cobrar',money(f.receivable),'billing'],
    ['Vencido',money(f.overdue),'billing'],
    ['Por pagar',money(o.purchaseDebt),'purchases'],
    ['Nómina',money(o.payrollDue),'payroll'],
    ['Obligaciones',money(obligationSummary().total),'payroll']
  ].map(([a,b,v])=>`<button class="control-card" type="button" data-control-view="${v}"><span>${T(a)}</span><b>${b}</b></button>`).join('');
  document.querySelectorAll('[data-control-view]').forEach(b=>b.onclick=()=>show(b.dataset.controlView));
}


/* V90 — Contratos de servicios (módulo nativo)
   Usa la misma sesión, Firestore y ciclo de render de Nexus. */
function contractNumber(){
  const year=new Date().getFullYear();
  const nums=(state.contracts||[]).map(c=>Number(String(c.number||'').match(/(\d+)$/)?.[1]||0));
  return `CTR-${year}-${String(Math.max(0,...nums)+1).padStart(3,'0')}`;
}
function contractClientOptions(){
  return state.clients.slice().sort((a,b)=>String(a.name||'').localeCompare(String(b.name||''),'es',{sensitivity:'base'}))
    .map(c=>({value:c.id,label:c.name||'Cliente'}));
}
function contractDraftFromForm(){
  const c=clientBy($('ctClient')?.value||'');
  return {
    clientId:c.id||'',clientName:c.name||'',clientPhone:c.phone||'',clientEmail:c.email||'',
    number:$('ctNumber')?.value||contractNumber(),
    date:$('ctDate')?.value||today(),
    place:$('ctPlace')?.value||'Puerto Rico',
    address:$('ctAddress')?.value||c.address||'',
    service:$('ctService')?.value||'',
    startDate:$('ctStart')?.value||'',
    endDate:$('ctEnd')?.value||'',
    frequency:$('ctFrequency')?.value||'',
    amount:$('ctAmount')?.value||'',
    paymentTerms:$('ctPaymentTerms')?.value||'',
    conditions:$('ctConditions')?.value||'',
    termination:$('ctTermination')?.value||''
  };
}
function buildContractText(d){
  const p=profile(), provider=p.businessName||'EL PROVEEDOR';
  return `CONTRATO DE PRESTACIÓN DE SERVICIOS

CONTRATO NÚM.: ${d.number||'________________'}

En ${d.place||'________________'}, Puerto Rico, a ${d.date||'________________'}, comparecen ${provider}, en adelante “EL PROVEEDOR”, y ${d.clientName||'EL CLIENTE'}, en adelante “EL CLIENTE”.

PRIMERO — OBJETO Y ALCANCE
EL PROVEEDOR prestará los siguientes servicios:
${d.service||'________________________________________________________________'}

SEGUNDO — LUGAR DEL SERVICIO
Los servicios se realizarán en:
${d.address||'________________________________________________________________'}

TERCERO — VIGENCIA Y PROGRAMACIÓN
Fecha de inicio: ${d.startDate||'________________'}.
Fecha de terminación, si aplica: ${d.endDate||'________________'}.
Frecuencia / programación: ${d.frequency||'Según coordinación entre las partes.'}

CUARTO — HONORARIOS Y FORMA DE PAGO
Tarifa o monto acordado: ${d.amount||'Según cotización o acuerdo vigente.'}
Condiciones de pago: ${d.paymentTerms||'Pago según lo acordado entre las partes.'}

QUINTO — CONDICIONES DEL SERVICIO
${d.conditions||'EL CLIENTE facilitará acceso razonable al lugar de trabajo y EL PROVEEDOR realizará los servicios conforme al alcance acordado y a condiciones seguras de trabajo.'}

SEXTO — CANCELACIÓN O TERMINACIÓN
${d.termination||'Cualquiera de las partes podrá solicitar la terminación del acuerdo sujeto a los compromisos, servicios y balances pendientes existentes a la fecha de terminación.'}

SÉPTIMO — ACEPTACIÓN
Las partes declaran que han leído, entendido y aceptado las condiciones de este contrato.

________________________________
EL PROVEEDOR
${provider}

________________________________
EL CLIENTE
${d.clientName||'________________'}

Fecha: __________________________`;
}
function renderContractForm(){
  const f=$('contractForm'); if(!f)return;
  const selected=state.editingContractId ? (state.contracts.find(c=>c.id===state.editingContractId)||{}) : {};
  f.innerHTML=
    select('Cliente','ctClient',contractClientOptions(),selected.clientId||'')+
    input('Contrato #','ctNumber','text',selected.number||contractNumber())+
    input('Fecha','ctDate','date',selected.date||today())+
    input('Lugar','ctPlace','text',selected.place||'Puerto Rico')+
    input('Dirección / lugar del servicio','ctAddress','text',selected.address||'','wide')+
    input('Servicio o alcance','ctService','text',selected.service||'','wide')+
    input('Fecha inicio','ctStart','date',selected.startDate||'')+
    input('Fecha terminación (si aplica)','ctEnd','date',selected.endDate||'')+
    input('Frecuencia / duración','ctFrequency','text',selected.frequency||'')+
    input('Tarifa / monto','ctAmount','text',selected.amount||'')+
    input('Condiciones de pago','ctPaymentTerms','text',selected.paymentTerms||'','wide')+
    `<div class="wide"><label>Condiciones del servicio</label><textarea id="ctConditions" rows="4">${esc(selected.conditions||'')}</textarea></div>`+
    `<div class="wide"><label>Cancelación / terminación</label><textarea id="ctTermination" rows="3">${esc(selected.termination||'')}</textarea></div>`+
    `<div class="wide"><label>Texto del contrato</label><textarea id="ctBody" rows="20">${esc(selected.body||'')}</textarea><small class="muted">Puedes editar el texto antes de guardarlo.</small></div>`+
    `<div class="wide form-actions"><button id="generateContractText" type="button">Generar texto</button><button class="primary" type="submit">${state.editingContractId?'Actualizar contrato':'Guardar contrato'}</button>${state.editingContractId?'<button id="cancelContractEdit" type="button" class="ghost">Cancelar edición</button>':''}</div>`;
  const clientSel=$('ctClient');
  if(clientSel)clientSel.onchange=()=>{const c=clientBy(clientSel.value);if(c.id&&!$('ctAddress').value)$('ctAddress').value=[c.address,c.city].filter(Boolean).join(', ');};
  if($('generateContractText'))$('generateContractText').onclick=()=>{$('ctBody').value=buildContractText(contractDraftFromForm());};
  if($('cancelContractEdit'))$('cancelContractEdit').onclick=()=>{state.editingContractId=null;renderContractForm();bindContractForm();};
}
function contractPrintHtml(c){
  const p=profile();
  return `<div class="doc-page contract-doc"><div class="contract-doc-head">${p.logoPdf?`<img class="contract-doc-logo" src="${esc(p.logoPdf)}" alt="Logo">`:''}<div class="contract-doc-heading"><h2>CONTRATO DE PRESTACIÓN DE SERVICIOS</h2><p>${esc(p.businessName||'')}</p><small>${esc(c.number||'')} · ${esc(c.date||'')}</small></div></div><div class="doc-body contract-doc-body">${esc(c.body||buildContractText(c))}</div><div class="doc-foot contract-doc-foot">Contrato ${esc(c.number||'')} · ${esc(c.date||'')}</div></div>`;
}
function printServiceContract(id){
  const c=state.contracts.find(x=>x.id===id);if(!c)return;
  const html=contractPrintHtml(c),w=open('','_blank');if(!w)return alert('Permite ventanas emergentes para imprimir.');
  w.document.write(`<html><head><meta charset="utf-8"><title>${esc(c.number||'Contrato')}</title><style>
    @page{size:letter;margin:.48in}
    *{box-sizing:border-box}
    html,body{margin:0;padding:0;background:#fff;color:#111;font-family:Arial,Helvetica,sans-serif}
    .contract-doc{width:100%;min-height:0;margin:0;padding:0;border:0;box-shadow:none;display:block}
    .contract-doc-head{display:flex;align-items:center;justify-content:center;gap:.22in;border-bottom:1px solid #9ca3af;padding:0 0 .13in;margin:0 0 .16in}
    .contract-doc-logo{display:block;width:auto!important;height:auto!important;max-width:1.05in!important;max-height:.72in!important;object-fit:contain!important;flex:0 0 auto}
    .contract-doc-heading{text-align:left}
    .contract-doc-heading h2{font-size:13pt;line-height:1.15;letter-spacing:.04em;margin:0 0 3px;font-weight:700}
    .contract-doc-heading p{font-size:9.5pt;margin:0 0 2px}
    .contract-doc-heading small{font-size:8pt;color:#666}
    .contract-doc-body{white-space:pre-wrap;font-size:9.5pt;line-height:1.32;padding:0;margin:0}
    .contract-doc-foot{margin-top:.12in;padding-top:.07in;border-top:1px solid #ddd;text-align:center;color:#777;font-size:7.5pt}
    @media print{.contract-doc-logo{max-width:1.05in!important;max-height:.72in!important}.contract-doc-head{break-inside:avoid}.contract-doc-body{orphans:3;widows:3}}
  </style></head><body>${html}</body></html>`);
  w.document.close();setTimeout(()=>{w.focus();w.print();},450);
}
function renderContractsTable(){
  const box=$('contractsTable');if(!box)return;
  const rows=[...(state.contracts||[])].sort((a,b)=>String(b.date||'').localeCompare(String(a.date||'')));
  if($('contractsCount'))$('contractsCount').textContent=`${rows.length} contrato${rows.length===1?'':'s'}`;
  box.innerHTML=table(['Fecha','Contrato','Cliente','Servicio','Vigencia','Acción'],rows.map(c=>`<tr><td>${esc(c.date||'')}</td><td><b>${esc(c.number||'')}</b></td><td><b>${esc(c.clientName||'')}</b><br><span class="muted">${esc(c.address||'')}</span></td><td>${esc(c.service||'')}</td><td>${esc(c.startDate||'')}${c.endDate?' → '+esc(c.endDate):''}<br><span class="muted">${esc(c.frequency||'')}</span></td><td><div class="actions"><button type="button" data-contract-print="${c.id}">Imprimir / PDF</button><button type="button" data-contract-edit="${c.id}">Editar</button><button type="button" class="danger" data-contract-delete="${c.id}">Borrar</button></div></td></tr>`));
  box.querySelectorAll('[data-contract-print]').forEach(b=>b.onclick=()=>printServiceContract(b.dataset.contractPrint));
  box.querySelectorAll('[data-contract-edit]').forEach(b=>b.onclick=()=>{state.editingContractId=b.dataset.contractEdit;renderContractForm();bindContractForm();window.scrollTo({top:0,behavior:'smooth'});});
  box.querySelectorAll('[data-contract-delete]').forEach(b=>b.onclick=async()=>{if(confirm('¿Borrar este contrato?'))await deleteDoc(docPath('contracts',b.dataset.contractDelete));});
}
function bindContractForm(){
  const f=$('contractForm');if(!f||f.dataset.bound==='1')return;f.dataset.bound='1';
  f.onsubmit=async e=>{
    e.preventDefault();
    const d=contractDraftFromForm();if(!d.clientId)return alert('Selecciona un cliente.');
    const submit=f.querySelector('button[type=\"submit\"]');
    const oldText=submit?.textContent||'Guardar contrato';
    if(submit){submit.disabled=true;submit.textContent='Guardando…';}
    try{
      const payload={...d,body:$('ctBody')?.value?.trim()||buildContractText(d),updatedAt:serverTimestamp()};
      if(state.editingContractId){await updateDoc(docPath('contracts',state.editingContractId),payload);state.editingContractId=null;}
      else {
        const ref=await add('contracts',{...payload,createdAt:serverTimestamp()});
        if(!ref)return;
      }
      alert('Contrato guardado correctamente.');
      renderContractForm();bindContractForm();
    }catch(err){
      console.error('Error guardando contrato:',err);
      alert('No se pudo guardar el contrato. '+(err?.code==='permission-denied'?'Firestore no tiene autorizada la colección contracts. Actualiza las reglas de Firebase incluidas en esta versión.':(err?.message||err)));
    }finally{if(submit){submit.disabled=false;submit.textContent=oldText;}}
  };
}
const __v90Forms=forms;
forms=function(){__v90Forms();renderContractForm();};
const __v90Tables=tables;
tables=function(){__v90Tables();renderContractsTable();};

function render(){setVisuals();nav();forms();bindContractForm();bindServiceItems();bindQuoteItems();bindServiceProductivity();if(isTransport()){['sOrigin','sDestination','sRouteMiles','sRouteRate','sRouteBase'].forEach(id=>$(id)&&($(id).oninput=updateTransportTotal));updateTransportTotal();}kpis();renderHomePolish();tables();bindDirectoryControls();plans();renderWelcomeCenter();enforceModuleView();$('pageTitle').textContent=T(TITLES[state.activeView]||state.activeView);$('pageSubtitle').textContent=state.activeView==='dashboard'?T('Resumen operativo, financiero y alertas'):' ';applyLanguage();}
async function add(c,data){if(!canCreate(c)){alert(`Límite alcanzado en plan ${plan().name}. Mejora tu plan.`);show('plans');return null;}return await addDoc(colPath(c),{...data,createdAt:serverTimestamp(),updatedAt:serverTimestamp()});}

function showClientSummary(id){
  const c=clientBy(id); if(!c.id) return;
  const cs=clientSummary(c);
  alert(`${c.name}\n\nServicios: ${cs.services}\nFacturas: ${cs.invoices}\nActivos: ${cs.assets}\nCobrado: ${money(cs.paid)}\nBalance: ${money(cs.balance)}\n\nContacto: ${c.phone||''}\n${c.email||''}\n${c.address||''}${c.accessNotes?'\nReferencia: '+c.accessNotes:''}`);
}
async function duplicateService(id){
  const s=state.services.find(x=>x.id===id); if(!s) return;
  if(!canCreate('services')){alert('Límite de servicios alcanzado.');show('plans');return;}
  const copy={...s,date:today(),status:'Pendiente',createdAt:serverTimestamp(),updatedAt:serverTimestamp()};
  delete copy.id; delete copy.createdAt; delete copy.updatedAt;
  await add('services',copy);
}
async function duplicateInvoice(id){
  const inv=state.invoices.find(x=>x.id===id); if(!inv) return;
  if(!canCreate('invoices')){alert('Límite de facturas alcanzado.');show('plans');return;}
  const copy={...inv,number:'INV-'+String(Date.now()).slice(-7),date:today(),dueDate:plusDays(15),status:'Pendiente',serviceId:'',createdAt:serverTimestamp(),updatedAt:serverTimestamp()};
  delete copy.id; delete copy.createdAt; delete copy.updatedAt;
  await add('invoices',copy);
}
async function cancelInvoice(id){
  if(!confirm('¿Cancelar esta factura?')) return;
  await updateDoc(docPath('invoices',id),{status:'Cancelada',updatedAt:serverTimestamp()});
}


async function markRetentionPaid(id){
  const r=state.payrollRetentions.find(x=>x.id===id); if(!r) return;
  if(!confirm(`¿Marcar esta retención como pagada?\n${retentionLabel(r)}\n${money(r.amount)}`)) return;
  const paidAt=today();
  await updateDoc(docPath('payrollRetentions',id),{status:'Pagada',paidAt,updatedAt:serverTimestamp()});
  await add('cashflow',{date:paidAt,type:'Gasto',concept:`Pago retención ${r.type||''} · ${r.destination||''}`,amount:Number(r.amount||0),note:`Empleado: ${r.teamName||''} · Nómina: ${r.payrollId||''}`});
}

async function remove(c,id){if(confirm('¿Borrar registro?'))await deleteDoc(docPath(c,id));}

const EDIT_LABELS={
  name:'Nombre',phone:'Teléfono',email:'Email',city:'Ciudad',address:'Dirección',altName:'Contacto alterno',altPhone:'Teléfono alterno',altEmail:'Email alterno',tags:'Etiquetas',notes:'Notas',personalId:'Identificación personal ID',ssn:'Seguro Social',socialSecurity:'Seguro Social',driverLicense:'Licencia de conducir',assignedVehicleId:'Vehículo asignado',assignedVehicleName:'Vehículo asignado',
  clientId:'Cliente',clientName:'Cliente',assetId:'Activo',assetName:'Activo',teamId:'Empleado / Equipo',teamName:'Empleado / Equipo',date:'Fecha',dueDate:'Vencimiento',status:'Estado',priority:'Prioridad',serviceType:'Tipo de servicio',title:'Título / Descripción',amount:'Monto',subtotal:'Subtotal',tax:'Impuesto',total:'Total',
  role:'Cargo',salary:'Salario',rate:'Tarifa',retention:'Retención',startDate:'Fecha de ingreso',category:'Categoría',brand:'Marca',model:'Modelo',location:'Ubicación',value:'Valor',warranty:'Garantía',serial:'Número de serie',purchaseDate:'Fecha de compra',expirationDate:'Fecha de caducidad',warrantyExpirationDate:'Vencimiento de garantía',nextMaintenanceDate:'Próximo mantenimiento',industry:'Industria',
  whatsapp:'WhatsApp',contact:'Contacto',creditLimit:'Límite de crédito',openingBalance:'Balance inicial',supplierId:'Suplidor',supplierName:'Suplidor',purchaseId:'Compra',purchaseNumber:'Compra',method:'Método',note:'Nota',
  period:'Periodo',hours:'Horas',overtime:'Horas extra',gross:'Bruto',bonus:'Bono',retention:'Retenciones',advance:'Adelanto',deductions:'Otros descuentos',net:'Neto',concept:'Concepto',reference:'Referencia',number:'Número',
  invoiceId:'Factura',invoiceNumber:'Factura',type:'Tipo',items:'Partidas / Items',fields:'Campos adicionales',route:'Ruta',terms:'Términos',serviceTitle:'Servicio',quoteId:'Cotización',quoteNumber:'Cotización',validUntil:'Válida hasta',approvedAt:'Aprobada el',convertedServiceId:'Servicio convertido',paid:'Pagado',balance:'Balance',destination:'Destino',dueDate:'Fecha límite',paidAt:'Fecha de pago',intervalMonths:'Intervalo meses',channel:'Canal',sourceType:'Origen',sourceId:'ID origen',completedAt:'Completado el',reference:'Referencia'
};
const EDIT_ORDER={
  clients:['name','phone','email','city','address','altName','altPhone','altEmail','tags','notes'],
  services:['clientId','assetId','teamId','date','status','priority','serviceType','title','amount','items','fields','route'],
  followups:['clientId','assetId','type','title','dueDate','intervalMonths','status','priority','channel','note','sourceType','sourceId','completedAt'],
  quotes:['number','clientId','assetId','teamId','date','validUntil','status','priority','serviceType','title','items','subtotal','ivu','taxPercent','total','notes','terms','convertedServiceId'],
  team:['name','phone','email','personalId','ssn','driverLicense','assignedVehicleId','role','status','salary','rate','retention','startDate'],
  assets:['clientId','industry','name','category','brand','model','serial','location','status','value','date','purchaseDate','expirationDate','warrantyExpirationDate','nextMaintenanceDate','warranty','notes'],
  suppliers:['name','phone','whatsapp','email','contact','category','creditLimit','openingBalance','fields'],
  supplierPayments:['supplierId','purchaseId','date','method','amount','note'],
  payroll:['teamId','date','period','hours','overtime','gross','bonus','retention','advance','deductions','net','method','note'],
  purchases:['supplierId','date','dueDate','concept','reference','subtotal','tax','total','status','note'],
  invoices:['number','date','dueDate','clientId','clientName','serviceTitle','items','subtotal','ivu','taxPercent','total','status','notes','terms'],
  payments:['invoiceId','date','method','amount','note'],
  cashflow:['date','type','concept','amount'],
  payrollRetentions:['teamId','payrollId','date','type','destination','amount','status','dueDate','paidAt','reference','note']
};
function ensureEditModal(){
  let m=$('editModal');
  if(m) return m;
  const wrap=document.createElement('div');
  wrap.id='editModal';
  wrap.className='edit-modal hidden';
  wrap.innerHTML=`<div class="edit-backdrop" data-close-edit></div><div class="edit-panel card"><div class="edit-head"><div><span class="pill">Editar</span><h2 id="editTitle">Editar registro</h2></div><button class="icon-btn" data-close-edit type="button">×</button></div><form id="editForm" class="form-grid edit-form"></form><div class="edit-actions"><button type="button" data-close-edit>Cancelar</button><button id="editSave" class="primary" type="button">Guardar cambios</button></div></div>`;
  document.body.appendChild(wrap);
  wrap.querySelectorAll('[data-close-edit]').forEach(b=>b.onclick=closeEditModal);
  return wrap;
}
function closeEditModal(){const m=$('editModal'); if(m)m.classList.add('hidden'); state.editing=null;}
function editType(k,v){
  if(['amount','subtotal','tax','total','ivu','taxPercent','salary','rate','retention','value','creditLimit','openingBalance','hours','overtime','gross','bonus','advance','deductions','net'].includes(k)) return 'number';
  if(String(k).toLowerCase().includes('date') || k==='date' || k==='dueDate' || k==='startDate') return 'date';
  if(['notes','note','address','items','fields','route'].includes(k)) return 'textarea';
  return 'text';
}
function editOptions(c,k,val){
  if(k==='clientId') return state.clients.map(x=>({value:x.id,label:x.name}));
  if(k==='assetId') return [{value:'',label:'Sin activo'},...state.assets.map(x=>({value:x.id,label:assetName(x)}))];
  if(k==='teamId') return [{value:'',label:'Sin equipo'},...state.team.map(x=>({value:x.id,label:x.name}))];
  if(k==='assignedVehicleId') return [{value:'',label:'Sin vehículo'},...vehicleAssetOptions().map(x=>({value:x.id,label:assetLabel(x)}))];
  if(k==='supplierId') return state.suppliers.map(x=>({value:x.id,label:x.name}));
  if(k==='purchaseId') return [{value:'',label:'Sin compra'},...state.purchases.map(x=>({value:x.id,label:x.number||x.concept||x.id}))];
  if(k==='invoiceId') return state.invoices.map(x=>({value:x.id,label:x.number||x.id}));
  if(k==='status'){
    if(c==='followups') return ['Programado','Próximo','Vencido','Completado','Cancelado'].map(x=>({value:x,label:x}));
    if(c==='quotes') return ['Borrador','Enviada','Aprobada','Rechazada','Convertida','Vencida'].map(x=>({value:x,label:x}));
    if(c==='payrollRetentions') return ['Pendiente','Pagada','Aplicada','Cancelada'].map(x=>({value:x,label:x}));
    if(c==='invoices') return ['Pendiente','Parcial','Pagada','Vencida','Cancelada'].map(x=>({value:x,label:x}));
    if(c==='team') return ['Activo','Inactivo','Suspendido'].map(x=>({value:x,label:x}));
    if(c==='assets') return ['Activo','Inactivo','En garantía','Fuera de servicio'].map(x=>({value:x,label:x}));
    return ['Pendiente','En proceso','Completado','Cancelado'].map(x=>({value:x,label:x}));
  }
  if(k==='priority') return ['Baja','Normal','Alta','Urgente'].map(x=>({value:x,label:x}));
  if(k==='type' && c==='followups') return ['Mantenimiento','Cotización','Instalación','Servicio','Garantía','Cobro','Otro'].map(x=>({value:x,label:x}));
  if(k==='channel') return ['WhatsApp','Llamada','Email','Visita'].map(x=>({value:x,label:x}));
  if(k==='method') return ['ATH Móvil','Stripe','PayPal','Transferencia','Cheque','Efectivo','Tarjeta'].map(x=>({value:x,label:x}));
  if(k==='type') return ['Ingreso','Gasto'].map(x=>({value:x,label:x}));
  if(k==='industry') return Object.entries(INDUSTRIES).map(([id,x])=>({value:id,label:x.name}));
  if(k==='serviceType') return servicesForCurrentIndustry().map(x=>({value:x,label:x}));
  return null;
}
function editSelectHtml(label,id,opts,val='',cls=''){
  const has=opts.some(o=>String(o.value)===String(val));
  const full=(!has && val!==undefined && val!==null && String(val)!=='') ? [{value:val,label:String(val)+' (actual)'} , ...opts] : opts;
  return select(label,id,full,val,cls);
}
function editFieldHtml(c,k,v){
  if(c==='clients' && k==='tags') return clientTagsSelectHtml('edit_tags',v);
  const label=EDIT_LABELS[k]||k;
  const opts=editOptions(c,k,v);
  if(opts) return editSelectHtml(label,'edit_'+k,opts,v,'');
  const type=editType(k,v);
  if(type==='textarea'){
    let out = (typeof v==='object' && v!==null) ? JSON.stringify(v,null,2) : (v??'');
    return `<div class="wide"><label>${esc(label)}</label><textarea id="edit_${esc(k)}" rows="${['items','fields','route'].includes(k)?6:3}" placeholder="${esc(label)}">${esc(out)}</textarea></div>`;
  }
  return input(label,'edit_'+k,type,v??'', type==='number'?'':'');
}
function normalizeEditRecord(c,r){
  const x={...r};
  if(!x.clientId && x.clientName){const cl=state.clients.find(c=>String(c.name||'').toLowerCase()===String(x.clientName||'').toLowerCase()); if(cl)x.clientId=cl.id;}
  if(!x.assetId && x.assetName){const a=state.assets.find(a=>assetName(a)===x.assetName || a.name===x.assetName); if(a)x.assetId=a.id;}
  if(!x.teamId && x.teamName){const t=state.team.find(t=>String(t.name||'').toLowerCase()===String(x.teamName||'').toLowerCase()); if(t)x.teamId=t.id;}
  if(!x.supplierId && x.supplierName){const sp=state.suppliers.find(s=>String(s.name||'').toLowerCase()===String(x.supplierName||'').toLowerCase()); if(sp)x.supplierId=sp.id;}
  if(!x.purchaseId && x.purchaseNumber){const pu=state.purchases.find(p=>String(p.number||p.reference||'')===String(x.purchaseNumber)); if(pu)x.purchaseId=pu.id;}
  if(!x.invoiceId && x.invoiceNumber){const inv=state.invoices.find(i=>String(i.number||'')===String(x.invoiceNumber)); if(inv)x.invoiceId=inv.id;}
  if(c==='services' && x.items===undefined) x.items=[];
  if(c==='quotes' && x.items===undefined) x.items=[];
  if(c==='services' && x.fields===undefined) x.fields=[];
  if(c==='invoices' && x.items===undefined) x.items=[];
  if(c==='invoices' && x.terms===undefined) x.terms='Pago según acuerdo.';
  return x;
}
function editKeys(c,r){
  const base=EDIT_ORDER[c]||[];
  const skip=['id','createdAt','updatedAt','uid','userId'];
  const extras=Object.keys(r).filter(k=>!skip.includes(k) && !base.includes(k));
  return [...base,...extras];
}
function readEditValue(k,original){
  if(k==='tags') return readClientTags('edit_tags');
  const el=$('edit_'+k); if(!el) return undefined;
  const type=editType(k,original);
  const raw=el.value;
  if(k==='ssn' || k==='socialSecurity') return formatSSNInput(raw);
  if(type==='number') return Number(raw||0);
  if(['items','fields','route'].includes(k)){
    try{return raw.trim()?JSON.parse(raw):(['items','fields'].includes(k)?[]:{});}catch(e){throw new Error(`El campo ${EDIT_LABELS[k]||k} debe tener formato JSON válido.`);}
  }
  return raw;
}

function editServiceItemsHtml(items){
  const arr=(Array.isArray(items) && items.length) ? items : [{description:'',qty:1,price:''}];
  return arr.map((it,idx)=>`<div class="service-line" data-edit-service-line>
    <div class="line-number">${idx+1}</div>
    <input class="edit-svc-desc" placeholder="Descripción del servicio / partida" value="${esc(it.description||'')}">
    <input class="edit-svc-qty" type="number" step="0.01" min="0" placeholder="Cant." value="${esc(it.qty ?? 1)}">
    <input class="edit-svc-price" type="number" step="0.01" min="0" placeholder="Precio" value="${esc(it.price ?? '')}">
    <button class="danger mini" data-edit-remove-line type="button">×</button>
  </div>`).join('');
}
function getEditServiceItems(){
  return [...document.querySelectorAll('[data-edit-service-line]')].map(row=>({
    description: row.querySelector('.edit-svc-desc')?.value.trim() || '',
    qty: Number(row.querySelector('.edit-svc-qty')?.value || 1),
    price: Number(row.querySelector('.edit-svc-price')?.value || 0)
  })).filter(it=>it.description || it.price > 0);
}
function updateEditServiceTotal(){
  const total=serviceItemsTotal(getEditServiceItems());
  const badge=$('edit_sItemsTotal');
  const amount=$('edit_amount');
  if(badge) badge.textContent=money(total);
  if(amount && total>0) amount.value=total.toFixed(2);
}
function bindEditServiceItems(){
  const addBtn=$('edit_addServiceLine');
  if(addBtn) addBtn.onclick=()=>{
    const box=$('editServiceItemsBox');
    if(!box) return;
    box.insertAdjacentHTML('beforeend',editServiceItemsHtml([{description:'',qty:1,price:''}]));
    bindEditServiceItems();
    updateEditServiceTotal();
  };
  document.querySelectorAll('[data-edit-remove-line]').forEach(btn=>btn.onclick=()=>{
    const rows=document.querySelectorAll('[data-edit-service-line]');
    const row=btn.closest('[data-edit-service-line]');
    if(rows.length>1) row.remove();
    else row.querySelectorAll('input').forEach((i,idx)=>i.value=idx===1?'1':'');
    updateEditServiceTotal();
  });
  document.querySelectorAll('.edit-svc-desc,.edit-svc-qty,.edit-svc-price').forEach(el=>el.oninput=updateEditServiceTotal);
  updateEditServiceTotal();
}
function editTransportRouteHtml(route){
  const r=route || {};
  if(!isTransport() && !r.origin && !r.destination) return '';
  return `<div class="wide route-box"><div class="route-grid">
    ${input('Origen','edit_route_origin','text',r.origin||'','wide')}
    ${input('Destino','edit_route_destination','text',r.destination||'','wide')}
    ${input('Millas Google','edit_route_miles','number',r.miles??'')}
    ${input('Tarifa por milla','edit_route_rate','number',r.rate??(profile().transportRatePerMile||'2.50'))}
    ${input('Cargo base','edit_route_base','number',r.base??(profile().transportBaseCharge||'0'))}
    <div><label>Ruta</label><button id="edit_openRouteBtn" type="button" class="ghost">Abrir ruta</button></div>
  </div><small id="editRouteCalcPreview" class="muted"></small></div>`;
}
function editRouteFromModal(){
  if(!$('edit_route_origin') && !$('edit_route_destination')) return null;
  const miles=Number($('edit_route_miles')?.value||0);
  const rate=Number($('edit_route_rate')?.value||0);
  const base=Number($('edit_route_base')?.value||0);
  return {origin:$('edit_route_origin')?.value||'',destination:$('edit_route_destination')?.value||'',miles,rate,base,total:base+(miles*rate)};
}
function updateEditRouteTotal(){
  const r=editRouteFromModal();
  if(!r) return;
  const amount=$('edit_amount');
  if(amount) amount.value=(r.total||0).toFixed(2);
  const preview=$('editRouteCalcPreview');
  if(preview) preview.textContent=`${Number(r.miles||0).toFixed(2)} mi × ${money(r.rate)} + ${money(r.base)} = ${money(r.total)}`;
  const open=$('edit_openRouteBtn');
  if(open){
    const url=mapsRouteUrl(r.origin,r.destination);
    open.disabled=!url;
    open.onclick=()=>{ if(url) window.open(url,'_blank','noopener'); };
  }
}
function bindEditTransportRoute(){
  ['edit_route_origin','edit_route_destination','edit_route_miles','edit_route_rate','edit_route_base'].forEach(id=>$(id)&&($(id).oninput=updateEditRouteTotal));
  updateEditRouteTotal();
}
async function editServiceRecord(id){
  // Services uses the main form for both New and Edit.
  // This keeps templates, partidas, industry-specific fields and route logic consistent.
  startServiceEdit(id);
}



function invoiceEditorItemsHtml(items){
  const arr=(Array.isArray(items)&&items.length)?items:[{description:'',qty:1,price:0}];
  return arr.map((it,idx)=>`<div class="service-line invoice-edit-line" data-invoice-edit-line>
    <div class="line-number">${idx+1}</div>
    <input class="invoice-edit-desc" placeholder="Descripción de la partida" value="${esc(it.description||'')}">
    <input class="invoice-edit-qty" type="number" min="0" step="0.01" placeholder="Cant." value="${esc(it.qty??1)}">
    <input class="invoice-edit-price" type="number" min="0" step="0.01" placeholder="Precio" value="${esc(it.price??0)}">
    <button class="danger mini" data-remove-invoice-line type="button">×</button>
  </div>`).join('');
}
function readInvoiceEditorItems(){
  return [...document.querySelectorAll('[data-invoice-edit-line]')].map(row=>({
    description:row.querySelector('.invoice-edit-desc')?.value.trim()||'',
    qty:Number(row.querySelector('.invoice-edit-qty')?.value||0),
    price:Number(row.querySelector('.invoice-edit-price')?.value||0)
  })).filter(x=>x.description||x.qty||x.price);
}
function recalcInvoiceEditor(){
  const items=readInvoiceEditorItems();
  const subtotal=items.reduce((a,x)=>a+(Number(x.qty||0)*Number(x.price||0)),0);
  const taxPercent=Number($('edit_invoice_taxPercent')?.value||0);
  const ivu=subtotal*(taxPercent/100);
  const total=subtotal+ivu;
  const paid=Number($('edit_invoice_paid')?.dataset.value||0);
  const balance=Math.max(0,total-paid);
  if($('edit_invoice_subtotal')) $('edit_invoice_subtotal').value=subtotal.toFixed(2);
  if($('edit_invoice_ivu')) $('edit_invoice_ivu').value=ivu.toFixed(2);
  if($('edit_invoice_total')) $('edit_invoice_total').value=total.toFixed(2);
  if($('edit_invoice_balance')) $('edit_invoice_balance').textContent=money(balance);
  if($('edit_invoice_result_status')) $('edit_invoice_result_status').textContent=total<=paid?'Pagada':paid>0?'Parcial':'Pendiente';
}
function bindInvoiceEditor(){
  const addBtn=$('edit_addInvoiceLine');
  if(addBtn) addBtn.onclick=()=>{
    const box=$('editInvoiceItemsBox'); if(!box)return;
    box.insertAdjacentHTML('beforeend',invoiceEditorItemsHtml([{description:'',qty:1,price:0}]));
    bindInvoiceEditor(); recalcInvoiceEditor();
  };
  document.querySelectorAll('[data-remove-invoice-line]').forEach(btn=>btn.onclick=()=>{
    const rows=document.querySelectorAll('[data-invoice-edit-line]');
    const row=btn.closest('[data-invoice-edit-line]');
    if(rows.length>1) row.remove(); else row.querySelectorAll('input').forEach((el,i)=>el.value=i===1?'1':'');
    bindInvoiceEditor(); recalcInvoiceEditor();
  });
  document.querySelectorAll('.invoice-edit-desc,.invoice-edit-qty,.invoice-edit-price').forEach(el=>el.oninput=recalcInvoiceEditor);
  if($('edit_invoice_taxPercent')) $('edit_invoice_taxPercent').oninput=recalcInvoiceEditor;
  recalcInvoiceEditor();
}
async function editInvoiceRecord(id){
  const inv=state.invoices.find(x=>x.id===id); if(!inv)return;
  const m=ensureEditModal(); state.editing={c:'invoices',id};
  const paid=invoicePaid(inv);
  const totals=invoiceTotals(inv);
  const items=(Array.isArray(inv.items)&&inv.items.length)?inv.items:[{description:inv.serviceTitle||'Servicio',qty:1,price:totals.subtotal||inv.total||0}];
  $('editTitle').textContent=`Editar factura ${inv.number||''}`;
  $('editForm').innerHTML=`
    <div class="wide paid-invoice-editor-note"><b>${paid>0?'Esta factura tiene pagos registrados.':'Edición completa de factura'}</b><span>Los cobros asociados no se eliminarán. Al cambiar el total, el balance y el estado se recalcularán automáticamente.</span></div>
    ${input('Número de factura','edit_invoice_number','text',inv.number||'')}
    ${input('Fecha','edit_invoice_date','date',inv.date||today())}
    ${input('Vencimiento','edit_invoice_dueDate','date',inv.dueDate||'')}
    ${editSelectHtml('Cliente','edit_invoice_clientId',state.clients.map(x=>({value:x.id,label:x.name})),inv.clientId||'')}
    ${input('Servicio / título','edit_invoice_serviceTitle','text',inv.serviceTitle||inv.serviceType||'','wide')}
    <div class="wide"><div class="invoice-edit-head"><label>Partidas de la factura</label><button id="edit_addInvoiceLine" type="button" class="ghost">+ Añadir partida</button></div><div id="editInvoiceItemsBox" class="service-lines">${invoiceEditorItemsHtml(items)}</div></div>
    ${input('IVU %','edit_invoice_taxPercent','number',Number(inv.taxPercent??profile().tax??0))}
    ${input('Subtotal','edit_invoice_subtotal','number',totals.subtotal,'','readonly')}
    ${input('IVU','edit_invoice_ivu','number',totals.ivu,'','readonly')}
    ${input('Total','edit_invoice_total','number',totals.total,'','readonly')}
    <div><label>Pagado</label><div id="edit_invoice_paid" class="invoice-edit-money" data-value="${paid}">${money(paid)}</div></div>
    <div><label>Balance resultante</label><div id="edit_invoice_balance" class="invoice-edit-money">${money(invoiceBalance(inv))}</div></div>
    <div><label>Estado resultante</label><div id="edit_invoice_result_status" class="invoice-edit-money">${invoiceStatus(inv)}</div></div>
    <div class="wide"><label>Notas</label><textarea id="edit_invoice_notes" rows="3">${esc(inv.notes||'')}</textarea></div>
    <div class="wide"><label>Términos y condiciones</label><textarea id="edit_invoice_terms" rows="3">${esc(inv.terms||inv.conditions||'Pago según acuerdo.')}</textarea></div>`;
  $('editSave').onclick=async()=>{
    try{
      const client=clientBy($('edit_invoice_clientId').value);
      const newItems=readInvoiceEditorItems();
      if(!newItems.length) throw new Error('Añade al menos una partida a la factura.');
      const subtotal=newItems.reduce((a,x)=>a+(Number(x.qty||0)*Number(x.price||0)),0);
      const taxPercent=Number($('edit_invoice_taxPercent').value||0);
      const ivu=subtotal*(taxPercent/100);
      const total=subtotal+ivu;
      const status=String(inv.status||'').toLowerCase()==='cancelada'?'Cancelada':(total<=paid?'Pagada':paid>0?'Parcial':'Pendiente');
      await updateDoc(docPath('invoices',id),{
        number:$('edit_invoice_number').value.trim(),date:$('edit_invoice_date').value,dueDate:$('edit_invoice_dueDate').value,
        clientId:client.id||'',clientName:client.name||'',serviceTitle:$('edit_invoice_serviceTitle').value.trim(),
        items:newItems,subtotal,ivu,tax:ivu,taxPercent,total,status,notes:$('edit_invoice_notes').value,terms:$('edit_invoice_terms').value,updatedAt:serverTimestamp()
      });
      closeEditModal();
    }catch(err){alert(err.message||err);}
  };
  ['edit_invoice_subtotal','edit_invoice_ivu','edit_invoice_total'].forEach(x=>{const el=$(x);if(el){el.readOnly=true;el.tabIndex=-1;}});
  bindInvoiceEditor();
  m.classList.remove('hidden');
}
async function editRecord(c,id){
  if(c==='services') return editServiceRecord(id);
  if(c==='quotes') return editQuoteRecord(id);
  if(c==='invoices') return editInvoiceRecord(id);
  const arr=state[c]||[],original=arr.find(x=>x.id===id); if(!original)return;
  const r=normalizeEditRecord(c,original);
  const m=ensureEditModal(); state.editing={c,id};
  $('editTitle').textContent=`Editar ${TITLES[c]||c}`;
  const keys=editKeys(c,r);
  $('editForm').innerHTML=keys.map(k=>editFieldHtml(c,k,r[k])).join('') || '<p class="muted">No hay campos editables.</p>';
  $('editSave').onclick=async()=>{
    try{
      const data={};
      for(const k of keys){const v=readEditValue(k,r[k]); if(v!==undefined)data[k]=v;}
      if(data.clientId){const cl=clientBy(data.clientId); data.clientName=cl.name||data.clientName||'';}
      if(data.assetId!==undefined){const a=assetBy(data.assetId); data.assetName=a.id?assetName(a):'';}
      if(data.teamId!==undefined){const t=teamBy(data.teamId); data.teamName=t.name||'';}
      if(data.assignedVehicleId!==undefined){const v=assetBy(data.assignedVehicleId); data.assignedVehicleName=v.id?assetName(v):'';}
      if(data.supplierId){const s=supplierBy(data.supplierId); data.supplierName=s.name||data.supplierName||'';}
      if(data.purchaseId){const p=state.purchases.find(x=>x.id===data.purchaseId)||{}; data.purchaseNumber=p.number||p.reference||'';}
      if(data.invoiceId){const inv=state.invoices.find(x=>x.id===data.invoiceId)||{}; data.invoiceNumber=inv.number||'';}
      data.updatedAt=serverTimestamp();
      await updateDoc(docPath(c,id),data);
      closeEditModal();
    }catch(err){alert(err.message||err);}
  };
  m.classList.remove('hidden');
}
async function createInvoice(serviceId){if(!canCreate('invoices')){alert('Límite de facturas alcanzado.');show('plans');return;}const s=state.services.find(x=>x.id===serviceId);if(!s)return;const totals=invoiceTotalsFromService(s);const number='INV-'+String(Date.now()).slice(-7);await add('invoices',{number,date:today(),serviceId:s.id,clientId:s.clientId,clientName:s.clientName,serviceTitle:serviceTitle(s),items:s.items||[],fields:s.fields||[],subtotal:totals.subtotal,ivu:totals.ivu,taxPercent:totals.taxPercent,total:totals.total,status:'Pendiente',dueDate:plusDays(15),notes:'',terms:'Pago según acuerdo.'});}
function docHeader(title){const p=profile(),logo=p.logoPdf||p.logoDashboard;return `<div class="doc-page"><div class="doc-body"><div class="doc-head">${logo?`<img class="doc-logo" src="${logo}">`:''}<div class="doc-title">${esc(p.businessName||'Empresa')}</div><div>${esc(p.address||'')}</div><div>${esc(p.phone||'')} ${p.email?' · '+esc(p.email):''} ${p.web?' · '+esc(p.web):''}</div><div>${p.merchant?'Registro: '+esc(p.merchant):''}</div></div><h2 style="text-align:center">${esc(title)}</h2>`;}
function docFooter(){const p=profile();return `</div><div class="doc-foot">${esc(p.businessName||'Empresa')}</div></div>`;}
function niceDate(v){if(!v)return'';const parts=String(v).split('-');if(parts.length===3){const d=new Date(Number(parts[0]),Number(parts[1])-1,Number(parts[2]));return d.toLocaleDateString('es-PR',{year:'numeric',month:'long',day:'numeric'});}return String(v);}
function statusText(bal,paid){return bal<=0?'Pagada':paid>0?'Parcial':'Pendiente';}
function invoiceDocFooter(label,number){const p=profile();return `</div><div class="clean-doc-footer">${esc(p.businessName||'Empresa')} · ${esc(label||'DOCUMENTO')} ${esc(number||'')}</div></div>`;}
function businessDocumentHtml({label,number,date,validLabel,validDate,status,clientName,client,items,totals,paid,balance,notes,terms}){
  const p=profile(),logo=p.logoPdf||p.logoDashboard;
  const itemCount=(items||[]).length;
  const densityClass=itemCount>=14?' doc-ultra-compact':itemCount>=10?' doc-compact':itemCount>=7?' doc-balanced':'';
  const rows=(items||[]).map(it=>`<tr><td>${esc(it.description||'Servicio')}</td><td>${esc(it.qty||1)}</td><td>${money(it.price||0)}</td><td>${money(Number(it.qty||1)*Number(it.price||0))}</td></tr>`).join('');
  const hasPayment=paid!==undefined||balance!==undefined;
  return `<div class="doc-page clean-business-doc${densityClass}"><div class="doc-body">
    <div class="clean-doc-top">
      <div class="clean-doc-title"><h1>${esc(label)}</h1><p>No.: ${esc(number||'')}</p><p>Fecha: ${esc(date||'')}</p>${status?`<span class="clean-status">${esc(status)}</span>`:''}</div>
      <div class="clean-company">${logo?`<img src="${logo}" class="clean-company-logo">`:''}<h2>${esc(p.businessName||'Empresa')}</h2>${p.address?`<p>${esc(p.address)}</p>`:''}${p.phone?`<p>Tel: ${esc(p.phone)}</p>`:''}${p.email?`<p>Email: ${esc(p.email)}</p>`:''}${p.web?`<p>${esc(p.web)}</p>`:''}</div>
    </div>
    <div class="clean-rule"></div>
    <div class="clean-client-card"><div><b>Cliente</b><p>${esc(clientName||client?.name||'')}</p>${client?.phone?`<p>${esc(client.phone)}</p>`:''}<p>${esc(client?.address||client?.city||'')}</p></div><div><b>${esc(validLabel||'Válida hasta')}</b><p>${esc(validDate||'—')}</p></div></div>
    <table class="clean-items"><thead><tr><th>Descripción</th><th>Cant.</th><th>Precio</th><th>Total</th></tr></thead><tbody>${rows}</tbody></table>
    <div class="clean-total-wrap"><div class="clean-total-box"><div><span>Subtotal:</span><strong>${money(totals.subtotal)}</strong></div><div><span>IVU (${Number(totals.taxPercent||0).toFixed(2)}%):</span><strong>${money(totals.ivu)}</strong></div><div class="clean-grand"><span>TOTAL:</span><strong>${money(totals.total)}</strong></div>${hasPayment?`<div><span>Pagado:</span><strong>${money(paid||0)}</strong></div><div class="clean-balance"><span>BALANCE:</span><strong>${money(balance||0)}</strong></div>`:''}</div></div>
    <div class="clean-notes"><section><b>Notas</b><p>${esc(notes||'')}</p></section><section><b>Condiciones</b><p>${esc(terms||'')}</p></section>${p.signature?`<section class="clean-sign"><img src="${p.signature}"><p>Firma autorizada</p></section>`:''}</div>
  `+invoiceDocFooter(label,number);
}
function previewInvoice(id){
  const inv=state.invoices.find(x=>x.id===id);if(!inv)return;const c=clientBy(inv.clientId),totals=invoiceTotals(inv),bal=invoiceBalance(inv),paid=invoicePaid(inv),status=invoiceStatus(inv);
  const items=inv.items&&inv.items.length?inv.items:[{description:inv.serviceTitle||'Servicio',qty:1,price:totals.subtotal}];
  const html=businessDocumentHtml({label:'FACTURA',number:inv.number,date:niceDate(inv.date),validLabel:'Vence',validDate:inv.dueDate?niceDate(inv.dueDate):'—',status,clientName:inv.clientName,client:c,items,totals,paid,balance:bal,notes:inv.notes||'Gracias por confiar en nuestros servicios.',terms:invoicePaymentTerms(inv,inv.terms||inv.conditions||'Pago a través del método acordado.')});
  state.previewHtml=html;$('reportPreview').innerHTML=html;show('reports');
}
function previewQuote(id){
  const q=state.quotes.find(x=>x.id===id);if(!q)return;const c=clientBy(q.clientId),totals=quoteTotals(q),items=quoteItemsFallback(q);
  const html=businessDocumentHtml({label:'COTIZACIÓN',number:q.number,date:niceDate(q.date||today()),validLabel:'Válida hasta',validDate:q.validUntil?niceDate(q.validUntil):'—',status:quoteStatus(q),clientName:q.clientName,client:c,items,totals,notes:q.notes||'Cotización profesional sujeta a evaluación final y disponibilidad.',terms:q.terms||'Precios válidos hasta la fecha indicada. Aprobación requerida para iniciar servicio.'});
  state.previewHtml=html;$('reportPreview').innerHTML=html;show('reports');
}

function previewPaystub(id){
  const pmt=state.payroll.find(x=>x.id===id); if(!pmt) return;
  let html=docHeader('COMPROBANTE DE NÓMINA');
  html+=`<table class="doc-table"><tr><th>Empleado</th><td>${esc(pmt.teamName)}</td></tr><tr><th>Fecha</th><td>${esc(pmt.date)}</td></tr><tr><th>Periodo</th><td>${esc(pmt.period)}</td></tr><tr><th>Bruto</th><td>${money(pmt.gross)}</td></tr><tr><th>Bonos / comisiones</th><td>${money(pmt.bonus)}</td></tr><tr><th>Retenciones</th><td>${money(payrollRetention(pmt))}</td></tr><tr><th>Adelantos</th><td>${money(payrollAdvance(pmt))}</td></tr><tr><th>Otros descuentos</th><td>${money(payrollOtherDeductions(pmt))}</td></tr><tr><th>Total descuentos</th><td>${money(payrollTotalDeductions(pmt))}</td></tr><tr><th>Neto pagado</th><td><b>${money(payrollNet(pmt))}</b></td></tr><tr><th>Método</th><td>${esc(pmt.method)}</td></tr></table>`;
  html+=docFooter(); state.previewHtml=html; $('reportPreview')&&($('reportPreview').innerHTML=html); show('reports');
}
function preview(type){let title={executive:'REPORTE EJECUTIVO',finance:'REPORTE FINANCIERO',receivable:'CUENTAS POR COBRAR',invoices:'REPORTE DE FACTURAS',payments:'REPORTE DE COBROS',payroll:'REPORTE DE NÓMINA',retentions:'REPORTE DE RETENCIONES',suppliers:'REPORTE DE SUPLIDORES',services:'REPORTE DE SERVICIOS',quotes:'REPORTE DE COTIZACIONES',assetsClient:'ACTIVOS POR CLIENTE',assetsStatus:'ACTIVOS POR ESTADO',purchases:'COMPRAS Y CUENTAS POR PAGAR',ops:'REPORTE OPERACIONAL'}[type]||'REPORTE';let html=docHeader(title);if(type==='executive'){html+=`<table class="doc-table"><tr><th>Concepto</th><th>Total</th></tr><tr><td>Clientes</td><td>${state.clients.length}</td></tr><tr><td>Servicios</td><td>${state.services.length}</td></tr><tr><td>Facturado</td><td>${money(sum(state.invoices,'total'))}</td></tr><tr><td>Cobrado</td><td>${money(sum(state.payments,'amount'))}</td></tr><tr><td>Nómina pagada</td><td>${money(state.payroll.reduce((a,x)=>a+payrollNet(x),0))}</td></tr><tr><td>Suplidores pagados</td><td>${money(sum(state.supplierPayments,'amount'))}</td></tr></table>`;}else if(type==='finance'){const f=financialSummary();html+=`<table class="doc-table"><tr><th>Indicador</th><th>Total</th></tr><tr><td>Facturado</td><td>${money(f.invoiced)}</td></tr><tr><td>Cobrado</td><td>${money(f.paid)}</td></tr><tr><td>Por cobrar</td><td>${money(f.receivable)}</td></tr><tr><td>Vencido</td><td>${money(f.overdue)}</td></tr><tr><td>Gastos</td><td>${money(f.expenses)}</td></tr><tr><td>Caja neta</td><td>${money(f.net)}</td></tr><tr><td>Ingreso del mes</td><td>${money(f.monthIncome)}</td></tr><tr><td>Gasto del mes</td><td>${money(f.monthExpenses)}</td></tr><tr><td>Neto del mes</td><td>${money(f.monthNet)}</td></tr></table>`;}else if(type==='receivable'){const rows=state.invoices.filter(inv=>invoiceBalance(inv)>0 && invoiceStatus(inv)!=='Cancelada').map(inv=>`<tr><td>${esc(inv.number)}</td><td>${esc(inv.clientName)}</td><td>${esc(inv.dueDate||'—')}</td><td>${money(inv.total)}</td><td>${money(invoicePaid(inv))}</td><td>${money(invoiceBalance(inv))}</td><td>${esc(invoiceStatus(inv))}</td></tr>`).join('');html+=`<table class="doc-table"><tr><th>Factura</th><th>Cliente</th><th>Vence</th><th>Total</th><th>Pagado</th><th>Balance</th><th>Estado</th></tr>${rows}</table>`;}else if(type==='invoices'){html+=`<table class="doc-table"><tr><th>Factura</th><th>Cliente</th><th>Total</th><th>Pagado</th><th>Balance</th><th>Estado</th></tr>${state.invoices.map(x=>`<tr><td>${esc(x.number)}</td><td>${esc(x.clientName)}</td><td>${money(x.total)}</td><td>${money(invoicePaid(x))}</td><td>${money(invoiceBalance(x))}</td><td>${esc(invoiceStatus(x))}</td></tr>`).join('')}</table>`;}else if(type==='payments'){html+=`<table class="doc-table"><tr><th>Fecha</th><th>Factura</th><th>Método</th><th>Monto</th></tr>${state.payments.map(x=>`<tr><td>${esc(x.date)}</td><td>${esc(x.invoiceNumber)}</td><td>${esc(x.method)}</td><td>${money(x.amount)}</td></tr>`).join('')}</table>`;}else if(type==='payroll'){const bruto=sum(state.payroll,'gross'), bonos=sum(state.payroll,'bonus'), ret=state.payroll.reduce((a,x)=>a+payrollRetention(x),0), adv=state.payroll.reduce((a,x)=>a+payrollAdvance(x),0), desc=state.payroll.reduce((a,x)=>a+payrollOtherDeductions(x),0), neto=state.payroll.reduce((a,x)=>a+payrollNet(x),0);html+=`<table class="doc-table"><tr><th>Resumen</th><th>Total</th></tr><tr><td>Bruto</td><td>${money(bruto)}</td></tr><tr><td>Bonos / comisiones</td><td>${money(bonos)}</td></tr><tr><td>Retenciones</td><td>${money(ret)}</td></tr><tr><td>Adelantos</td><td>${money(adv)}</td></tr><tr><td>Otros descuentos</td><td>${money(desc)}</td></tr><tr><td>Neto pagado</td><td><b>${money(neto)}</b></td></tr></table><br><table class="doc-table"><tr><th>Fecha</th><th>Empleado</th><th>Periodo</th><th>Bruto</th><th>Retenciones</th><th>Otros desc.</th><th>Neto</th></tr>${state.payroll.map(x=>`<tr><td>${esc(x.date)}</td><td>${esc(x.teamName)}</td><td>${esc(x.period)}</td><td>${money(x.gross)}</td><td>${money(payrollRetention(x))}</td><td>${money(payrollAdvance(x)+payrollOtherDeductions(x))}</td><td>${money(payrollNet(x))}</td></tr>`).join('')}</table>`;}else if(type==='retentions'){const pending=retentionPendingAmount(), paid=retentionPaidAmount();html+=`<table class="doc-table"><tr><th>Resumen</th><th>Total</th></tr><tr><td>Retenciones pendientes</td><td>${money(pending)}</td></tr><tr><td>Retenciones pagadas</td><td>${money(paid)}</td></tr></table><br><table class="doc-table"><tr><th>Fecha</th><th>Empleado</th><th>Tipo</th><th>Destino</th><th>Monto</th><th>Estado</th><th>Fecha límite</th><th>Pagado</th></tr>${state.payrollRetentions.map(r=>`<tr><td>${esc(r.date)}</td><td>${esc(r.teamName)}</td><td>${esc(r.type)}</td><td>${esc(r.destination)}</td><td>${money(r.amount)}</td><td>${esc(retentionStatus(r))}</td><td>${esc(r.dueDate||'')}</td><td>${esc(r.paidAt||'')}</td></tr>`).join('')}</table>`;}else if(type==='retentions'){
    rows.push(['Fecha','Empleado','Tipo','Destino','Monto','Estado','Fecha límite','Pagado','Referencia']); state.payrollRetentions.forEach(r=>rows.push([r.date,r.teamName,r.type,r.destination,r.amount,retentionStatus(r),r.dueDate||'',r.paidAt||'',r.reference||'']));
  }else if(type==='suppliers'){html+=`<table class="doc-table"><tr><th>Suplidor</th><th>Compras</th><th>Pagado</th><th>Balance</th></tr>${state.suppliers.map(x=>`<tr><td>${esc(x.name)}</td><td>${money(supplierPurchasesTotal(x.id))}</td><td>${money(supplierPaid(x.id))}</td><td>${money(supplierBalance(x.id))}</td></tr>`).join('')}</table>`;}else if(type==='purchases'){html+=`<table class="doc-table"><tr><th>Fecha</th><th>Suplidor</th><th>Concepto</th><th>Total</th><th>Pagado</th><th>Balance</th><th>Estado</th></tr>${state.purchases.map(x=>`<tr><td>${esc(x.date)}</td><td>${esc(x.supplierName)}</td><td>${esc(x.concept)}</td><td>${money(x.total)}</td><td>${money(purchasePaid(x.id))}</td><td>${money(purchaseBalance(x))}</td><td>${esc(purchaseStatus(x))}</td></tr>`).join('')}</table>`;}else if(type==='ops'){const o=operationalSummary();html+=`<table class="doc-table"><tr><th>Indicador</th><th>Total</th></tr><tr><td>Empleados activos</td><td>${o.employees}</td></tr><tr><td>Nómina pendiente</td><td>${money(o.payrollDue)}</td></tr><tr><td>Suplidores</td><td>${o.suppliers}</td></tr><tr><td>Compras registradas</td><td>${o.purchases}</td></tr><tr><td>Cuentas por pagar</td><td>${money(o.purchaseDebt)}</td></tr><tr><td>Compras vencidas</td><td>${money(o.overduePurchases)}</td></tr></table>`;}else if(type==='quotes'){const rows=state.quotes.map(q=>{const t=quoteTotals(q);return `<tr><td>${esc(q.number)}</td><td>${esc(q.clientName)}</td><td>${esc(q.validUntil||'—')}</td><td>${money(t.total)}</td><td>${esc(quoteStatus(q))}</td></tr>`;}).join('');html+=`<table class="doc-table"><tr><th>Cotización</th><th>Cliente</th><th>Válida</th><th>Total</th><th>Estado</th></tr>${rows}</table>`;}else if(type==='assetsClient'){html+=`<table class="doc-table"><tr><th>Cliente</th><th>Activo</th><th>Categoría</th><th>Ubicación</th><th>Estado</th></tr>${state.assets.map(a=>`<tr><td>${esc(a.clientName||'Sin cliente')}</td><td>${esc(assetName(a))}</td><td>${esc(assetCategory(a))}</td><td>${esc(assetLocation(a))}</td><td>${esc(assetStatus(a))}</td></tr>`).join('')}</table>`;}else if(type==='assetsStatus'){const groups={};state.assets.forEach(a=>{const st=assetStatus(a);groups[st]=(groups[st]||0)+1;});html+=`<table class="doc-table"><tr><th>Estado</th><th>Cantidad</th></tr>${Object.entries(groups).map(([st,c])=>`<tr><td>${esc(st)}</td><td>${c}</td></tr>`).join('')}</table>`;}else{html+=`<table class="doc-table"><tr><th>Fecha</th><th>Cliente</th><th>Activo</th><th>Servicio</th><th>Monto</th></tr>${state.services.map(x=>`<tr><td>${esc(x.date)}</td><td>${esc(x.clientName)}</td><td>${esc(x.assetName||'')}</td><td>${esc(serviceTitle(x))}</td><td>${money(serviceAmount(x))}</td></tr>`).join('')}</table>`;}html+=docFooter();state.previewHtml=html;$('reportPreview').innerHTML=html;}

function backupPayload(){
  const payload={version:'v65',project:'Nexus Business PR',exportedAt:new Date().toISOString(),profile:profile(),data:{}};
  COLS.forEach(c=>payload.data[c]=(state[c]||[]).map(({id,...rest})=>({id,...rest})));
  return payload;
}
function downloadJsonFile(name,payload){
  const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
function exportBackup(){
  downloadJsonFile(`nexus-business-backup-${today()}.json`,backupPayload());
}
async function importDataPayload(payload){
  const data=payload?.data || payload || {};
  let imported=0;
  if(payload?.profile && confirm('¿Importar también la configuración del negocio?')){
    await setDoc(profRef(),{...payload.profile,updatedAt:serverTimestamp()},{merge:true});
  }
  for(const c of COLS){
    const rows=Array.isArray(data[c])?data[c]:[];
    for(const row of rows){
      const clean={...row};
      const id=clean.id; delete clean.id;
      if(id) await setDoc(docPath(c,id),{...clean,updatedAt:serverTimestamp()},{merge:true});
      else await addDoc(colPath(c),{...clean,createdAt:serverTimestamp(),updatedAt:serverTimestamp()});
      imported++;
    }
  }
  return imported;
}
async function handleImportFile(input){
  const file=input?.files?.[0]; if(!file) return;
  const status=$('importDataStatus'); if(status) status.textContent='Leyendo archivo...';
  try{
    const text=await file.text();
    const payload=JSON.parse(text);
    const preview=COLS.map(c=>`${c}: ${Array.isArray((payload.data||payload)[c])?(payload.data||payload)[c].length:0}`).join('\n');
    if(!confirm(`Vista previa de importación:\n${preview}\n\n¿Continuar?`)){ if(status) status.textContent='Importación cancelada.'; return; }
    const count=await importDataPayload(payload);
    if(status) status.textContent=`Importación completada: ${count} registros.`;
    alert(`Importación completada: ${count} registros.`);
  }catch(err){console.error(err); if(status) status.textContent='Error importando JSON.'; alert('No se pudo importar el archivo JSON.');}
  finally{ if(input) input.value=''; }
}
async function wipeAllData(){
  if(!confirm('Esta acción borrará TODA la data de esta cuenta: clientes, servicios, cotizaciones, facturas, cobros, seguimientos, compras, nómina y reportes. ¿Continuar?')) return;
  const token=prompt('Para confirmar escribe exactamente: BORRAR');
  if(token!=='BORRAR') return alert('Operación cancelada.');
  if(!confirm('Última confirmación: esta acción no se puede deshacer. Se descargará un backup antes de borrar.')) return;
  exportBackup();
  for(const c of COLS){
    const snap=await getDocs(colPath(c));
    for(const d of snap.docs) await deleteDoc(docPath(c,d.id));
  }
  await setDoc(profRef(),{...defaultProfile(),email:auth.currentUser?.email||profile().email||'',businessName:profile().businessName||'Mi Negocio',industry:profile().industry||'hvac',language:profile().language||'es',plan:profile().plan||'free',planStatus:profile().planStatus||'active',dataWipedAt:serverTimestamp()},{merge:false});
  state.billingFilter='all';state.billingSearch='';
  alert('Data borrada. Se mantuvo la app, el usuario y la configuración base.');
  show('dashboard');
}
function bindDataSettings(){
  const exp=$('exportBackupBtn'); if(exp) exp.onclick=exportBackup;
  const imp=$('importDataFile'); if(imp) imp.onchange=()=>handleImportFile(imp);
  const wipe=$('wipeAllDataBtn'); if(wipe) wipe.onclick=wipeAllData;
}

function fileData(input){return new Promise(res=>{const f=input?.files?.[0];if(!f)return res('');const r=new FileReader();r.onload=()=>res(r.result);r.readAsDataURL(f);});}
async function saveSettings(){const p={...profile()};['businessName','slogan','phone','whatsapp','email','web','address','merchant','representative','tax','transportRatePerMile','transportBaseCharge','dailyGoal','primaryColor','secondaryColor','language','calendarProvider','confirmafyCalendarUrl','googleCalendarUrl'].forEach(k=>p[k]=$('set_'+k)?.value||'');p.industry=$('set_industry').value;p.customServices={...(p.customServices||{})};p.customServices[p.industry]=($('set_services')?.value||'').split('\n').map(x=>x.trim()).filter(Boolean);for(const k of ['logoDashboard','logoPdf','favicon','signature']){const v=await fileData($('set_'+k));if(v)p[k]=v;}if(onboardingProgress()>=50) p.onboardingSkipped=false; await setDoc(profRef(),p,{merge:true});alert(T('Guardado.'));}


function reportRows(type){
  const rows=[];
  if(type==='executive'){
    rows.push(['Concepto','Total'],['Clientes',state.clients.length],['Servicios',state.services.length],['Facturado',sum(state.invoices,'total')],['Cobrado',sum(state.payments,'amount')],['Nómina pagada',state.payroll.reduce((a,x)=>a+payrollNet(x),0)],['Suplidores pagados',sum(state.supplierPayments,'amount')]);
  }else if(type==='finance'){
    const f=financialSummary(); rows.push(['Indicador','Total'],['Facturado',f.invoiced],['Cobrado',f.paid],['Por cobrar',f.receivable],['Vencido',f.overdue],['Gastos',f.expenses],['Caja neta',f.net],['Ingreso del mes',f.monthIncome],['Gasto del mes',f.monthExpenses],['Neto del mes',f.monthNet]);
  }else if(type==='receivable'){
    rows.push(['Factura','Cliente','Vence','Total','Pagado','Balance','Estado']); state.invoices.filter(inv=>invoiceBalance(inv)>0 && invoiceStatus(inv)!=='Cancelada').forEach(inv=>rows.push([inv.number,inv.clientName,inv.dueDate||'',inv.total,invoicePaid(inv),invoiceBalance(inv),invoiceStatus(inv)]));
  }else if(type==='invoices'){
    rows.push(['Factura','Cliente','Total','Pagado','Balance','Estado']); state.invoices.forEach(x=>rows.push([x.number,x.clientName,x.total,invoicePaid(x),invoiceBalance(x),invoiceStatus(x)]));
  }else if(type==='payments'){
    rows.push(['Fecha','Factura','Método','Monto']); state.payments.forEach(x=>rows.push([x.date,x.invoiceNumber,x.method,x.amount]));
  }else if(type==='payroll'){
    rows.push(['Fecha','Empleado','Periodo','Bruto','Bonos','Retenciones','Adelantos','Otros descuentos','Neto']); state.payroll.forEach(x=>rows.push([x.date,x.teamName,x.period,x.gross,x.bonus,payrollRetention(x),payrollAdvance(x),payrollOtherDeductions(x),payrollNet(x)]));
  }else if(type==='retentions'){
    rows.push(['Fecha','Empleado','Tipo','Destino','Monto','Estado','Fecha límite','Pagado','Referencia']); state.payrollRetentions.forEach(r=>rows.push([r.date,r.teamName,r.type,r.destination,r.amount,retentionStatus(r),r.dueDate||'',r.paidAt||'',r.reference||'']));
  }else if(type==='suppliers'){
    rows.push(['Suplidor','Compras','Pagado','Balance']); state.suppliers.forEach(x=>rows.push([x.name,supplierPurchasesTotal(x.id),supplierPaid(x.id),supplierBalance(x.id)]));
  }else if(type==='purchases'){
    rows.push(['Fecha','Suplidor','Concepto','Total','Pagado','Balance','Estado']); state.purchases.forEach(x=>rows.push([x.date,x.supplierName,x.concept,x.total,purchasePaid(x.id),purchaseBalance(x),purchaseStatus(x)]));
  }else if(type==='ops'){
    const o=operationalSummary(); rows.push(['Indicador','Total'],['Empleados activos',o.employees],['Nómina pendiente',o.payrollDue],['Suplidores',o.suppliers],['Compras registradas',o.purchases],['Cuentas por pagar',o.purchaseDebt],['Compras vencidas',o.overduePurchases]);
  }else if(type==='quotes'){
    rows.push(['Cotización','Cliente','Válida','Total','Estado']); state.quotes.forEach(q=>{const t=quoteTotals(q); rows.push([q.number,q.clientName,q.validUntil||'',t.total,quoteStatus(q)]);});
  }else if(type==='assetsClient'){
    rows.push(['Cliente','Activo','Categoría','Ubicación','Estado']); state.assets.forEach(a=>rows.push([a.clientName||'Sin cliente',assetName(a),assetCategory(a),assetLocation(a),assetStatus(a)]));
  }else if(type==='assetsStatus'){
    const groups={}; state.assets.forEach(a=>{const st=assetStatus(a); groups[st]=(groups[st]||0)+1;}); rows.push(['Estado','Cantidad']); Object.entries(groups).forEach(([st,c])=>rows.push([st,c]));
  }else{
    rows.push(['Fecha','Cliente','Activo','Servicio','Monto']); state.services.forEach(x=>rows.push([x.date,x.clientName,x.assetName||'',serviceTitle(x),serviceAmount(x)]));
  }
  return rows;
}
function csvEscape(v){return '"'+String(v??'').replace(/"/g,'""')+'"';}
function exportReport(type){
  if(lockedModule('reports')){alert('Reportes es premium.');show('plans');return;}
  const rows=reportRows(type); if(!rows.length)return;
  const csv=rows.map(r=>r.map(csvEscape).join(',')).join('\n');
  const blob=new Blob([csv],{type:'text/csv;charset=utf-8;'});
  const a=document.createElement('a');
  a.href=URL.createObjectURL(blob);
  a.download=`nexus-${type||'reporte'}.csv`;
  document.body.appendChild(a); a.click(); a.remove(); setTimeout(()=>URL.revokeObjectURL(a.href),500);
}
function currentReportType(){
  const selected=document.querySelector('.report-option.selected:not(.report-hidden)') || document.querySelector('.report-option:not(.report-hidden)');
  return selected?.dataset.reportType || 'executive';
}
function selectReport(type){
  document.querySelectorAll('.report-option').forEach(btn=>btn.classList.toggle('selected', btn.dataset.reportType===type));
}
function filterReportCenter(){
  const q=($('reportSearch')?.value||'').toLowerCase().trim();
  document.querySelectorAll('.report-option').forEach(item=>{
    const hay=(item.dataset.reportName||item.textContent||'').toLowerCase();
    item.classList.toggle('report-hidden', !!q && !hay.includes(q));
  });
  const selected=document.querySelector('.report-option.selected');
  if(selected && selected.classList.contains('report-hidden')){
    const first=document.querySelector('.report-option:not(.report-hidden)');
    if(first) selectReport(first.dataset.reportType);
  }
}
function downloadCurrentPreview(){
  const btn=$('downloadPreview'); if(btn) btn.click();
}

function bindForms(){
  $('clientForm').onsubmit=e=>{e.preventDefault();add('clients',{name:$('cName').value,phone:$('cPhone').value,email:$('cEmail').value,city:$('cCity').value,address:$('cAddress').value,accessNotes:$('cAccessNotes')?.value||'',gpsUrl:$('cGpsUrl')?.value||'',altName:$('cAltName')?.value||'',altPhone:$('cAltPhone')?.value||'',altEmail:$('cAltEmail')?.value||'',tags:readClientTags('cTags'),notes:$('cNotes')?.value||''});e.target.reset();};
  $('serviceForm').onsubmit=async e=>{
    e.preventDefault();
    const c=state.clients.find(x=>x.id===$('sClient').value)||{},t=state.team.find(x=>x.id===$('sTeam').value)||{},a=assetBy($('sAsset')?.value||'');
    const items=getServiceItems();
    const enteredTitle=($('sTitle')?.value||'').trim();
    const totalFromItems=serviceItemsTotal(items);
    const selectedService=$('sServiceType')?.value||industry().service;
    const title=enteredTitle || items[0]?.description || selectedService;
    const route=transportRouteFromForm();
    const serviceFields=industry().serviceFields.map((_,n)=>$('sF'+n)?.value||'');
    const payload={clientId:c.id||'',clientName:c.name||'',assetId:a.id||'',assetName:a.id?assetName(a):'',teamId:t.id||'',teamName:t.name||'',date:$('sDate').value,status:$('sStatus')?.value||'Pendiente',priority:$('sPriority')?.value||'Normal',serviceType:selectedService,title,amount:totalFromItems>0?totalFromItems:Number($('sAmount').value||0),items,fields:serviceFields,route};
    if(state.editingServiceId){
      await updateDoc(docPath('services',state.editingServiceId),{...payload,updatedAt:serverTimestamp()});
      resetServiceEditMode();
    }else{
      await add('services',payload);
    }
    e.target.reset();
    if($('sDate')) $('sDate').value=today();
    setServiceItems([]);
    if(isTransport()) updateTransportTotal();
  };
  $('cancelServiceEdit') && ($('cancelServiceEdit').onclick=()=>{ $('serviceForm').reset(); if($('sDate')) $('sDate').value=today(); setServiceItems([]); resetServiceEditMode(); if(isTransport()) updateTransportTotal(); });
  if($('quoteForm')) $('quoteForm').onsubmit=async e=>{e.preventDefault();const c=clientBy($('qClient')?.value||'');if(!c.id)return alert('Selecciona cliente.');const a=assetBy($('qAsset')?.value||'');const t=teamBy($('qTeam')?.value||'');const items=getQuoteItems();const subtotal=serviceItemsTotal(items);const ivu=subtotal*taxRate();const payload={clientId:c.id,clientName:c.name,assetId:a.id||'',assetName:a.id?assetName(a):'',teamId:t.id||'',teamName:t.name||'',date:$('qDate').value,validUntil:$('qValid').value,status:$('qStatus').value,priority:$('qPriority').value,serviceType:$('qServiceType').value,title:$('qTitle').value,items,subtotal,ivu,taxPercent:taxPercent(),total:subtotal+ivu,notes:$('qNotes').value,terms:$('qTerms').value,updatedAt:serverTimestamp()};if(state.editingQuoteId){await updateDoc(docPath('quotes',state.editingQuoteId),payload);resetQuoteEditMode();}else{await add('quotes',{number:quoteNumber(),...payload});}e.target.reset();setQuoteItems([{description:'',qty:1,price:''}]);};
  if($('cancelQuoteEdit')) $('cancelQuoteEdit').onclick=()=>{resetQuoteEditMode();$('quoteForm')?.reset();setQuoteItems([{description:'',qty:1,price:''}]);};
  $('teamForm').onsubmit=e=>{e.preventDefault();const v=assetBy($('tAssignedVehicle')?.value||'');add('team',{name:$('tName').value,phone:$('tPhone').value,email:$('tEmail').value,personalId:$('tPersonalId')?.value||'',ssn:formatSSNInput($('tSsn')?.value||''),driverLicense:$('tDriverLicense')?.value||'',assignedVehicleId:v.id||'',assignedVehicleName:v.id?assetName(v):'',role:$('tRole').value,status:$('tStatus')?.value||'Activo',salary:Number($('tSalary').value||0),rate:Number($('tRate').value||0),retention:Number($('tRetention').value||0),startDate:$('tStart').value});e.target.reset();};
  $('assetForm').onsubmit=e=>{e.preventDefault();const c=clientBy($('aClient')?.value||'');add('assets',{clientId:c.id||'',clientName:c.name||'',industry:profile().industry||'hvac',name:$('aName').value,category:$('aCategory').value,brand:$('aBrand')?.value||'',model:$('aModel')?.value||'',serial:$('aSerial')?.value||'',location:$('aLocation').value,status:$('aStatus').value,value:Number($('aValue').value||0),date:$('aDate').value,purchaseDate:$('aPurchaseDate')?.value||'',expirationDate:$('aExpiration')?.value||'',warrantyExpirationDate:$('aWarrantyExpiration')?.value||'',nextMaintenanceDate:$('aNextMaintenance')?.value||'',warranty:$('aWarranty').value,notes:$('aNotes').value});e.target.reset();};
  $('supplierForm').onsubmit=e=>{e.preventDefault();add('suppliers',{name:$('supName').value,phone:$('supPhone').value,whatsapp:$('supWhatsapp')?.value||'',email:$('supEmail').value,contact:$('supContact')?.value||'',category:$('supCategory')?.value||'',creditLimit:Number($('supCredit')?.value||0),openingBalance:Number($('supOpening').value||0),fields:industry().supplierFields.map((_,n)=>$('supF'+n)?.value||'')});e.target.reset();};
  $('supplierPaymentForm').onclick=e=>{if(e.target?.id==='reconcileSupplierPayments')reconcileGeneralSupplierPayments();};
  $('supplierPaymentForm').onchange=e=>{if(e.target?.id==='spSupplier')syncSupplierPurchaseOptions();};
  $('supplierPaymentForm').onsubmit=async e=>{
    e.preventDefault();
    const s=supplierBy($('spSupplier').value);if(!s.id)return alert('Selecciona suplidor.');
    const pu=state.purchases.find(x=>x.id===($('spPurchase')?.value||''))||{};
    if(pu.id&&pu.supplierId!==s.id)return alert('La compra seleccionada pertenece a otro suplidor.');
    const amount=Number($('spAmount').value||0);if(!(amount>0))return alert('Escribe un monto válido.');
    const allocations=pu.id?[]:allocationsForGeneralPayment(s.id,amount);
    await add('supplierPayments',{supplierId:s.id,supplierName:s.name,purchaseId:pu.id||'',purchaseNumber:pu.number||pu.reference||'',allocations,date:$('spDate').value,method:$('spMethod').value,amount,note:$('spNote').value});
    await add('cashflow',{date:$('spDate').value,type:'Gasto',concept:`Pago suplidor ${s.name}${pu.id?' · '+(pu.number||pu.concept):''}`,amount});
    e.target.reset();
    if(!pu.id&&allocations.length){alert(`Pago registrado. ${money(allocations.reduce((a,x)=>a+Number(x.amount||0),0))} aplicado automáticamente a ${allocations.length} compra(s) pendiente(s).`);}
  };
  $('payrollForm').onsubmit=async e=>{e.preventDefault();const t=teamBy($('prTeam').value);if(!t.id)return alert('Selecciona empleado/equipo.');const gross=Number($('prGross').value||0),bonus=Number($('prBonus')?.value||0),retention=Number($('prRetention')?.value||0),ded=Number($('prDeductions').value||0),adv=Number($('prAdvance')?.value||0),retType=$('prRetentionType')?.value||'Hacienda',retDest=$('prRetentionDest')?.value||'Departamento de Hacienda',retDue=$('prRetentionDue')?.value||plusDays(15),net=Math.max(0,gross+bonus-retention-ded-adv);const payrollRef=await add('payroll',{teamId:t.id,teamName:t.name,date:$('prDate').value,period:$('prPeriod').value,hours:Number($('prHours')?.value||0),overtime:Number($('prOvertime')?.value||0),gross,bonus,retention,retentionType:retType,retentionDestination:retDest,retentionDueDate:retDue,advance:adv,deductions:ded,totalDeductions:retention+ded+adv,net,method:$('prMethod').value,note:$('prNote').value});const payrollId=payrollRef?.id||'';if(retention>0){await add('payrollRetentions',{payrollId,teamId:t.id,teamName:t.name,date:$('prDate').value,type:retType,destination:retDest,amount:retention,status:'Pendiente',dueDate:retDue,note:$('prNote').value});}if(adv>0){await add('payrollRetentions',{payrollId,teamId:t.id,teamName:t.name,date:$('prDate').value,type:'Adelanto al empleado',destination:t.name,amount:adv,status:'Aplicada',dueDate:$('prDate').value,paidAt:$('prDate').value,note:'Adelanto descontado en nómina'});}if(ded>0){await add('payrollRetentions',{payrollId,teamId:t.id,teamName:t.name,date:$('prDate').value,type:'Descuento interno',destination:'Empresa',amount:ded,status:'Aplicada',dueDate:$('prDate').value,paidAt:$('prDate').value,note:'Descuento aplicado en nómina'});}await add('cashflow',{date:$('prDate').value,type:'Gasto',concept:`Nómina ${t.name}`,amount:net,note:`Bruto ${money(gross)} · Bonos ${money(bonus)} · Retenciones ${money(retention)} → ${retDest} · Adelantos ${money(adv)} · Otros descuentos ${money(ded)} · Neto ${money(net)}`});e.target.reset();};
  $('purchaseForm').onsubmit=e=>{e.preventDefault();const s=supplierBy($('puSupplier').value);if(!s.id)return alert('Selecciona suplidor.');const subtotal=Number($('puSubtotal').value||0),tax=Number($('puTax').value||0),total=subtotal+tax;add('purchases',{supplierId:s.id,supplierName:s.name,date:$('puDate').value,dueDate:$('puDue').value,concept:$('puConcept').value,reference:$('puRef').value,number:$('puRef').value||('PO-'+String(Date.now()).slice(-6)),subtotal,tax,total,status:$('puStatus').value,note:$('puNote').value});e.target.reset();};
  $('paymentForm').onsubmit=async e=>{e.preventDefault();const inv=state.invoices.find(x=>x.id===$('pInvoice').value);if(!inv)return alert('Selecciona factura.');if(invoiceStatus(inv)==='Cancelada')return alert('No se puede cobrar una factura cancelada.');const amount=Number($('pAmount').value||0);if(amount<=0)return alert('Monto inválido.');const bal=invoiceBalance(inv);if(amount>bal+0.01 && !confirm('El cobro excede el balance. ¿Registrar de todos modos?')) return;const selectedMethod=$('pMethod').value;await add('payments',{invoiceId:inv.id,invoiceNumber:inv.number,date:$('pDate').value,method:selectedMethod,amount,note:$('pNote').value});await add('cashflow',{date:$('pDate').value,type:'Ingreso',concept:`Cobro ${inv.number}`,amount});const newBal=Math.max(0,bal-amount);await updateDoc(docPath('invoices',inv.id),{status:newBal<=0?'Pagada':amount>0?'Parcial':invoiceStatus(inv),paymentMethod:selectedMethod,updatedAt:serverTimestamp()});e.target.reset();};
  $('cashForm').onsubmit=e=>{e.preventDefault();add('cashflow',{date:$('xDate').value,type:$('xType').value,concept:$('xConcept').value,amount:Number($('xAmount').value||0)});e.target.reset();};
  $('saveSettings').onclick=saveSettings;$('invoiceFromService').onclick=()=>{const s=state.services.find(s=>!state.invoices.some(i=>i.serviceId===s.id));if(s)createInvoice(s.id);else alert('No hay servicios pendientes de facturar.');};
  document.querySelectorAll('.report-option').forEach(b=>b.onclick=()=>selectReport(b.dataset.reportType));
  if($('reportViewBtn')) $('reportViewBtn').onclick=()=>{if(lockedModule('reports')){alert('Reportes es premium.');show('plans');return;}preview(currentReportType());};
  if($('reportPdfBtn')) $('reportPdfBtn').onclick=()=>{if(lockedModule('reports')){alert('Reportes es premium.');show('plans');return;}preview(currentReportType());setTimeout(downloadCurrentPreview,250);};
  if($('reportExportBtn')) $('reportExportBtn').onclick=()=>exportReport(currentReportType());
  if($('reportSearch')) $('reportSearch').oninput=filterReportCenter;
  $('printPreview').onclick=()=>{const html=state.previewHtml||$('reportPreview').innerHTML;const w=open('','_blank');if(!w){alert('El navegador bloqueó la ventana de impresión. Permite ventanas emergentes para este sitio e intenta nuevamente.');return;}w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title></title><link rel="stylesheet" href="styles.css?v=98"><style>@page{size:letter;margin:.38in;}html,body{margin:0!important;padding:0!important;background:#fff!important;width:100%!important;}body{display:block!important;-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important;}.doc-page{box-sizing:border-box!important;width:100%!important;max-width:none!important;min-height:calc(11in - .76in)!important;margin:0!important;padding:0!important;border:0!important;box-shadow:none!important;transform:none!important;zoom:1!important;display:flex!important;flex-direction:column!important;overflow:visible!important;}.doc-body{flex:1 1 auto!important;padding:0 0 .08in 0!important;}.doc-foot,.clean-doc-footer{position:static!important;margin-top:auto!important;text-align:center!important;}.doc-table,.clean-items{width:100%!important;table-layout:fixed!important;}.clean-items td,.clean-items th{overflow-wrap:anywhere!important;word-break:normal!important;}@media print{html,body{width:100%!important;height:auto!important}.doc-page{page-break-after:auto!important;break-after:auto!important}}</style></head><body>${html}<script>window.addEventListener('load',()=>setTimeout(()=>{window.focus();window.print();},500));<\/script></body></html>`);w.document.close();};
  $('downloadPreview').onclick=async()=>{const btn=$('downloadPreview');const original=btn?.textContent||'Descargar PDF';try{if(!window.html2canvas)throw new Error('html2canvas no está disponible');if(!window.jspdf?.jsPDF)throw new Error('jsPDF no está disponible');if(btn){btn.disabled=true;btn.textContent='Generando PDF...';}const host=document.createElement('div');host.style.cssText='position:fixed;left:-12000px;top:0;width:816px;background:#fff;z-index:-1;pointer-events:none;';host.innerHTML=state.previewHtml||$('reportPreview').innerHTML;document.body.appendChild(host);const page=host.querySelector('.doc-page')||host.firstElementChild||host;page.style.boxSizing='border-box';page.style.width='816px';page.style.maxWidth='816px';page.style.margin='0';page.style.boxShadow='none';page.style.border='0';page.style.background='#fff';await new Promise(r=>setTimeout(r,120));const canvas=await window.html2canvas(page,{scale:2,useCORS:true,allowTaint:true,backgroundColor:'#ffffff',logging:false,windowWidth:816,scrollX:0,scrollY:0});host.remove();const {jsPDF}=window.jspdf;const pdf=new jsPDF({unit:'pt',format:'letter',orientation:'portrait',compress:true});const pageW=pdf.internal.pageSize.getWidth(),pageH=pdf.internal.pageSize.getHeight(),margin=24,usableW=pageW-margin*2,usableH=pageH-margin*2;const imgW=canvas.width,imgH=canvas.height;const scale=Math.min(usableW/imgW,usableH/imgH);const drawW=imgW*scale,drawH=imgH*scale;const x=(pageW-drawW)/2,y=margin;const img=canvas.toDataURL('image/jpeg',0.96);pdf.addImage(img,'JPEG',x,y,drawW,drawH,undefined,'FAST');pdf.save('nexus-documento.pdf');}catch(err){console.error('PDF export error',err);alert('No se pudo generar el PDF. Recarga Nexus e inténtalo otra vez.');}finally{if(btn){btn.disabled=false;btn.textContent=original;}}};
  if($('sideUpgrade')) $('sideUpgrade').onclick=()=>{if(canUpgradePlan())show('plans');};$('mobileMenu').onclick=()=>document.querySelector('.sidebar').classList.toggle('open');$('logoutBtn').onclick=()=>signOut(auth);if($('globalSearch')) $('globalSearch').oninput=renderGlobalSearch;
}


/* V50 CLEAN: Seguimiento + Report Center por fechas */
function v50PlusMonths(dateString, months=6){
  const base=dateString?new Date(String(dateString)+'T12:00:00'):new Date();
  if(Number.isNaN(base.getTime())) return plusDays(180);
  const day=base.getDate();
  base.setMonth(base.getMonth()+Number(months||6));
  if(base.getDate()<day) base.setDate(0);
  return base.toISOString().slice(0,10);
}
function followupStatus(f){
  const stored=String(f?.status||'').trim();
  if(stored==='Completado' || stored==='Cancelado') return stored;
  const due=String(f?.dueDate||'');
  if(due && due<today()) return 'Vencido';
  if(due && due<=plusDays(14)) return 'Próximo';
  return stored || 'Programado';
}
function followupSummary(){
  const rows=state.followups||[];
  const open=rows.filter(f=>!['Completado','Cancelado'].includes(followupStatus(f)));
  const dueSoon=rows.filter(f=>['Programado','Próximo'].includes(followupStatus(f)) && String(f.dueDate||'')>=today() && String(f.dueDate||'')<=plusDays(14));
  const overdue=rows.filter(f=>followupStatus(f)==='Vencido');
  return {total:rows.length,open:open.length,dueSoon:dueSoon.length,overdue:overdue.length,maintenance:rows.filter(f=>f.type==='Mantenimiento').length,quotes:rows.filter(f=>f.type==='Cotización').length,installations:rows.filter(f=>f.type==='Instalación').length};
}
const OASIS_BOOKING_URL='https://confirmafy.com/oasis-services-pr';
function calendarProvider(){return String(profile().calendarProvider||'confirmafy').toLowerCase();}
function configuredCalendarUrl(){
  const p=profile(), provider=calendarProvider();
  const confirmafy=String(p.confirmafyCalendarUrl||OASIS_BOOKING_URL).trim();
  const google=String(p.googleCalendarUrl||'').trim();
  return provider==='google' ? (google||confirmafy||OASIS_BOOKING_URL) : (confirmafy||google||OASIS_BOOKING_URL);
}
function configuredCalendarLabel(){return calendarProvider()==='google'?'Google Calendar':'Confirmafy';}
function openConfiguredCalendar(){
  const url=configuredCalendarUrl();
  if(!url){alert('Configura primero el enlace del calendario en Configuración.');return;}
  window.open(url,'_blank','noopener');
}
function isQuoteFollowup(f){
  const type=String(f?.type||'').toLowerCase();
  const source=String(f?.sourceType||'').toLowerCase();
  const title=String(f?.title||'').toLowerCase();
  return type.includes('cotiz') || source==='quote' || title.includes('cotiz');
}
function followupMessage(f){
  const c=clientBy(f.clientId||'');
  const name=String(f.clientName||c.name||'').trim();
  if(isQuoteFollowup(f)){
    const quote=state.quotes.find(q=>q.id===f.sourceId) || {};
    const number=String(f.quoteNumber||quote.number||'').trim();
    const reference=number ? ` ${number}` : '';
    return `Hola${name?', '+name:''}. 👋

Le escribimos para dar seguimiento a la cotización${reference} que le enviamos. Deseamos confirmar si pudo revisarla y saber si tiene alguna pregunta, necesita algún ajuste o desea continuar con el servicio.

Quedamos atentos para ayudarle y coordinar los próximos pasos.

Gracias por considerar a Oasis Air Cleaner Services LLC.`;
  }
  return `Hola${name?', '+name:''}. 👋

Solo queríamos darle seguimiento desde nuestra última visita para asegurarnos de que su aire acondicionado continúe funcionando correctamente.

Si desea programar su próximo mantenimiento o necesita asistencia, estaremos encantados de ayudarle.

📅 Agende su cita cuando le sea más conveniente:
${configuredCalendarUrl()}

Gracias por confiar en Oasis Air Cleaner Services LLC.`;
}
function followupWhatsappUrl(f){
  const c=clientBy(f.clientId||'');
  const raw=String(c.whatsapp||c.phone||'').replace(/\D/g,'');
  const phone=raw.length===10?'1'+raw:raw;
  return `https://wa.me/${phone}?text=${encodeURIComponent(followupMessage(f))}`;
}
async function sendFollowupWhatsapp(id){
  const f=(state.followups||[]).find(x=>x.id===id); if(!f) return;
  const url=followupWhatsappUrl(f);
  open(url,'_blank');
  const sentAt=new Date().toISOString();
  await updateDoc(docPath('followups',id),{status:'En espera de ser atendido',sentAt,lastSentAt:sentAt,channel:'WhatsApp',updatedAt:serverTimestamp()}).catch(console.warn);
  if(f.clientId) await updateDoc(docPath('clients',f.clientId),{followupStatus:'En espera de ser atendido',lastFollowupAt:sentAt,updatedAt:serverTimestamp()}).catch(console.warn);
}
async function completeFollowup(id){
  const f=(state.followups||[]).find(x=>x.id===id); if(!f)return;
  await updateDoc(docPath('followups',id),{status:'Completado',completedAt:today(),updatedAt:serverTimestamp()});
  if(String(f.type||'')==='Mantenimiento'){
    const copy={...f,status:'Programado',dueDate:v50PlusMonths(f.dueDate||today(),Number(f.intervalMonths||6)),completedAt:'',note:f.note||'Mantenimiento recurrente estándar cada 6 meses.'};
    delete copy.id; delete copy.createdAt; delete copy.updatedAt;
    await add('followups',copy);
  }
}
async function createMaintenanceFollowupFromService(service){
  if(!service?.id || !canCreate('followups')) return;
  const exists=(state.followups||[]).some(f=>f.sourceId===service.id && f.sourceType==='service' && String(f.type||'')==='Mantenimiento' && followupStatus(f)!=='Cancelado');
  if(exists) return;
  const a=assetBy(service.assetId||'');
  await add('followups',{clientId:service.clientId||'',clientName:service.clientName||'',assetId:service.assetId||'',assetName:service.assetName||assetName(a)||'',sourceType:'service',sourceId:service.id,type:'Mantenimiento',title:'Mantenimiento preventivo 6 meses',dueDate:v50PlusMonths(service.date||today(),6),intervalMonths:6,status:'Programado',priority:'Normal',channel:'WhatsApp',note:'Seguimiento automático estándar: mantenimiento preventivo cada 6 meses.'});
}
async function ensureQuoteFollowup(quote){
  if(!quote?.id || !canCreate('followups')) return;
  const exists=(state.followups||[]).some(f=>f.sourceType==='quote' && f.sourceId===quote.id);
  if(exists) return;
  await add('followups',{clientId:quote.clientId||'',clientName:quote.clientName||'',assetId:quote.assetId||'',assetName:quote.assetName||'',sourceType:'quote',sourceId:quote.id,quoteNumber:quote.number||'',type:'Cotización',title:'Seguimiento de cotización '+(quote.number||''),dueDate:plusDays(2),intervalMonths:0,status:'Programado',priority:quote.priority||'Normal',channel:'WhatsApp',note:'Dar seguimiento a cotización enviada.'});
}
function renderFollowupForm(){
  if(!$('followupForm')) return;
  const selectedClient=$('fClient')?.value||'';
  const clientsAlphabetical=[...(state.clients||[])]
    .filter(c=>c&&c.id)
    .sort((a,b)=>String(a.name||'').localeCompare(String(b.name||''),'es',{sensitivity:'base',numeric:true}));
  $('followupForm').innerHTML=select('Cliente','fClient',clientsAlphabetical.map(c=>({value:c.id,label:c.name||'Cliente sin nombre'})),selectedClient)+select('Activo relacionado','fAsset',[{value:'',label:'Sin activo'}].concat(state.assets.map(a=>({value:a.id,label:assetLabel(a)}))),'')+select('Tipo','fType',['Mantenimiento','Cotización','Instalación','Servicio','Garantía','Cobro','Otro'].map(x=>({value:x,label:x})),'Mantenimiento')+input('Título / asunto','fTitle','text','Mantenimiento preventivo 6 meses','wide')+input('Fecha seguimiento','fDueDate','date',v50PlusMonths(today(),6))+input('Intervalo meses','fInterval','number','6')+select('Estado','fStatus',['Programado','Próximo','Completado','Cancelado'].map(x=>({value:x,label:x})),'Programado')+select('Prioridad','fPriority',['Normal','Alta','Urgente'].map(x=>({value:x,label:x})),'Normal')+select('Canal','fChannel',['WhatsApp','Llamada','Email','Visita'].map(x=>({value:x,label:x})),'WhatsApp')+input('Notas','fNote','text','','wide')+'<button class="primary" type="submit">Guardar seguimiento</button>';
}
function renderFollowupsTable(){
  const box=$('followupsTable'); if(!box) return;
  const rows=[...(state.followups||[])].sort((a,b)=>String(a.dueDate||'').localeCompare(String(b.dueDate||''))).map(f=>{
    const c=clientBy(f.clientId||''); const st=followupStatus(f); const phone=c.whatsapp||c.phone||'';
    return `<tr><td><b>${esc(f.dueDate||'')}</b><br><span class="tag">${esc(f.priority||'Normal')}</span></td><td>${esc(f.clientName||c.name||'')}<br><span class="muted">${esc(phone)}</span></td><td>${esc(f.assetName||'')}</td><td><b>${esc(f.title||f.type||'Seguimiento')}</b><br><span class="muted">${esc(f.type||'')}</span></td><td>${statusChip(st)}</td><td>${esc(f.note||'')}</td><td><div class="actions">${phone?`<button data-whatsapp-followup="${f.id}" type="button">WhatsApp</button>`:''}${st!=='Completado'?`<button data-complete-followup="${f.id}" type="button">Completar</button>`:''}${action('followups',f.id)}</div></td></tr>`;
  });
  box.innerHTML=table(['Fecha','Cliente','Activo','Seguimiento','Estado','Notas','Acción'],rows);
  document.querySelectorAll('[data-whatsapp-followup]').forEach(b=>b.onclick=()=>{const f=state.followups.find(x=>x.id===b.dataset.whatsappFollowup); if(f) sendFollowupWhatsapp(f.id);});
  document.querySelectorAll('[data-complete-followup]').forEach(b=>b.onclick=()=>completeFollowup(b.dataset.completeFollowup));
}
function bindFollowupForm(){
  if(!$('followupForm') || $('followupForm').dataset.bound==='1') return;
  $('followupForm').dataset.bound='1';
  $('followupForm').onsubmit=e=>{e.preventDefault();const c=clientBy($('fClient')?.value||''),a=assetBy($('fAsset')?.value||'');add('followups',{clientId:c.id||'',clientName:c.name||'',assetId:a.id||'',assetName:a.id?assetName(a):'',type:$('fType').value,title:$('fTitle').value,dueDate:$('fDueDate').value,intervalMonths:Number($('fInterval').value||6),status:$('fStatus').value,priority:$('fPriority').value,channel:$('fChannel').value,note:$('fNote').value,sourceType:'manual',sourceId:''});e.target.reset();};
}
function reportRange(){return {from:$('reportFrom')?.value||'',to:$('reportTo')?.value||''};}
function reportDateOf(row,type){
  if(type==='followups') return row.dueDate||row.date||'';
  if(type==='receivable') return row.dueDate||row.date||'';
  if(type==='quotes') return row.date||row.validUntil||'';
  if(type==='assetsClient'||type==='assetsStatus'||type==='suppliers'||type==='ops') return row.date||row.createdAt?.seconds||'';
  return row.date||row.dueDate||row.createdAt?.seconds||'';
}
function inReportRange(row,type){
  const {from,to}=reportRange(); if(!from && !to) return true;
  const d=String(reportDateOf(row,type)||'').slice(0,10); if(!d) return false;
  if(from && d<from) return false; if(to && d>to) return false; return true;
}
function withFilteredState(type,fn){
  const old={services:state.services,quotes:state.quotes,followups:state.followups,invoices:state.invoices,payments:state.payments,payroll:state.payroll,payrollRetentions:state.payrollRetentions,purchases:state.purchases,supplierPayments:state.supplierPayments,cashflow:state.cashflow,assets:state.assets};
  try{
    state.services=old.services.filter(x=>inReportRange(x,'services'));
    state.quotes=old.quotes.filter(x=>inReportRange(x,'quotes'));
    state.followups=old.followups.filter(x=>inReportRange(x,'followups'));
    state.invoices=old.invoices.filter(x=>inReportRange(x,type==='receivable'?'receivable':'invoices'));
    state.payments=old.payments.filter(x=>inReportRange(x,'payments'));
    state.payroll=old.payroll.filter(x=>inReportRange(x,'payroll'));
    state.payrollRetentions=old.payrollRetentions.filter(x=>inReportRange(x,'retentions'));
    state.purchases=old.purchases.filter(x=>inReportRange(x,'purchases'));
    state.supplierPayments=old.supplierPayments.filter(x=>inReportRange(x,'supplierPayments'));
    state.cashflow=old.cashflow.filter(x=>inReportRange(x,'cashflow'));
    return fn();
  }finally{Object.assign(state,old);}
}
function selectedReportPeriodHtml(){const {from,to}=reportRange();return (from||to)?`<p><b>Periodo:</b> ${esc(from||'Inicio')} al ${esc(to||'Hoy')}</p>`:'';}
function previewFollowupsReport(){
  let html=docHeader('REPORTE DE SEGUIMIENTO').replace('</h2>','</h2>'+selectedReportPeriodHtml());
  const rows=(state.followups||[]).sort((a,b)=>String(a.dueDate||'').localeCompare(String(b.dueDate||''))).map(f=>`<tr><td>${esc(f.dueDate||'')}</td><td>${esc(f.clientName||'')}</td><td>${esc(f.type||'')}</td><td>${esc(f.title||'')}</td><td>${esc(followupStatus(f))}</td><td>${esc(f.note||'')}</td></tr>`).join('');
  html+=`<table class="doc-table"><tr><th>Fecha</th><th>Cliente</th><th>Tipo</th><th>Seguimiento</th><th>Estado</th><th>Notas</th></tr>${rows}</table>`+docFooter();
  state.previewHtml=html; $('reportPreview').innerHTML=html;
}
const __v50Forms=forms;
forms=function(){__v50Forms();renderFollowupForm();};
const __v50Tables=tables;
tables=function(){__v50Tables();renderFollowupsTable();};
const __v50BindForms=bindForms;
bindForms=function(){__v50BindForms();bindFollowupForm();};
const __v50Kpis=kpis;
kpis=function(){__v50Kpis();const fu=followupSummary();const k=$('kpis');if(k && state.activeView==='dashboard'){k.insertAdjacentHTML('beforeend',`<div class="kpi" onclick="show('followups')"><span>Seguimientos</span><b>${fu.open}</b><small>${fu.dueSoon} próximos · ${fu.overdue} vencidos</small></div>`);}};
const __v50Preview=preview;
preview=function(type){
  if(type==='followups') return withFilteredState(type,previewFollowupsReport);
  return withFilteredState(type,()=>__v50Preview(type));
};
const __v50ReportRows=reportRows;
reportRows=function(type){
  if(type==='followups') return withFilteredState(type,()=>{const rows=[['Fecha','Cliente','Activo','Tipo','Seguimiento','Estado','Prioridad','Canal','Notas']];state.followups.forEach(f=>rows.push([f.dueDate||'',f.clientName||'',f.assetName||'',f.type||'',f.title||'',followupStatus(f),f.priority||'',f.channel||'',f.note||'']));return rows;});
  return withFilteredState(type,()=>__v50ReportRows(type));
};


const __v50Add=add;
add=async function(c,data){
  const ref=await __v50Add(c,data);
  try{
    if(ref?.id && c==='quotes') await ensureQuoteFollowup({...data,id:ref.id});
    if(ref?.id && c==='services' && (data.status==='Completado' || String(data.serviceType||data.title||'').toLowerCase().includes('instal'))) await createMaintenanceFollowupFromService({...data,id:ref.id});
  }catch(e){console.warn('Seguimiento automático no creado:',e);}
  return ref;
};

function authUI(){$('authIndustry').innerHTML=Object.entries(INDUSTRIES).map(([id,x])=>`<option value="${id}">${T(x.name)}</option>`).join('');$('showLogin').onclick=()=>{mode='login';document.querySelectorAll('.register-only').forEach(x=>x.classList.add('hidden'));$('authSubmit').textContent=T('Entrar');$('showLogin').classList.add('active');$('showRegister').classList.remove('active');};$('showRegister').onclick=()=>{mode='register';document.querySelectorAll('.register-only').forEach(x=>x.classList.remove('hidden'));$('authSubmit').textContent=T('Crear cuenta');$('showRegister').classList.add('active');$('showLogin').classList.remove('active');};$('authForm').onsubmit=async e=>{e.preventDefault();$('authMsg').textContent=T('Procesando...');try{if(mode==='register'){const cred=await createUserWithEmailAndPassword(auth,$('authEmail').value,$('authPassword').value);await setDoc(doc(db,'users',cred.user.uid),{...defaultProfile(),businessName:$('authBusiness').value||'Mi Negocio',industry:$('authIndustry').value,email:$('authEmail').value});}else await signInWithEmailAndPassword(auth,$('authEmail').value,$('authPassword').value);$('authMsg').textContent='';}catch(err){$('authMsg').textContent=err.message;}};}
let portalSyncTimer=null;
function scheduleEnabledPortalSync(){
  clearTimeout(portalSyncTimer);
  portalSyncTimer=setTimeout(async()=>{
    const enabled=(state.clients||[]).filter(c=>c.portalEnabled&&c.portalToken);
    for(const c of enabled){
      try{await syncClientPortal(c.id,{openAfter:false,copyLink:false,notify:false});}
      catch(e){console.warn('No se pudo sincronizar portal de '+(c.name||c.id),e);}
    }
  },1200);
}
async function load(){unsub.forEach(x=>x());unsub=[];const snap=await getDoc(profRef());if(!snap.exists())await setDoc(profRef(),defaultProfile());unsub.push(onSnapshot(profRef(),s=>{state.profile=s.data()||defaultProfile();render();}));COLS.forEach(c=>unsub.push(onSnapshot(colPath(c),s=>{state[c]=s.docs.map(d=>({id:d.id,...d.data()}));$('syncStatus').textContent=T('Sincronizado');render();if(['clients','services','quotes','followups','invoices','payments','assets'].includes(c))scheduleEnabledPortalSync();},e=>{$('syncStatus').textContent=T('Firebase bloqueado');console.error(e);})));}
authUI();bindForms();onAuthStateChanged(auth,u=>{if(u){$('authScreen').classList.add('hidden');$('appShell').classList.remove('hidden');load();}else{$('authScreen').classList.remove('hidden');$('appShell').classList.add('hidden');}});

/* V66 — Search Center por módulo
   Añade buscadores propios sin eliminar funciones existentes. */
state.moduleFilters = state.moduleFilters || {};
function v66Filter(module){
  state.moduleFilters = state.moduleFilters || {};
  state.moduleFilters[module] = state.moduleFilters[module] || {q:'',from:'',to:'',status:'all'};
  return state.moduleFilters[module];
}
function v66DateValue(row,module){
  const value = module==='followups' ? (row.dueDate||row.date) :
    module==='quotes' ? (row.date||row.validUntil) :
    module==='billing' ? (row.date||row.dueDate) :
    module==='purchases' ? (row.date||row.dueDate) :
    module==='team' ? (row.startDate||row.date) :
    (row.date||row.dueDate||row.createdAt?.seconds||'');
  if(typeof value === 'number') return new Date(value*1000).toISOString().slice(0,10);
  return String(value||'').slice(0,10);
}
function v66Status(row,module){
  try{
    if(module==='billing') return invoiceStatus(row);
    if(module==='quotes') return quoteStatus(row);
    if(module==='followups') return followupStatus(row);
    if(module==='purchases') return purchaseStatus(row);
    if(module==='assets') return assetStatus(row);
  }catch(e){}
  return String(row.status||row.type||'').trim();
}
function v66NormalizeSearch(value){
  return String(value ?? '')
    .normalize('NFD').replace(/[\u0300-\u036f]/g,'')
    .replace(/[^a-zA-Z0-9@.]+/g,' ')
    .toLowerCase().trim();
}
function v66SearchText(row,module){
  const safe = v => String(v ?? '');
  const base = [
    row.number,row.reference,row.invoiceNumber,row.quoteNumber,row.clientName,row.name,row.title,row.concept,row.serviceTitle,
    row.serviceType,row.assetName,row.teamName,row.supplierName,row.phone,row.whatsapp,row.altPhone,row.email,row.altEmail,row.city,row.address,row.status,
    row.note,row.notes,row.terms,row.method,row.category,row.location,row.role,row.personalId,row.driverLicense,row.serial,row.vin,row.plate,row.expirationDate,row.warranty
  ];
  if(Array.isArray(row.tags)) base.push(row.tags.join(' '));
  if(Array.isArray(row.fields)) base.push(row.fields.map(f=>typeof f==='object'?Object.values(f).join(' '):f).join(' '));
  if(Array.isArray(row.items)) base.push(row.items.map(i=>[i.description,i.desc,i.name,i.qty,i.price,i.total].join(' ')).join(' '));
  if(row.route) base.push([row.route.origin,row.route.destination,row.route.miles].join(' '));
  base.push(v66Status(row,module));
  const raw=base.map(safe).join(' ');
  return v66NormalizeSearch(raw)+' '+raw.replace(/\D/g,'');
}
function v66ApplyModuleFilter(rows,module){
  const f=v66Filter(module);
  const q=v66NormalizeSearch(f.q||'');
  const digits=String(f.q||'').replace(/\D/g,'');
  const tokens=q.split(/\s+/).filter(Boolean);
  return [...(rows||[])].filter(row=>{
    const hay=v66SearchText(row,module);
    if(tokens.length && !tokens.every(token=>hay.includes(token))) return false;
    if(digits.length>=3 && !hay.includes(digits)) return false;
    const d=v66DateValue(row,module);
    if(f.from && (!d || d<f.from)) return false;
    if(f.to && (!d || d>f.to)) return false;
    if(f.status && f.status!=='all'){
      const st=v66Status(row,module).toLowerCase();
      if(st!==String(f.status).toLowerCase()) return false;
    }
    return true;
  });
}
function v66UniqueStatuses(rows,module){
  return [...new Set((rows||[]).map(r=>v66Status(r,module)).filter(Boolean))].sort();
}
function v66Toolbar(module,label,placeholder,rows,{dates=true,status=true}={}){
  const f=v66Filter(module);
  const statuses=v66UniqueStatuses(rows,module);
  return `<div class="module-search-bar" data-module-search="${esc(module)}">
    <div class="module-search-title"><b>${esc(label)}</b><small>${rows.length} registros</small></div>
    <input id="${module}Search" type="search" value="${esc(f.q)}" placeholder="${esc(placeholder)}">
    ${dates?`<input id="${module}From" type="date" value="${esc(f.from)}"><input id="${module}To" type="date" value="${esc(f.to)}">`:''}
    ${status&&statuses.length?`<select id="${module}Status"><option value="all">Todos los estados</option>${statuses.map(s=>`<option value="${esc(s)}" ${String(f.status)===String(s)?'selected':''}>${esc(s)}</option>`).join('')}</select>`:''}
    <button type="button" data-clear-module-filter="${esc(module)}">Limpiar</button>
  </div>`;
}
const v66SearchTimers={};
function v68RefreshSearch(module, sourceInput){
  const value=sourceInput?.value ?? v66Filter(module).q ?? '';
  const start=sourceInput?.selectionStart ?? value.length;
  const end=sourceInput?.selectionEnd ?? start;
  v66Filter(module).q=value;
  tables();
  requestAnimationFrame(()=>{
    const replacement=$(module+'Search');
    if(!replacement) return;
    replacement.focus({preventScroll:true});
    try{ replacement.setSelectionRange(start,end); }catch(e){}
  });
}
function v66BindToolbar(module){
  const search=$(module+'Search');
  if(search){
    search.oninput=()=>{
      v66Filter(module).q=search.value;
      clearTimeout(v66SearchTimers[module]);
      v66SearchTimers[module]=setTimeout(()=>v68RefreshSearch(module,search),750);
    };
    search.onkeydown=e=>{
      if(e.key==='Enter'){
        e.preventDefault();
        clearTimeout(v66SearchTimers[module]);
        v68RefreshSearch(module,search);
      }
    };
    search.onsearch=()=>{
      clearTimeout(v66SearchTimers[module]);
      v68RefreshSearch(module,search);
    };
  }
  const bindImmediate=(id,key)=>{const el=$(id);if(!el)return;el.onchange=()=>{v66Filter(module)[key]=el.value;tables();};};
  bindImmediate(module+'From','from'); bindImmediate(module+'To','to'); bindImmediate(module+'Status','status');
  document.querySelectorAll(`[data-clear-module-filter="${module}"]`).forEach(b=>b.onclick=()=>{state.moduleFilters[module]={q:'',from:'',to:'',status:'all'};tables();});
}
function v66RenderClients(){
  const box=$('clientsTable'); if(!box) return;
  const rows=v66ApplyModuleFilter(state.clients,'clients');
  box.innerHTML=v66Toolbar('clients','Buscar clientes','Nombre, teléfono, email, dirección, ciudad o etiqueta...',state.clients,{dates:false,status:false})+
    table(['Cliente','Contacto','Etiquetas','Historial','Acción'],rows.map(c=>{const cs=clientSummary(c);return `<tr><td><b>${esc(c.name)}</b><br><span class="muted">${esc(c.email)} · ${esc(c.city)}</span><br>${clientTagHtml(c)}</td><td>${esc(c.phone)}<br><span class="muted">${esc(c.altName||'')} ${c.altPhone?'· '+esc(c.altPhone):''}</span></td><td>${clientTagHtml(c)||'<span class="muted">Sin etiquetas</span>'}</td><td><b>${cs.assets}</b> activos · <b>${cs.services}</b> servicios<br><span class="muted">Balance ${money(cs.balance)}</span></td><td><div class="actions"><button data-client-summary="${c.id}" type="button">Ver historial</button><button data-client-portal="${c.id}" type="button">Portal</button>${action('clients',c.id)}</div></td></tr>`;}));
  v66BindToolbar('clients');
}
function v66RenderServices(){
  const box=$('servicesTable'); if(!box) return; const i=industry();
  const rows=v66ApplyModuleFilter(state.services,'services');
  box.innerHTML=v66Toolbar('services','Buscar servicios','Cliente, servicio, activo, estado, técnico, fecha...',state.services,{dates:true,status:true})+
    table(['Fecha',i.client,'Activo','Servicio','Estado','Monto','Factura','Acción'],rows.map(s=>{const inv=state.invoices.find(x=>x.serviceId===s.id),amount=serviceAmount(s);return `<tr><td>${esc(s.date)}<br><span class="tag">${esc(s.priority||'Normal')}</span></td><td>${esc(s.clientName)}</td><td>${esc(s.assetName||'')}</td><td><b>${esc(serviceTitle(s))}</b><br><span class="muted">${esc((s.fields||[]).filter(Boolean).slice(0,3).join(' · '))}</span></td><td><span class="status-chip">${esc(s.status||'Pendiente')}</span></td><td>${money(amount)}</td><td>${inv?esc(inv.number):`<button data-invoice="${s.id}" type="button">Facturar</button>`}</td><td><div class="actions"><button data-dup-service="${s.id}" type="button">Duplicar</button>${action('services',s.id)}</div></td></tr>`;}));
  v66BindToolbar('services');
}
function v66RenderQuotes(){
  const box=$('quotesTable'); if(!box) return;
  const rows=v66ApplyModuleFilter(state.quotes,'quotes');
  box.innerHTML=v66Toolbar('quotes','Buscar cotizaciones','Número COT, cliente, servicio, estado, fecha, monto...',state.quotes,{dates:true,status:true})+
    table(['Fecha','Número','Cliente','Cotización','Estado','Total','Acciones'],rows.map(q=>{const totals=quoteTotals(q), st=quoteStatus(q);return `<tr><td>${esc(q.date||'')}<br><span class="muted">Válida: ${esc(q.validUntil||'')}</span></td><td><b>${esc(q.number||'')}</b></td><td>${esc(q.clientName||'')}<br><span class="muted">${esc(q.assetName||'')}</span></td><td><b>${esc(q.title||q.serviceType||'Cotización')}</b><br><span class="muted">${esc(q.serviceType||'')}</span></td><td>${statusChip(st)}</td><td><b>${money(totals.total)}</b></td><td><div class="actions"><button data-preview-quote="${q.id}" type="button">Ver</button>${st==='Aprobada'||st==='Enviada'?`<button data-quote-invoice="${q.id}" type="button">Convertir a factura</button>`:''}${action('quotes',q.id)}</div></td></tr>`;}));
  v66BindToolbar('quotes');
}
function v66RenderBilling(){
  const box=$('invoiceTable'); if(!box) return;
  const base=state.invoices.filter(inv=>{
    const st=invoiceStatus(inv), bal=invoiceBalance(inv);
    if(state.billingFilter==='receivable' && bal<=0) return false;
    if(state.billingFilter==='overdue' && st!=='Vencida') return false;
    if(state.billingFilter==='pending' && st!=='Pendiente') return false;
    if(state.billingFilter==='partial' && st!=='Parcial') return false;
    if(state.billingFilter==='paid' && st!=='Pagada') return false;
    if(state.billingFilter==='canceled' && st!=='Cancelada') return false;
    return true;
  });
  const rows=v66ApplyModuleFilter(base,'billing');
  box.innerHTML=v66Toolbar('billing','Buscar facturas','Cliente, número de factura, servicio, estado, fecha, balance...',base,{dates:true,status:true})+
    `<div class="module-filter-chips"><button type="button" onclick="clearBillingFilter()">Todas</button><button type="button" onclick="openBilling('receivable','')">Por cobrar</button><button type="button" onclick="openBilling('overdue','')">Vencidas</button><button type="button" onclick="openBilling('pending','')">Pendientes</button><button type="button" onclick="openBilling('partial','')">Parciales</button><button type="button" onclick="openBilling('paid','')">Pagadas</button></div>`+
    table(['Fecha','Número','Cliente','Servicio','Estado','Total','Pagado','Balance','Acción'],rows.map(inv=>`<tr><td>${esc(inv.date||'')}<br><span class="muted">Vence: ${esc(inv.dueDate||'')}</span></td><td><b>${esc(inv.number||'')}</b></td><td>${esc(inv.clientName||'')}</td><td>${esc(inv.serviceTitle||inv.serviceType||'')}</td><td>${statusChip(invoiceStatus(inv))}</td><td>${money(inv.total)}</td><td>${money(invoicePaid(inv.id))}</td><td><b>${money(invoiceBalance(inv))}</b></td><td><div class="actions"><button data-preview-invoice="${inv.id}" type="button">Ver</button><button data-dup-invoice="${inv.id}" type="button">Duplicar</button>${action('invoices',inv.id)}</div></td></tr>`));
  v66BindToolbar('billing');
}

function cashWeekBounds(reference=new Date()){
  const d=new Date(reference); d.setHours(0,0,0,0);
  const day=(d.getDay()+6)%7;
  const start=new Date(d); start.setDate(d.getDate()-day);
  const end=new Date(start); end.setDate(start.getDate()+6);
  const iso=x=>`${x.getFullYear()}-${String(x.getMonth()+1).padStart(2,'0')}-${String(x.getDate()).padStart(2,'0')}`;
  return {start:iso(start),end:iso(end),startDate:start,endDate:end};
}
function cashSigned(x){return (String(x.type||'').toLowerCase()==='gasto'?-1:1)*Number(x.amount||0);}
function cashCurrentBalance(){return state.cashflow.reduce((a,x)=>a+cashSigned(x),0);}
function cashWeekData(){
  const b=cashWeekBounds();
  const inRange=x=>String(x.date||'')>=b.start&&String(x.date||'')<=b.end;
  const moves=state.cashflow.filter(inRange);
  const income=moves.filter(x=>String(x.type||'').toLowerCase()!=='gasto').reduce((a,x)=>a+Number(x.amount||0),0);
  const expenses=moves.filter(x=>String(x.type||'').toLowerCase()==='gasto').reduce((a,x)=>a+Number(x.amount||0),0);
  const purchases=state.purchases.filter(inRange).reduce((a,x)=>a+Number(x.total||0),0);
  const collected=state.payments.filter(inRange).reduce((a,x)=>a+Number(x.amount||0),0);
  const prior=state.cashflow.filter(x=>String(x.date||'')<b.start).reduce((a,x)=>a+cashSigned(x),0);
  const days=[];
  for(let i=0;i<7;i++){
    const d=new Date(b.startDate); d.setDate(d.getDate()+i);
    const key=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    const dm=moves.filter(x=>String(x.date||'')===key);
    const di=dm.filter(x=>String(x.type||'').toLowerCase()!=='gasto').reduce((a,x)=>a+Number(x.amount||0),0);
    const de=dm.filter(x=>String(x.type||'').toLowerCase()==='gasto').reduce((a,x)=>a+Number(x.amount||0),0);
    const dc=state.payments.filter(x=>String(x.date||'')===key).reduce((a,x)=>a+Number(x.amount||0),0);
    const dp=state.purchases.filter(x=>String(x.date||'')===key).reduce((a,x)=>a+Number(x.total||0),0);
    days.push({date:key,label:d.toLocaleDateString('es-PR',{weekday:'short',day:'numeric'}),income:di,expenses:de,collected:dc,purchases:dp,net:di-de});
  }
  return {...b,moves,income,expenses,purchases,collected,prior,weekNet:income-expenses,current:cashCurrentBalance(),days};
}
function renderCashflowModule(){
  const box=$('cashTable'); if(!box)return;
  const w=cashWeekData();
  const filtered=v66ApplyModuleFilter(state.cashflow,'cashflow');
  const sorted=[...filtered].sort((a,b)=>String(b.date||'').localeCompare(String(a.date||'')));
  let running=cashCurrentBalance();
  const rowMap=new Map(sorted.map(x=>{const row={...x,running};running-=cashSigned(x);return [x.id,row];}));
  const dayRows=w.days.map(d=>`<tr><td><b>${esc(d.label)}</b><br><span class="muted">${esc(d.date)}</span></td><td>${money(d.collected)}</td><td>${money(d.purchases)}</td><td>${money(d.expenses)}</td><td><b class="${d.net<0?'cash-negative':'cash-positive'}">${money(d.net)}</b></td></tr>`);
  box.innerHTML=`
    <div class="cash-week-header"><div><h3>Balance semanal de caja</h3><p>${esc(w.start)} al ${esc(w.end)}</p></div><span class="cash-current-badge">Disponible ahora: <b>${money(w.current)}</b></span></div>
    <div class="cash-metrics">
      <div class="metric-card"><span>Cobrado esta semana</span><b class="viz-stat-value">${money(w.collected)}</b><small>Pagos realmente registrados</small></div>
      <div class="metric-card"><span>Entradas a caja</span><b class="viz-stat-value">${money(w.income)}</b><small>Ingresos efectivos</small></div>
      <div class="metric-card"><span>Salidas de caja</span><b class="viz-stat-value">${money(w.expenses)}</b><small>Compras y pagos efectuados</small></div>
      <div class="metric-card"><span>Neto semanal</span><b class="viz-stat-value ${w.weekNet<0?'cash-negative':'cash-positive'}">${money(w.weekNet)}</b><small>Entradas menos salidas</small></div>
      <div class="metric-card"><span>Compras registradas</span><b class="viz-stat-value">${money(w.purchases)}</b><small>Incluye compras aún no pagadas</small></div>
      <div class="metric-card"><span>Balance al iniciar semana</span><b class="viz-stat-value">${money(w.prior)}</b><small>Saldo acumulado anterior</small></div>
    </div>
    <div class="cash-daily"><div class="section-head"><h3>Movimiento diario</h3><span class="limit-chip">Semana actual</span></div>${table(['Día','Cobrado','Compras registradas','Salidas reales','Neto real'],dayRows)}</div>
    ${v66Toolbar('cashflow','Buscar flujo de caja','Concepto, tipo, fecha, monto...',state.cashflow,{dates:true,status:true})}
    ${table(['Fecha','Tipo','Concepto','Monto','Balance luego del movimiento','Acción'],sorted.map(x=>{const r=rowMap.get(x.id)||x;return `<tr><td>${esc(x.date)}</td><td>${statusChip(x.type||'Ingreso')}</td><td>${esc(x.concept)}</td><td>${money(x.amount)}</td><td><b>${money(r.running)}</b></td><td>${action('cashflow',x.id)}</td></tr>`;}))}`;
  v66BindToolbar('cashflow');
}
function v66RenderSimpleTables(){
  const render=(boxId,module,label,placeholder,head,rowFn,rows,opts)=>{const box=$(boxId); if(!box)return; const filtered=v66ApplyModuleFilter(rows,module); box.innerHTML=v66Toolbar(module,label,placeholder,rows,opts)+table(head,filtered.map(rowFn)); v66BindToolbar(module);};
  render('assetsTable','assets','Buscar activos','Cliente, nombre, marca, modelo, serial, ubicación, estado o fecha...', ['Cliente','Activo / Identificación','Ubicación','Fechas importantes','Estado','Valor','Acción'], a=>{const due=a.nextMaintenanceDate||a.warrantyExpirationDate||a.expirationDate||'';const overdue=due&&due<today();const soon=due&&!overdue&&due<=plusDays(30);return `<tr><td>${esc(a.clientName||'Sin cliente')}</td><td><b>${esc(assetName(a))}</b><br><span class="muted">${esc([a.brand,a.model].filter(Boolean).join(' · ')||'Sin marca/modelo')}</span><br><span class="muted">${a.serial?'Serial: '+esc(a.serial):'Sin serial'}</span></td><td>${esc(assetLocation(a)||'—')}</td><td><small>Compra: ${esc(a.purchaseDate||'—')}</small><br><small>Garantía: ${esc(a.warrantyExpirationDate||'—')}</small><br><small class="${overdue?'date-overdue':soon?'date-soon':''}">Próx. mantenimiento: ${esc(a.nextMaintenanceDate||'—')}</small></td><td>${statusChip(assetStatus(a))}</td><td>${money(a.value)}</td><td>${action('assets',a.id)}</td></tr>`;}, state.assets,{dates:true,status:true});
  render('teamTable','team','Buscar equipo','Nombre, teléfono, email, rol, licencia, últimos 4...', ['Nombre','Contacto','Rol','Estado','Asignado','Acción'], t=>`<tr><td><b>${esc(t.name)}</b><br><span class="muted">${esc(t.personalId||'')} ${maskSSN(t.ssn)?'· '+esc(maskSSN(t.ssn)):''}</span></td><td>${esc(t.phone)}<br>${esc(t.email)}</td><td>${esc(t.role)}</td><td>${esc(t.status||'Activo')}</td><td>${esc(t.assignedVehicleName||'')}</td><td>${action('team',t.id)}</td></tr>`, state.team,{dates:true,status:true});
  render('suppliersTable','suppliers','Buscar suplidores','Nombre, contacto, teléfono, categoría...', ['Suplidor','Contacto','Categoría','Crédito','Balance','Acción'], s=>`<tr><td><b>${esc(s.name)}</b><br><span class="muted">${esc(s.email||'')}</span></td><td>${esc(s.phone)}<br>${esc(s.contact||'')}</td><td>${esc(s.category||'')}</td><td>${money(s.creditLimit)}</td><td><b>${money(supplierBalance(s.id))}</b></td><td>${action('suppliers',s.id)}</td></tr>`, state.suppliers,{dates:false,status:false});
  render('purchasesTable','purchases','Buscar compras / CxP','Suplidor, referencia, concepto, estado, fecha...', ['Fecha','Suplidor','Concepto','Vence','Total','Pagado','Balance','Estado','Acción'], p=>`<tr><td>${esc(p.date)}</td><td>${esc(p.supplierName)}</td><td><b>${esc(p.number||p.reference||'')}</b><br><span class="muted">${esc(p.concept)}</span></td><td>${esc(p.dueDate||'—')}</td><td>${money(p.total)}</td><td>${money(purchasePaid(p.id))}</td><td><b>${money(purchaseBalance(p))}</b></td><td>${statusChip(purchaseStatus(p))}</td><td>${action('purchases',p.id)}</td></tr>`, state.purchases,{dates:true,status:true});
  render('paymentsTable','payments','Buscar cobros','Factura, método, nota, fecha, monto...', ['Fecha','Factura','Método','Monto','Balance factura','Nota','Acción'], p=>{const inv=state.invoices.find(x=>x.id===p.invoiceId)||{};return `<tr><td>${esc(p.date)}</td><td>${esc(p.invoiceNumber)}</td><td>${esc(p.method)}</td><td>${money(p.amount)}</td><td>${inv.id?money(invoiceBalance(inv)):'—'}</td><td>${esc(p.note)}</td><td>${action('payments',p.id)}</td></tr>`;}, state.payments,{dates:true,status:false});
  renderCashflowModule();
  render('supplierPaymentsTable','supplierPayments','Buscar pagos a suplidores','Suplidor, compra, método, fecha...', ['Fecha','Suplidor','Compra / Aplicación','Método','Monto','Nota','Acción'], p=>{const alloc=paymentAllocations(p);const applied=alloc.reduce((a,x)=>a+Number(x.amount||0),0);const label=p.purchaseNumber|| (alloc.length?`General · ${alloc.length} compra(s) · ${money(applied)} aplicado`:'General');return `<tr><td>${esc(p.date)}</td><td>${esc(p.supplierName)}</td><td>${esc(label)}</td><td>${esc(p.method)}</td><td>${money(p.amount)}</td><td>${esc(p.note)}</td><td>${action('supplierPayments',p.id)}</td></tr>`;}, state.supplierPayments,{dates:true,status:false});
  render('payrollTable','payroll','Buscar nómina','Empleado, periodo, método, fecha...', ['Fecha','Empleado','Periodo','Bruto','Deducciones','Neto','Acción'], p=>`<tr><td>${esc(p.date)}</td><td>${esc(p.teamName)}</td><td>${esc(p.period||'')}</td><td>${money(p.gross)}</td><td>${money(p.totalDeductions)}</td><td><b>${money(p.net)}</b></td><td><div class="actions"><button data-paystub="${p.id}" type="button">PDF</button>${action('payroll',p.id)}</div></td></tr>`, state.payroll,{dates:true,status:false});
}
function v66RenderFollowups(){
  const box=$('followupsTable'); if(!box) return;
  const rows=v66ApplyModuleFilter(state.followups,'followups').sort((a,b)=>String(a.dueDate||'').localeCompare(String(b.dueDate||'')));
  box.innerHTML=v66Toolbar('followups','Buscar seguimientos','Cliente, tipo, asunto, activo, estado, fecha...',state.followups,{dates:true,status:true})+
    table(['Fecha','Cliente','Activo','Seguimiento','Estado','Notas','Acción'],rows.map(f=>{const c=clientBy(f.clientId||''); const st=followupStatus(f); const phone=c.whatsapp||c.phone||'';return `<tr><td><b>${esc(f.dueDate||'')}</b><br><span class="tag">${esc(f.priority||'Normal')}</span></td><td>${esc(f.clientName||c.name||'')}<br><span class="muted">${esc(phone)}</span></td><td>${esc(f.assetName||'')}</td><td><b>${esc(f.title||f.type||'Seguimiento')}</b><br><span class="muted">${esc(f.type||'')}</span></td><td>${statusChip(st)}</td><td>${esc(f.note||'')}</td><td><div class="actions">${phone?`<button data-whatsapp-followup="${f.id}" type="button">WhatsApp</button>`:''}${st!=='Completado'?`<button data-complete-followup="${f.id}" type="button">Completar</button>`:''}${action('followups',f.id)}</div></td></tr>`;}));
  v66BindToolbar('followups');
}
function v66BindDynamicActions(){
  document.querySelectorAll('[data-invoice]').forEach(b=>b.onclick=()=>createInvoice(b.dataset.invoice));
  document.querySelectorAll('[data-client-summary]').forEach(b=>b.onclick=()=>showClientSummary(b.dataset.clientSummary));
  document.querySelectorAll('[data-dup-service]').forEach(b=>b.onclick=()=>duplicateService(b.dataset.dupService));
  document.querySelectorAll('[data-preview-invoice]').forEach(b=>b.onclick=()=>previewInvoice(b.dataset.previewInvoice));
  document.querySelectorAll('[data-dup-invoice]').forEach(b=>b.onclick=()=>duplicateInvoice(b.dataset.dupInvoice));
  document.querySelectorAll('[data-preview-quote]').forEach(b=>b.onclick=()=>previewQuote(b.dataset.previewQuote));
  document.querySelectorAll('[data-quote-invoice]').forEach(b=>b.onclick=()=>convertQuoteToInvoice(b.dataset.quoteInvoice));
  document.querySelectorAll('[data-paystub]').forEach(b=>b.onclick=()=>previewPaystub(b.dataset.paystub));
  document.querySelectorAll('[data-whatsapp-followup]').forEach(b=>b.onclick=()=>{const f=state.followups.find(x=>x.id===b.dataset.whatsappFollowup); if(f) sendFollowupWhatsapp(f.id);});
  document.querySelectorAll('[data-complete-followup]').forEach(b=>b.onclick=()=>completeFollowup(b.dataset.completeFollowup));
  document.querySelectorAll('[data-del]').forEach(b=>b.onclick=()=>remove(...b.dataset.del.split(':')));
  document.querySelectorAll('[data-edit]').forEach(b=>b.onclick=()=>editRecord(...b.dataset.edit.split(':')));
}
function v74CaptureActiveField(){
  const el=document.activeElement;
  if(!el || !el.id || !['INPUT','TEXTAREA','SELECT'].includes(el.tagName)) return null;
  return {
    id:el.id,
    value:'value' in el ? el.value : '',
    start:typeof el.selectionStart==='number' ? el.selectionStart : null,
    end:typeof el.selectionEnd==='number' ? el.selectionEnd : null,
    scrollX:window.scrollX,
    scrollY:window.scrollY
  };
}
function v74RestoreActiveField(snapshot){
  if(!snapshot) return;
  requestAnimationFrame(()=>{
    const el=$(snapshot.id);
    if(!el) return;
    if('value' in el && el.value!==snapshot.value) el.value=snapshot.value;
    try{el.focus({preventScroll:true});}catch(e){el.focus();}
    if(snapshot.start!==null && typeof el.setSelectionRange==='function'){
      try{el.setSelectionRange(snapshot.start,snapshot.end??snapshot.start);}catch(e){}
    }
    window.scrollTo(snapshot.scrollX,snapshot.scrollY);
  });
}
const __v66Tables=tables;
tables=function(){
  const active=v74CaptureActiveField();
  __v66Tables();
  v66RenderClients();
  v66RenderServices();
  v66RenderQuotes();
  v66RenderBilling();
  v66RenderSimpleTables();
  v66RenderFollowups();
  v66BindDynamicActions();
  v74RestoreActiveField(active);
};

/* V66 Dashboard acciones precisas con filtros */
const __v66OpenDashboardAction=openDashboardAction;
openDashboardAction=function(view,filter=''){
  if(view==='billing') return openBilling(filter||'all','');
  if(view==='quotes') { v66Filter('quotes').status = filter==='approved'?'Aprobada':filter==='open'?'Enviada':'all'; return show('quotes'); }
  if(view==='followups') { v66Filter('followups').status = filter==='overdue'?'Vencido':'all'; return show('followups'); }
  return __v66OpenDashboardAction(view,filter);
};

/* V74 — Search Stability: conserva foco, texto y cursor durante renders y sincronizaciones Firebase. */

/* V75 — Dashboard Action Center
   Cada KPI abre el módulo con el filtro exacto que representa. */
function v75ResetModuleFilter(module){
  state.moduleFilters = state.moduleFilters || {};
  state.moduleFilters[module] = {q:'',from:'',to:'',status:'all'};
  return state.moduleFilters[module];
}
function v75MonthRange(){
  const d=new Date();
  const y=d.getFullYear(), m=String(d.getMonth()+1).padStart(2,'0');
  const last=String(new Date(y,d.getMonth()+1,0).getDate()).padStart(2,'0');
  return {from:`${y}-${m}-01`,to:`${y}-${m}-${last}`};
}
function v75OpenDashboardAction(view,filter=''){
  if(view==='billing') return openBilling(filter||'all','');
  if(view==='services'){
    const f=v75ResetModuleFilter('services');
    if(filter==='today') f.from=f.to=today();
    if(filter==='completed') f.status='Completado';
    return show('services');
  }
  if(view==='quotes'){
    const f=v75ResetModuleFilter('quotes');
    if(filter==='open') f.status='Enviada';
    if(filter==='approved') f.status='Aprobada';
    if(filter==='month') Object.assign(f,v75MonthRange());
    return show('quotes');
  }
  if(view==='followups'){
    const f=v75ResetModuleFilter('followups');
    if(filter==='overdue') { f.to=plusDays(-1); }
    if(filter==='today') { f.from=f.to=today(); }
    if(filter==='open') f.status='Pendiente';
    return show('followups');
  }
  if(view==='payments'){
    const f=v75ResetModuleFilter('payments');
    if(filter==='today') f.from=f.to=today();
    return show('payments');
  }
  if(view==='purchases'){
    const f=v75ResetModuleFilter('purchases');
    if(filter==='overdue') f.status='Vencida';
    if(filter==='payable') f.status='Pendiente';
    return show('purchases');
  }
  return show(view||'dashboard');
}
openDashboardAction=v75OpenDashboardAction;

const __v75Kpis=kpis;
kpis=function(){
  __v75Kpis();
  const billed=sum(state.invoices,'total');
  const collected=sum(state.payments,'amount');
  const balances=state.invoices.reduce((a,inv)=>a+invoiceBalance(inv),0);
  const q=quoteSummary();
  const fu=followupSummary();
  const cards=[
    {a:'Clientes',b:state.clients.length,view:'clients',filter:''},
    {a:'Servicios hoy',b:state.services.filter(s=>s.date===today()).length,view:'services',filter:'today'},
    {a:'Cotizaciones',b:q.total,view:'quotes',filter:''},
    {a:'COT mes',b:q.month,view:'quotes',filter:'month'},
    {a:'COT abiertas',b:q.open,view:'quotes',filter:'open'},
    {a:'COT aprobadas',b:q.approved,view:'quotes',filter:'approved'},
    {a:'Potencial COT',b:money(q.openValue+q.approvedValue),view:'quotes',filter:'open'},
    {a:'Conversión COT',b:q.conversionRate+'%',view:'quotes',filter:''},
    {a:'Facturado',b:money(billed),view:'billing',filter:'all'},
    {a:'Cobrado',b:money(collected),view:'payments',filter:''},
    {a:'Balance por cobrar',b:money(balances),view:'billing',filter:'receivable'},
    {a:'Seguimientos pendientes',b:fu.open,view:'followups',filter:'open'}
  ];
  const k=$('kpis');
  if(!k || state.activeView!=='dashboard') return;
  k.innerHTML=cards.map(x=>`<button type="button" class="kpi kpi-action" data-kpi-view="${esc(x.view)}" data-kpi-filter="${esc(x.filter||'')}"><span>${T(x.a)}</span><strong>${x.b}</strong><small>Ver registros</small></button>`).join('')+`<button type="button" class="kpi kpi-action calendar-kpi" id="dashboardCalendarBtn"><span>Calendario</span><strong>${esc(configuredCalendarLabel())}</strong><small>Ver calendario configurado</small></button>`;
  document.querySelectorAll('[data-kpi-view]').forEach(b=>b.onclick=()=>v75OpenDashboardAction(b.dataset.kpiView,b.dataset.kpiFilter||''));
  const cal=$('dashboardCalendarBtn'); if(cal) cal.onclick=openConfiguredCalendar;
};


/* V77 — Portal del Cliente
   Publica únicamente una copia sanitizada por cliente mediante un token privado. */
function portalBaseUrl(){
  const url=new URL('./portal/',window.location.href);
  url.search=''; url.hash='';
  return url.toString();
}
function newPortalToken(){
  const alphabet='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const bytes=new Uint8Array(12); crypto.getRandomValues(bytes);
  const raw=Array.from(bytes,b=>alphabet[b%alphabet.length]).join('');
  return raw.match(/.{1,4}/g).join('-');
}
function portalInvoiceData(inv){
  const items=(inv.items||[]).map(i=>({description:i.description||i.desc||'',qty:Number(i.qty||1),price:Number(i.price||0)}));
  const subtotal=Number(inv.subtotal ?? items.reduce((a,i)=>a+(i.qty*i.price),0));
  const tax=Number(inv.tax ?? inv.ivu ?? Math.max(0,Number(inv.total||0)-subtotal));
  return {id:inv.id,number:inv.number||'',date:inv.date||'',dueDate:inv.dueDate||'',serviceTitle:inv.serviceTitle||inv.serviceType||'',status:invoiceStatus(inv),subtotal,tax,taxPercent:Number(inv.taxPercent||profile().tax||0),total:Number(inv.total||subtotal+tax),paid:Number(invoicePaid(inv.id)||0),balance:Number(invoiceBalance(inv)||0),items,notes:inv.notes||'',terms:invoicePaymentTerms(inv,inv.terms||inv.conditions||'Pago según acuerdo.'),paymentMethods:invoicePaymentMethods(inv)};
}

function portalQuoteData(q){
  const totals=quoteTotals(q);
  return {id:q.id,number:q.number||'',date:q.date||'',validUntil:q.validUntil||'',title:q.title||q.serviceType||'',status:quoteStatus(q),total:Number(totals.total||0),items:(q.items||[]).map(i=>({description:i.description||i.desc||'',qty:Number(i.qty||1),price:Number(i.price||0)})),notes:q.notes||'',terms:q.terms||''};
}
function portalServiceData(s){
  return {id:s.id,date:s.date||'',title:serviceTitle(s),status:s.status||'Pendiente',assetName:s.assetName||'',amount:Number(serviceAmount(s)||0),notes:s.notes||s.note||'',fields:Array.isArray(s.fields)?s.fields:[]};
}
function portalAssetData(a){
  return {id:a.id,name:assetName(a),brand:a.brand||'',model:a.model||'',serial:a.serial||'',location:a.location||'',status:assetStatus(a),purchaseDate:a.purchaseDate||'',warrantyExpiration:a.warrantyExpirationDate||a.warrantyExpiration||a.expirationDate||'',nextMaintenance:a.nextMaintenanceDate||a.nextMaintenance||'',notes:a.notes||a.note||''};
}
function portalMaintenanceData(f){
  const a=state.assets.find(x=>x.id===f.assetId)||{};
  return {id:f.id,dueDate:f.dueDate||'',title:f.title||f.type||'Mantenimiento',type:f.type||'Mantenimiento',status:followupStatus(f),assetId:f.assetId||'',assetName:f.assetName||assetName(a)||'',priority:f.priority||'',note:f.note||''};
}

async function syncClientPortal(clientId,{openAfter=true,copyLink=true,notify=true}={}){
  const c=clientBy(clientId); if(!c.id){alert('Cliente no encontrado.');return;}
  const token=String(c.portalToken||'').trim()||newPortalToken();
  const p=profile();
  const payload={
    ownerId:uid(), token, enabled:true, updatedAt:new Date().toISOString(),
    business:{name:p.businessName||'Nexus Business',slogan:p.slogan||'',phone:p.phone||'',whatsapp:p.whatsapp||'',email:p.email||'',web:p.web||'',address:p.address||'',logo:p.logoDashboard||p.logoPdf||'',calendarLabel:configuredCalendarLabel(),calendarUrl:configuredCalendarUrl()},
    client:{id:c.id,name:c.name||'',email:c.email||'',phone:c.phone||'',city:c.city||'',address:c.address||''},
    summary:clientSummary(c),
    quotes:state.quotes.filter(x=>x.clientId===c.id).map(portalQuoteData).sort((a,b)=>String(b.date).localeCompare(String(a.date))),
    invoices:state.invoices.filter(x=>x.clientId===c.id).map(portalInvoiceData).sort((a,b)=>String(b.date).localeCompare(String(a.date))),
    services:state.services.filter(x=>x.clientId===c.id).map(portalServiceData).sort((a,b)=>String(b.date).localeCompare(String(a.date))),
    assets:state.assets.filter(x=>x.clientId===c.id).map(portalAssetData),
    maintenance:state.followups.filter(x=>x.clientId===c.id && String(x.type||'').toLowerCase().includes('mantenimiento') && followupStatus(x)!=='Cancelado').map(portalMaintenanceData).sort((a,b)=>String(a.dueDate).localeCompare(String(b.dueDate)))
  };
  await setDoc(doc(db,'clientPortals',token),payload,{merge:false});
  if(c.portalToken!==token || !c.portalEnabled) await updateDoc(docPath('clients',c.id),{portalToken:token,portalEnabled:true,portalUpdatedAt:new Date().toISOString()});
  const link=portalBaseUrl()+'?access='+encodeURIComponent(token);
  const copied=copyLink?await copyPortalLink(link):false;
  if(openAfter) window.open(link,'_blank','noopener');
  if(notify&&copyLink){
    if(copied) alert('Portal actualizado.\n\nCódigo privado: '+token+'\n\nEl enlace privado también fue copiado.');
    else window.prompt('Portal actualizado. Código privado: '+token+'\n\nSafari no permitió copiar automáticamente. Copia este enlace:',link);
  }
  return link;
}
async function copyPortalLink(link){
  try{
    if(window.isSecureContext && navigator.clipboard?.writeText){await navigator.clipboard.writeText(link);return true;}
  }catch(e){console.warn('Clipboard API bloqueada:',e);}
  try{
    const area=document.createElement('textarea');
    area.value=link; area.setAttribute('readonly','');
    area.style.position='fixed'; area.style.left='-9999px'; area.style.top='0';
    document.body.appendChild(area); area.focus(); area.select(); area.setSelectionRange(0,area.value.length);
    const ok=document.execCommand('copy'); area.remove(); if(ok) return true;
  }catch(e){console.warn('Copia de respaldo bloqueada:',e);}
  return false;
}
function bindClientPortalButtons(){
  document.querySelectorAll('[data-client-portal]').forEach(b=>b.onclick=async()=>{
    b.disabled=true; const old=b.textContent; b.textContent='Preparando…';
    try{await syncClientPortal(b.dataset.clientPortal);}catch(e){console.error(e);alert('No se pudo crear el portal: '+(e.message||e));}
    finally{b.disabled=false;b.textContent=old;}
  });
}
const __v77BindDynamicActions=v66BindDynamicActions;
v66BindDynamicActions=function(){__v77BindDynamicActions();bindClientPortalButtons();};
