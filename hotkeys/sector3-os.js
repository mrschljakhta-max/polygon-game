(()=>{
'use strict';

const mon=document.querySelector('.monitor-screen');
const desk=document.getElementById('desktopIcons');
const bar=mon?.querySelector('.taskbar');
if(!mon||!desk||!bar)return;

let uid=0;
let enabled=false;
let lang='UKR';
let clip=null;
let trash=[];
let history=[];
let future=[];
let editor=null;
let activeWindowId=null;
let zCounter=20;

const windows=new Map();
const cells={B2:'12',B3:'18',B4:'7',B5:'23',B6:'15',B7:'9',B8:'16'};
const folder=(name,children=[])=>({id:'d'+(++uid),type:'folder',name,children});
const file=(name,kind='file',x={})=>({id:'f'+(++uid),type:'file',kind,name,...x});
const root=folder('Цей ПК',[
 folder('Документи',[
  file('TRAINING_SYNC_SECTOR_3.xlsx','xlsx',{training:true}),
  folder('Навчання',[file('пам’ятка_VIDLIK.txt','txt')]),
  folder('Звіти',[file('звіт_серпень.xlsx','xlsx'),file('табель.xlsx','xlsx')]),
  folder('Архів',[file('267.xlsx','xlsx',{locked:true}),file('журнал_переміщень.xlsx','xlsx',{journal:true})]),
  folder('temp',[file('чернетка.txt','txt')]),
  file('чернетка.txt','txt',{training:true}),
  file('report_old.xlsx','xlsx')
 ]),
 folder('Системні файли',[file('VIDLIK_OS.cfg','txt',{system:true}),file('session.log','txt',{system:true})])
]);

const layer=document.createElement('div');
layer.className='os-layer os-ui';
mon.insertBefore(layer,bar);

const ctx=document.createElement('div');
ctx.className='os-context-menu os-ui';
ctx.hidden=true;
mon.append(ctx);

const toast=document.createElement('div');
toast.className='os-toast os-ui';
mon.append(toast);

const start=document.createElement('div');
start.className='os-start-menu os-ui';
start.hidden=true;
start.innerHTML='<div class="os-start-title">VIDLIK OS</div><button data-app="pc">▣ <span>Цей ПК</span></button><button data-app="docs">📁 <span>Документи</span></button><button data-app="excel">▦ <span>Microsoft Excel</span></button><button data-app="trash">⌫ <span>Кошик</span></button>';
mon.append(start);

function setupTaskbar(){
 const s=bar.querySelector('.start-mark');
 if(s){
  const b=document.createElement('button');
  b.id='osStartButton';
  b.className='start-mark os-taskbar-button os-ui';
  b.textContent='⊞';
  s.replaceWith(b);
 }
 const old=[...bar.children].find(x=>x.textContent.trim()==='UKR');
 if(old){
  const w=document.createElement('span');
  w.className='os-language-wrap os-ui';
  w.innerHTML='<button id="osLanguageButton" class="os-language-button">UKR</button><span id="osLanguageMenu" class="os-language-menu" hidden><button data-lang="UKR"><b>●</b> Українська <small>UKR</small></button><button data-lang="ENG"><b>○</b> English <small>ENG</small></button></span>';
  old.replaceWith(w);
 }
 const sp=bar.querySelector('.taskbar-spacer');
 if(sp){
  const r=document.createElement('span');
  r.id='osRunningApps';
  r.className='os-running-apps';
  bar.insertBefore(r,sp);
 }
}
setupTaskbar();

const langBtn=document.getElementById('osLanguageButton');
const langMenu=document.getElementById('osLanguageMenu');
const startBtn=document.getElementById('osStartButton');
const running=document.getElementById('osRunningApps');
const clone=v=>JSON.parse(JSON.stringify(v));
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

function note(t){
 toast.textContent=t;
 toast.classList.remove('show');
 void toast.offsetWidth;
 toast.classList.add('show');
 clearTimeout(note.t);
 note.t=setTimeout(()=>toast.classList.remove('show'),1450);
}
function closeMenus(){ctx.hidden=true;start.hidden=true;if(langMenu)langMenu.hidden=true}
function snap(){return JSON.stringify({children:root.children,trash,uid})}
function checkpoint(){history.push(snap());if(history.length>25)history.shift();future=[]}
function restoreSnapshot(s){const x=JSON.parse(s);root.children=x.children;trash=x.trash;uid=x.uid;rerenderExplorers()}
function undo(){if(!history.length)return note('Немає дій для скасування');future.push(snap());restoreSnapshot(history.pop());note('Дію скасовано')}
function redo(){if(!future.length)return note('Немає дій для повторення');history.push(snap());restoreSnapshot(future.pop());note('Дію повторено')}

function findNode(id,n=root){
 for(const x of n.children||[]){
  if(x.id===id)return{parent:n,item:x};
  if(x.type==='folder'){const q=findNode(id,x);if(q)return q}
 }
 return null;
}
function dirAt(path){
 let d=root;
 for(const id of path){const next=d.children?.find(x=>x.id===id&&x.type==='folder');if(!next)break;d=next}
 return d;
}
function pathNames(path){
 let d=root,a=['Цей ПК'];
 for(const id of path){d=d.children.find(x=>x.id===id&&x.type==='folder');if(!d)break;a.push(d.name)}
 return a;
}
function unique(d,n){
 if(!d.children.some(x=>x.name.toLowerCase()===n.toLowerCase()))return n;
 const k=n.lastIndexOf('.'),b=k>0?n.slice(0,k):n,e=k>0?n.slice(k):'';
 let i=2;while(d.children.some(x=>x.name.toLowerCase()===`${b} (${i})${e}`.toLowerCase()))i++;
 return`${b} (${i})${e}`;
}
function icon(x){return x.type==='folder'?'📁':x.kind==='xlsx'?'▦':x.kind==='txt'?'▤':'◇'}
function typeLabel(x){return x.type==='folder'?'Папка':x.kind==='xlsx'?'Аркуш Microsoft Excel':x.kind==='txt'?'Текстовий документ':'Файл'}

function activeSession(){return activeWindowId?windows.get(activeWindowId)||null:null}
function setActive(id){
 const s=windows.get(id);if(!s)return;
 if(s.minimized)s.minimized=false;
 activeWindowId=id;
 s.z=++zCounter;
 for(const [wid,w] of windows){
  w.active=wid===id;
  w.el.classList.toggle('os-window-active',w.active);
  w.el.classList.toggle('os-minimized',!!w.minimized);
  w.el.classList.toggle('os-window-minimized',!!w.minimized);
  w.el.style.zIndex=String(w.z||20);
 }
 renderTaskbar();
}
function minimizeWindow(id){
 const s=windows.get(id);if(!s)return;
 s.minimized=true;s.active=false;
 s.el.classList.add('os-minimized','os-window-minimized');
 if(activeWindowId===id){
  activeWindowId=null;
  const next=[...windows.values()].filter(w=>!w.minimized&&w.id!==id).sort((a,b)=>(b.z||0)-(a.z||0))[0];
  if(next)setActive(next.id);else renderTaskbar();
 }else renderTaskbar();
}
function toggleMaximize(id){
 const s=windows.get(id);if(!s)return;
 s.maximized=!s.maximized;
 s.el.classList.toggle('os-maximized',s.maximized);
 const b=s.el.querySelector('[data-win="max"]');
 if(b){b.textContent=s.maximized?'❐':'□';b.title=s.maximized?'Відновити розмір':'Розгорнути';b.setAttribute('aria-label',b.title)}
 setActive(id);
}
function closeWindow(id){
 const s=windows.get(id);if(!s)return;
 s.el.remove();windows.delete(id);
 if(activeWindowId===id)activeWindowId=null;
 const next=[...windows.values()].filter(w=>!w.minimized).sort((a,b)=>(b.z||0)-(a.z||0))[0];
 if(next)setActive(next.id);else renderTaskbar();
}
function renderTaskbar(){
 if(!running)return;
 running.replaceChildren();
 for(const s of windows.values()){
  const b=document.createElement('button');
  b.className='os-running-button';
  b.dataset.taskWindow=s.id;
  b.textContent=s.title;
  b.title=s.title;
  b.classList.toggle('is-active',s.id===activeWindowId&&!s.minimized);
  b.classList.toggle('is-minimized',!!s.minimized);
  running.appendChild(b);
 }
}
function taskbarClick(id){
 const s=windows.get(id);if(!s)return;
 if(s.minimized){s.minimized=false;s.el.classList.remove('os-minimized','os-window-minimized');setActive(id);return}
 if(activeWindowId===id){minimizeWindow(id);return}
 setActive(id);
}

function createWindow(id,title,type,state={}){
 let s=windows.get(id);
 if(s){s.title=title;Object.assign(s.state,state);s.minimized=false;s.el.classList.remove('os-minimized','os-window-minimized');setActive(id);return s}
 const el=document.createElement('section');
 el.className='os-window';
 el.dataset.windowId=id;
 el.innerHTML=`<header class="os-window-titlebar"><strong>${esc(title)}</strong><span class="os-window-actions"><button data-win="min" title="Згорнути">—</button><button data-win="max" title="Розгорнути">□</button><button data-win="close" title="Закрити">×</button></span></header><div class="os-window-body"></div>`;
 layer.appendChild(el);
 s={id,title,type,state,minimized:false,maximized:false,active:false,z:++zCounter,el};
 windows.set(id,s);
 setActive(id);
 return s;
}
function setWindowTitle(s,title){s.title=title;const t=s.el.querySelector('.os-window-titlebar strong');if(t)t.textContent=title;renderTaskbar()}
function windowBody(s){return s.el.querySelector('.os-window-body')}

function ensureExplorer(path=[],trashMode=false){
 let s=windows.get('explorer');
 const state={path:[...path],trashMode:!!trashMode,sel:new Set(),filter:''};
 if(!s)s=createWindow('explorer',trashMode?'Кошик':pathNames(path).at(-1),'explorer',state);
 else{s.state.path=[...path];s.state.trashMode=!!trashMode;s.state.sel.clear();s.state.filter='';s.minimized=false;s.el.classList.remove('os-minimized','os-window-minimized');setActive(s.id)}
 renderExplorer(s);return s;
}
function explorerItems(s){return s.state.trashMode?trash:dirAt(s.state.path).children}
function selectedExplorerItem(s){const id=[...s.state.sel][0];return explorerItems(s).find(x=>x.id===id)||null}
function renderExplorer(s){
 const title=s.state.trashMode?'Кошик':pathNames(s.state.path).at(-1);
 setWindowTitle(s,title);
 const b=windowBody(s);
 b.innerHTML=`<div class="os-explorer-toolbar"><button data-act="back" ${s.state.trashMode||!s.state.path.length?'disabled':''}>←</button><button data-act="new" ${s.state.trashMode?'disabled':''}>＋</button><div class="os-address">${s.state.trashMode?'Кошик':esc(pathNames(s.state.path).join(' › '))}</div><button data-act="search">⌕</button></div><div class="os-search-row ${s.state.filter?'visible':''}"><span>⌕</span><input id="osSearch-${s.id}" readonly placeholder="Пошук" value="${esc(s.state.filter||'')}"><button data-act="clear">×</button></div><div class="os-explorer-main"><nav class="os-sidebar"><button data-nav="pc">▣ Цей ПК</button><button data-nav="docs">📁 Документи</button><button data-nav="reports">📁 Звіти</button><button data-nav="archive">📁 Архів</button><button data-nav="trash">⌫ Кошик</button></nav><div class="os-file-pane"><div class="os-file-head"><span>Ім’я</span><span>Тип</span><span>Розмір</span></div><div class="os-file-list"></div></div></div><footer class="os-statusbar"><span class="os-count"></span><span class="os-sel"></span></footer>`;
 renderExplorerFiles(s);
}
function renderExplorerFiles(s){
 const list=s.el.querySelector('.os-file-list');if(!list)return;
 const a=explorerItems(s).filter(x=>x.name.toLowerCase().includes((s.state.filter||'').toLowerCase()));
 list.innerHTML=a.map(x=>`<button class="os-file-item ${s.state.sel.has(x.id)?'selected':''}" data-id="${x.id}"><span class="os-file-name"><i>${icon(x)}</i><b>${esc(x.name)}</b></span><span>${typeLabel(x)}</span><span>—</span></button>`).join('')||'<div class="os-empty">Папка порожня</div>';
 s.el.querySelector('.os-count').textContent=`Об’єктів: ${a.length}`;
 s.el.querySelector('.os-sel').textContent=s.state.sel.size?`Вибрано: ${s.state.sel.size}`:'';
}
function explorerNav(s,k){
 const d=root.children.find(x=>x.name==='Документи');
 s.state.sel.clear();s.state.filter='';s.state.trashMode=false;
 if(k==='pc')s.state.path=[];
 if(k==='docs')s.state.path=d?[d.id]:[];
 if(k==='reports'){const q=d?.children.find(x=>x.name==='Звіти');s.state.path=d&&q?[d.id,q.id]:[]}
 if(k==='archive'){const q=d?.children.find(x=>x.name==='Архів');s.state.path=d&&q?[d.id,q.id]:[]}
 if(k==='trash'){s.state.trashMode=true;s.state.path=[]}
 renderExplorer(s);setActive(s.id);
}
function openExplorerItem(s,x){
 if(!x)return;
 if(s.state.trashMode)return note('Спочатку відновіть об’єкт');
 if(x.type==='folder'){s.state.path.push(x.id);s.state.sel.clear();renderExplorer(s);return}
 if(x.locked)return dialog('Запис 267','Пряме відкриття заблоковано. Спочатку перевірте журнал переміщень.');
 if(x.kind==='xlsx')return openExcel(x);
 dialog(x.name,x.system?'Системний файл VIDLIK OS. Редагування обмежено.':'Документ відкрито у режимі перегляду.');
}
function removeExplorer(s){
 if(!s.state.sel.size)return;
 if(s.state.trashMode){checkpoint();trash=trash.filter(x=>!s.state.sel.has(x.id));s.state.sel.clear();renderExplorer(s);return note('Видалено назавжди')}
 checkpoint();
 for(const id of [...s.state.sel]){const q=findNode(id);if(!q)continue;q.parent.children=q.parent.children.filter(x=>x.id!==id);trash.push({...clone(q.item),origin:[...s.state.path]})}
 s.state.sel.clear();renderExplorer(s);note('Переміщено до Кошика');
}
function restoreTrash(s){
 if(!s.state.trashMode||!s.state.sel.size)return;
 checkpoint();
 for(const x of trash.filter(x=>s.state.sel.has(x.id))){const d=dirAt(x.origin||[]),y=clone(x);delete y.origin;y.name=unique(d,y.name);d.children.push(y)}
 trash=trash.filter(x=>!s.state.sel.has(x.id));s.state.sel.clear();renderExplorer(s);note('Відновлено');
}
function copyExplorer(s,cut=false){
 if(!s.state.sel.size||s.state.trashMode)return;
 clip={cut,ids:[...s.state.sel],items:clone(explorerItems(s).filter(x=>s.state.sel.has(x.id)))};
 note(cut?'Вирізано у буфер VIDLIK':'Скопійовано у буфер VIDLIK');
}
function reseed(x){x.id=(x.type==='folder'?'d':'f')+(++uid);(x.children||[]).forEach(reseed)}
function pasteExplorer(s){
 if(!clip||s.state.trashMode)return;
 checkpoint();const d=dirAt(s.state.path);
 if(clip.cut){for(const id of clip.ids){const q=findNode(id);if(!q)continue;q.parent.children=q.parent.children.filter(x=>x.id!==id);q.item.name=unique(d,q.item.name);d.children.push(q.item)}clip=null}
 else for(const o of clip.items){const x=clone(o);reseed(x);x.name=unique(d,x.name);d.children.push(x)}
 s.state.sel.clear();renderExplorer(s);note('Вставлено');
}
function newFolder(s){
 if(s.state.trashMode)return;
 checkpoint();const d=dirAt(s.state.path),x=folder(unique(d,'Нова папка'));d.children.push(x);s.state.sel=new Set([x.id]);renderExplorer(s);renameExplorer(s,x);
}
function renameExplorer(s,x=selectedExplorerItem(s)){
 if(!x||s.state.trashMode||x.system)return;
 const row=s.el.querySelector(`[data-id="${x.id}"]`),b=row?.querySelector('.os-file-name b');if(!b)return;
 const input=document.createElement('input');input.className='os-inline-input';input.readOnly=true;input.value=x.name;b.replaceWith(input);input.focus();input.select();
 beginEdit(input,v=>{v=v.trim();if(v&&v!==x.name){const d=findNode(x.id)?.parent;if(d.children.some(y=>y.id!==x.id&&y.name.toLowerCase()===v.toLowerCase())){note('Таке ім’я вже існує');return}checkpoint();x.name=v;note('Перейменовано')}renderExplorer(s)},()=>renderExplorer(s));
}
function explorerProperties(s,x=selectedExplorerItem(s)){if(!x)return;dialog('Властивості',`<b>${esc(x.name)}</b><br>Тип: ${typeLabel(x)}<br>Розташування: ${esc(pathNames(s.state.path).join(' › '))}`,true)}
function rerenderExplorers(){for(const s of windows.values())if(s.type==='explorer')renderExplorer(s)}

function openExcel(f=null){
 let s=windows.get('excel');
 if(!s)s=createWindow('excel',f?.name||'Microsoft Excel','excel',{file:f,activeCell:'A1'});
 else{s.state.file=f||s.state.file;s.minimized=false;s.el.classList.remove('os-minimized','os-window-minimized');setActive(s.id)}
 setWindowTitle(s,f?.name||s.state.file?.name||'Microsoft Excel');renderExcel(s);return s;
}
function renderExcel(s){
 const f=s.state.file;
 const b=windowBody(s);
 b.innerHTML=`<div class="os-excel-ribbon"><b>Файл</b><span>Основне</span><span>Вставлення</span><span>Формули</span><span class="os-excel-lang-note">Мова вводу: <strong class="osExcelLang">${lang}</strong></span></div><div class="os-formula-row"><span class="osCellName">${s.state.activeCell}</span><span>fx</span><input class="osFormula" readonly placeholder="Введіть значення або формулу"></div><div class="os-excel-grid"></div><footer class="os-excel-status"><span>${esc(f?.name||'Книга1')}</span><span>Для формул перемкніть ENG мишкою.</span></footer>`;
 renderGrid(s);
 b.querySelector('.osFormula')?.addEventListener('click',()=>formulaEdit(s));
}
function renderGrid(s){
 const g=s.el.querySelector('.os-excel-grid');if(!g)return;
 const cols=['','A','B','C','D','E','F'];let h='';
 for(let r=0;r<=9;r++)for(let c=0;c<7;c++){
  if(!r){h+=`<div class="os-xcell head">${cols[c]}</div>`;continue}
  if(!c){h+=`<div class="os-xcell head">${r}</div>`;continue}
  const a=cols[c]+r,j=s.state.file?.journal?{A1:'Дата',B1:'Запис',C1:'Операція',A2:'05.09',B2:'251',C2:'архівовано',A3:'06.09',B3:'267',C3:'переміщено'}:{};
  h+=`<button class="os-xcell ${a===s.state.activeCell?'active':''}" data-cell="${a}">${esc(j[a]??cells[a]??'')}</button>`;
 }
 g.innerHTML=h;
}
function formulaEdit(s){
 const i=s.el.querySelector('.osFormula');if(!i)return;
 i.value=cells[s.state.activeCell]||'';i.focus();i.setSelectionRange(i.value.length,i.value.length);
 beginEdit(i,v=>{cells[s.state.activeCell]=v;renderGrid(s);note(v.startsWith('=')?'Формулу введено':'Значення введено')},()=>{});
}

function dialog(t,m,html=false){
 const d=document.createElement('div');d.className='os-dialog-wrap os-ui';
 d.innerHTML=`<div class="os-dialog"><header>${esc(t)}</header><div class="os-dialog-copy">${html?m:esc(m)}</div><footer><button data-dlg>OK</button></footer></div>`;
 mon.append(d);d.querySelector('button').focus();
}
function contextMenu(e,s,x=null){
 e.preventDefault();
 const a=x?(s.state.trashMode?[['restore','Відновити'],['delete','Видалити назавжди'],['prop','Властивості']]:[['open','Відкрити'],['rename','Перейменувати'],['copy','Копіювати'],['cut','Вирізати'],['delete','Видалити'],['prop','Властивості']]):[['new','Нова папка'],['paste','Вставити']];
 ctx.innerHTML=a.map(q=>`<button data-menu="${q[0]}" ${q[0]==='paste'&&!clip?'disabled':''}>${q[1]}</button>`).join('');
 ctx.dataset.windowId=s.id;ctx.dataset.id=x?.id||'';ctx.hidden=false;
 const r=mon.getBoundingClientRect();ctx.style.left=Math.max(4,Math.min(r.width-174,e.clientX-r.left))+'px';ctx.style.top=Math.max(4,Math.min(r.height-a.length*31-38,e.clientY-r.top))+'px';
}

const EN={};'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').forEach(c=>EN['Key'+c]=c.toLowerCase());
const UA={KeyQ:'й',KeyW:'ц',KeyE:'у',KeyR:'к',KeyT:'е',KeyY:'н',KeyU:'г',KeyI:'ш',KeyO:'щ',KeyP:'з',BracketLeft:'х',BracketRight:'ї',KeyA:'ф',KeyS:'і',KeyD:'в',KeyF:'а',KeyG:'п',KeyH:'р',KeyJ:'о',KeyK:'л',KeyL:'д',Semicolon:'ж',Quote:'є',KeyZ:'я',KeyX:'ч',KeyC:'с',KeyV:'м',KeyB:'и',KeyN:'т',KeyM:'ь',Comma:'б',Period:'ю',Backquote:'ґ'};
const DS={Digit1:'!',Digit2:'@',Digit3:'#',Digit4:'$',Digit5:'%',Digit6:'^',Digit7:'&',Digit8:'*',Digit9:'(',Digit0:')'};
function chr(e){
 if(e.code==='Space')return' ';
 if(/^Digit\d$/.test(e.code))return e.shiftKey?DS[e.code]:e.code.slice(-1);
 const m=lang==='ENG'?EN:UA;let c=m[e.code];if(c)return e.shiftKey?c.toUpperCase():c;
 if(lang==='ENG'){const p={Minus:['-','_'],Equal:['=','+'],Semicolon:[';',':'],Quote:["'",'"'],Comma:[',','<'],Period:['.','>'],Slash:['/','?'],BracketLeft:['[','{'],BracketRight:[']','}']};return p[e.code]?.[e.shiftKey?1:0]||''}
 return{Minus:'-',Equal:'=',Slash:'.'}[e.code]||'';
}
function beginEdit(input,ok,cancel){editor={input,ok,cancel};input.classList.add('editing')}
function endEdit(ok=true){if(!editor)return;const e=editor;editor=null;e.input.classList.remove('editing');(ok?e.ok:e.cancel)?.(e.input.value)}
function editKey(e){
 if(!editor)return false;const i=editor.input,k=e.key.toLowerCase();
 if(e.ctrlKey&&k==='a'){e.preventDefault();i.select();return true}
 if(e.key==='Enter'){e.preventDefault();endEdit(true);return true}
 if(e.key==='Escape'){e.preventDefault();endEdit(false);return true}
 if(e.key==='Backspace'||e.key==='Delete'){
  e.preventDefault();let a=i.selectionStart??i.value.length,b=i.selectionEnd??a;
  if(a===b){if(e.key==='Backspace'&&a)a--;else if(e.key==='Delete'&&b<i.value.length)b++}
  i.value=i.value.slice(0,a)+i.value.slice(b);i.setSelectionRange(a,a);return true;
 }
 if(['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){
  e.preventDefault();let p=i.selectionStart??0;p=e.key==='Home'?0:e.key==='End'?i.value.length:e.key==='ArrowLeft'?Math.max(0,p-1):Math.min(i.value.length,p+1);i.setSelectionRange(p,p);return true;
 }
 if(e.ctrlKey||e.altKey||e.metaKey)return false;
 const c=chr(e);if(!c)return false;e.preventDefault();const a=i.selectionStart??i.value.length,b=i.selectionEnd??a;i.value=i.value.slice(0,a)+c+i.value.slice(b);i.setSelectionRange(a+c.length,a+c.length);return true;
}
function setLang(x){
 lang=x==='ENG'?'ENG':'UKR';langBtn.textContent=lang;
 langMenu.querySelectorAll('[data-lang]').forEach(b=>b.querySelector('b').textContent=b.dataset.lang===lang?'●':'○');
 closeMenus();mon.querySelectorAll('.osExcelLang').forEach(x=>x.textContent=lang);note('МОВА ВВЕДЕННЯ · '+lang);
}

function openApp(a){
 closeMenus();
 const d=root.children.find(x=>x.name==='Документи');
 if(a==='pc')ensureExplorer([],false);
 else if(a==='docs')ensureExplorer(d?[d.id]:[],false);
 else if(a==='trash')ensureExplorer([],true);
 else if(a==='excel')openExcel(null);
}

function keyboard(e){
 if(!enabled||document.querySelector('.pause.visible'))return;
 if(editor&&editKey(e))return;
 const dlg=mon.querySelector('.os-dialog-wrap');if(dlg){if(e.key==='Escape'||e.key==='Enter'){e.preventDefault();dlg.remove()}return}
 const s=activeSession();
 const k=e.key.toLowerCase();
 if(e.ctrlKey&&!e.altKey&&!e.metaKey&&['a','c','x','v','z','y','f'].includes(k)){
  e.preventDefault();
  if(k==='z')return undo();if(k==='y')return redo();
  if(!s||s.type!=='explorer')return;
  if(k==='a'){s.state.sel=new Set(explorerItems(s).map(x=>x.id));renderExplorerFiles(s)}
  if(k==='c')copyExplorer(s,false);if(k==='x')copyExplorer(s,true);if(k==='v')pasteExplorer(s);
  if(k==='f'){const r=s.el.querySelector('.os-search-row'),i=s.el.querySelector('input[id^="osSearch-"]');r.classList.add('visible');i.focus();beginEdit(i,v=>{s.state.filter=v;renderExplorerFiles(s)},()=>renderExplorerFiles(s))}
  return;
 }
 if(s?.type==='explorer'){
  const a=explorerItems(s),i=a.findIndex(x=>s.state.sel.has(x.id));
  if(['ArrowDown','ArrowUp','Home','End','PageDown','PageUp'].includes(e.key)){
   e.preventDefault();let n=i<0?0:i;n=e.key==='Home'?0:e.key==='End'?a.length-1:e.key==='ArrowDown'?n+1:e.key==='ArrowUp'?n-1:e.key==='PageDown'?n+5:n-5;n=Math.max(0,Math.min(a.length-1,n));s.state.sel.clear();a[n]&&s.state.sel.add(a[n].id);renderExplorerFiles(s);return;
  }
  if(e.key==='Enter'){e.preventDefault();openExplorerItem(s,selectedExplorerItem(s));return}
  if(e.key==='F2'){e.preventDefault();renameExplorer(s);return}
  if(e.key==='Delete'){e.preventDefault();removeExplorer(s);return}
  if(e.key==='Backspace'&&!s.state.trashMode&&s.state.path.length){e.preventDefault();s.state.path.pop();s.state.sel.clear();renderExplorer(s);return}
 }
 if(s?.type==='excel'&&e.key==='Enter'){e.preventDefault();formulaEdit(s);return}
 if(e.key==='Escape'){
  e.preventDefault();
  if(!ctx.hidden||!start.hidden||!langMenu.hidden)return closeMenus();
  if(s){minimizeWindow(s.id);return}
  window.dispatchEvent(new CustomEvent('vidlik:pause-request'));
 }
}

function enable(){
 if(enabled)return;enabled=true;mon.classList.add('os-enabled','os-ready');
 const h=document.getElementById('help');if(h)h.innerHTML='<span><kbd>ENTER</kbd> відкрити</span><span><kbd>F2</kbd> перейменувати</span><span><kbd>DEL</kbd> видалити</span><span><kbd>CTRL+C/V</kbd> копія / вставка</span><span><kbd>ESC</kbd> згорнути / пауза</span>';
 const p=document.querySelector('#pause p');if(p)p.textContent='Enter / Space — продовжити';note('VIDLIK OS · РОБОЧА СТАНЦІЯ ГОТОВА');
}
function resetOS(){
 enabled=false;closeMenus();editor=null;activeWindowId=null;windows.clear();layer.replaceChildren();running?.replaceChildren();mon.classList.remove('os-enabled');
}

desk.addEventListener('click',e=>{
 if(!enabled)return;const b=e.target.closest('.desktop-icon');if(!b)return;
 desk.querySelectorAll('.desktop-icon').forEach(x=>x.classList.toggle('is-selected',x===b));
 if(e.detail===2)openApp(b.dataset.app==='folder'?'docs':b.dataset.app);
});
desk.addEventListener('contextmenu',e=>{if(!enabled)return;const b=e.target.closest('.desktop-icon');if(b){e.preventDefault();openApp(b.dataset.app==='folder'?'docs':b.dataset.app)}});

mon.addEventListener('mousedown',e=>{const w=e.target.closest('.os-window');if(w&&windows.has(w.dataset.windowId))setActive(w.dataset.windowId)});
mon.addEventListener('dblclick',e=>{const t=e.target.closest('.os-window-titlebar');if(t&&!e.target.closest('.os-window-actions')){const w=t.closest('.os-window');if(w)toggleMaximize(w.dataset.windowId)}});
mon.addEventListener('click',e=>{
 if(!enabled)return;
 const task=e.target.closest('[data-task-window]');if(task)return taskbarClick(task.dataset.taskWindow);
 const wc=e.target.closest('[data-win]');if(wc){const w=wc.closest('.os-window'),id=w?.dataset.windowId;if(!id)return;if(wc.dataset.win==='min')minimizeWindow(id);if(wc.dataset.win==='max')toggleMaximize(id);if(wc.dataset.win==='close')closeWindow(id);return}
 const ap=e.target.closest('[data-app]');if(ap)return openApp(ap.dataset.app);
 const l=e.target.closest('[data-lang]');if(l)return setLang(l.dataset.lang);
 const d=e.target.closest('[data-dlg]');if(d)return d.closest('.os-dialog-wrap')?.remove();
 const w=e.target.closest('.os-window'),s=w?windows.get(w.dataset.windowId):null;
 if(!s)return;
 if(s.type==='explorer'){
  const a=e.target.closest('[data-act]');if(a){if(a.dataset.act==='back'&&s.state.path.length){s.state.path.pop();s.state.sel.clear();renderExplorer(s)}if(a.dataset.act==='new')newFolder(s);if(a.dataset.act==='search'){const r=s.el.querySelector('.os-search-row'),i=s.el.querySelector('input[id^="osSearch-"]');r.classList.add('visible');i.focus();beginEdit(i,v=>{s.state.filter=v;renderExplorerFiles(s)},()=>renderExplorerFiles(s))}if(a.dataset.act==='clear'){s.state.filter='';renderExplorer(s)}return}
  const n=e.target.closest('[data-nav]');if(n)return explorerNav(s,n.dataset.nav);
  const f=e.target.closest('.os-file-item');if(f){if(e.ctrlKey)s.state.sel.has(f.dataset.id)?s.state.sel.delete(f.dataset.id):s.state.sel.add(f.dataset.id);else{s.state.sel.clear();s.state.sel.add(f.dataset.id)}renderExplorerFiles(s);if(e.detail===2)openExplorerItem(s,selectedExplorerItem(s));return}
 }
 if(s.type==='excel'){
  const c=e.target.closest('[data-cell]');if(c){s.state.activeCell=c.dataset.cell;s.el.querySelector('.osCellName').textContent=s.state.activeCell;renderGrid(s);return}
 }
});

mon.addEventListener('contextmenu',e=>{
 if(!enabled)return;const w=e.target.closest('.os-window'),s=w?windows.get(w.dataset.windowId):null;if(!s||s.type!=='explorer')return;
 const f=e.target.closest('.os-file-item'),pane=e.target.closest('.os-file-pane');if(f||pane){if(f){s.state.sel.clear();s.state.sel.add(f.dataset.id);renderExplorerFiles(s)}contextMenu(e,s,f?selectedExplorerItem(s):null)}
});
ctx.addEventListener('click',e=>{
 const b=e.target.closest('[data-menu]');if(!b||b.disabled)return;
 const s=windows.get(ctx.dataset.windowId);if(!s)return;const a=b.dataset.menu;closeMenus();
 if(a==='open')openExplorerItem(s,selectedExplorerItem(s));if(a==='rename')renameExplorer(s);if(a==='copy')copyExplorer(s,false);if(a==='cut')copyExplorer(s,true);if(a==='delete')removeExplorer(s);if(a==='prop')explorerProperties(s);if(a==='restore')restoreTrash(s);if(a==='new')newFolder(s);if(a==='paste')pasteExplorer(s);
});

startBtn?.addEventListener('click',e=>{if(!enabled)return;e.stopPropagation();const x=start.hidden;closeMenus();start.hidden=!x});
langBtn?.addEventListener('click',e=>{if(!enabled)return;e.stopPropagation();const x=langMenu.hidden;closeMenus();langMenu.hidden=!x});
document.addEventListener('pointerdown',e=>{if(!mon.contains(e.target))closeMenus()});
document.addEventListener('keydown',keyboard,{capture:true});
window.addEventListener('vidlik:os-ready',enable);
window.addEventListener('vidlik:os-reset',resetOS);
window.VIDLIK_OS={
 enable,
 setLanguage:setLang,
 get language(){return lang},
 openDesktopApp:openApp,
 getFileSystem:()=>clone(root),
 getState:()=>({enabled,lang,activeWindowId,windows:[...windows.values()].map(w=>({id:w.id,type:w.type,title:w.title,minimized:w.minimized,maximized:w.maximized})),trash:clone(trash)})
};
})();
