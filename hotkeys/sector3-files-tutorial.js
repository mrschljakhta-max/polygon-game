(()=>{
'use strict';

const mon=document.querySelector('.monitor-screen');
const chat=document.getElementById('adminChat');
const footer=document.getElementById('adminFooter');
const help=document.getElementById('help');
if(!mon||!chat||!footer)return;

let active=false;
let task=0;
let phase='idle';
let lastGuide='';
let timer=null;
let refs={docs:null,training:null,folder:null,copy:null,draft:null};
let baselineIds=new Set();
let folderOpened=false;
let propertiesSeen=false;
let copyDone=false;
let deleteSeen=false;
let praised=new Set();

let expected={
 task1:false,
 task3:false,
 task4:false,
 task7:false,
 task8:false,
 task9Cut:false,
 task9Paste:false,
 task10:false,
 task11:false
};
let alt={
 task1:false,
 task2:false,
 task3:false,
 task4:false,
 task6:false,
 task7:false,
 task8:false,
 task9:false,
 task10:false,
 task11:false
};

const A=()=>window.VIDLIK_ADAPTIVE_STATE;
const OS=()=>window.VIDLIK_OS;
const P=()=>window.VIDLIK_EXPLORER_POLISH;

function nowTime(){return new Date().toLocaleTimeString('uk-UA',{hour:'2-digit',minute:'2-digit',hour12:false})}
function scrollLatest(rowEl){requestAnimationFrame(()=>requestAnimationFrame(()=>{const top=Math.max(0,chat.scrollHeight-chat.clientHeight);if(typeof chat.scrollTo==='function')chat.scrollTo({top,behavior:'smooth'});else chat.scrollTop=top;rowEl?.setAttribute('data-visible-latest','true')}))}
function adminMessage(text){
 const r=document.createElement('div');r.className='admin-message vidlik-tutorial-message';
 const bubble=document.createElement('div');bubble.className='admin-bubble';
 const head=document.createElement('div');head.className='admin-bubble-head';
 const name=document.createElement('span');name.className='admin-bubble-name';name.textContent='СИСТЕМНИЙ АДМІНІСТРАТОР';
 const time=document.createElement('span');time.className='admin-bubble-time';time.textContent=nowTime();
 const p=document.createElement('p');p.textContent=text;p.style.whiteSpace='pre-line';
 head.append(name,time);bubble.append(head,p);r.append(bubble);chat.appendChild(r);scrollLatest(r);
}
function praise(key,text){
 if(!active||praised.has(key))return;
 praised.add(key);
 adminMessage(`Добре. ${text}\nВи знайшли інший робочий спосіб — це корисна навичка.`);
}
function setFooter(text){footer.textContent=text;footer.classList.add('vidlik-tutorial-footer')}
function setHelp(html){if(help){help.classList.add('vidlik-tutorial-help');help.innerHTML=html}}
function taskLabel(n,text){setFooter(`ЗАВДАННЯ ${n} / 11 · ${text}`)}
function guide(key,text,html){if(!active||lastGuide===key)return;lastGuide=key;adminMessage(text);if(html)setHelp(html)}
function schedule(ms=35){clearTimeout(timer);timer=setTimeout(reconcile,ms)}
function explorer(){return A()?.currentExplorer?.()||{open:false,trashMode:false,folder:null,path:[],selectedIds:[]}}
function selectedId(){return A()?.selectedId?.()||null}
function loc(id){return A()?.locate?.(id)||{where:'missing',node:null,parent:null,path:[]}}
function objectName(id,f='об’єкт'){return A()?.objectName?.(id,f)||f}
function parentId(id){return A()?.parentId?.(id)||null}
function rowById(id){return A()?.rowById?.(id)||null}
function clearTargets(){document.querySelectorAll('.vidlik-tutorial-ui-target,.vidlik-files-tutorial-target,.os-keyboard-target').forEach(x=>x.classList.remove('vidlik-tutorial-ui-target','vidlik-files-tutorial-target','os-keyboard-target'))}
function mark(id){clearTargets();const row=rowById(id);if(row)row.classList.add('vidlik-files-tutorial-target')}
function visibleMenu(action){return document.querySelector(`.os-context-menu:not([hidden]) [data-menu="${action}"]`)}
function dialog(){return document.querySelector('.os-dialog-wrap')}
function inlineInput(){return document.querySelector('.os-window[data-window-id="explorer"] .os-inline-input')}
function pane(){return document.querySelector('.os-window[data-window-id="explorer"] .os-file-pane')}
function isCut(id){return !!id&&!!P()?.isCut?.(id)}
function same(a,b){return String(a||'')===String(b||'')}
function commonPrefix(a,b){let i=0;while(i<a.length&&i<b.length&&same(a[i]?.id,b[i]?.id))i++;return i}

function findInitialRefs(){
 const docs=A()?.findByName?.('Документи',n=>n.type==='folder');if(!docs)return false;
 refs.docs=docs.node.id;
 refs.training=(docs.node.children||[]).find(x=>x.kind==='xlsx'&&x.training)?.id||(docs.node.children||[]).find(x=>x.kind==='xlsx')?.id||null;
 refs.draft=(docs.node.children||[]).find(x=>x.kind==='txt'&&x.training)?.id||(docs.node.children||[]).find(x=>x.name==='чернетка.txt')?.id||null;
 return !!refs.training;
}

function strictNavigate(path,key='route'){
 const cur=explorer();
 if(!cur.open){
  guide(`${key}-open`,'Відкрийте Провідник подвійним кліком по «Документи» на робочому столі.','<span><kbd>ЛКМ ×2</kbd> Документи</span>');
  return false;
 }
 if(cur.trashMode){
  guide(`${key}-from-trash`,'У лівій панелі Провідника натисніть «Документи».','<span><kbd>ЛКМ</kbd> Документи</span>');
  return false;
 }
 const cp=cur.path||[],dp=path||[];
 const common=commonPrefix(cp,dp);
 if(common<cp.length){
  guide(`${key}-back-${cp.at(-1)?.id||'x'}`,'Натисніть кнопку ←, щоб піднятися на один рівень вище.','<span><kbd>ЛКМ</kbd> ←</span>');
  return false;
 }
 if(cp.length<dp.length){
  const next=dp[cp.length];
  if(next?.name==='Документи'){
   guide(`${key}-docs`,'У лівій панелі натисніть «Документи».','<span><kbd>ЛКМ</kbd> Документи</span>');
  }else{
   guide(`${key}-next-${next?.id}`,`Двічі клацніть папку «${next?.name||'потрібна папка'}».`,'<span><kbd>ЛКМ ×2</kbd> відкрити папку</span>');
  }
  return false;
 }
 return true;
}

function recovery(id,label='Потрібний об’єкт'){
 if(!id)return true;
 const hit=loc(id);
 if(hit.where==='tree')return true;
 if(hit.where==='trash'){
  const top=hit.trashTop||hit.node;const cur=explorer();
  if(!cur.open){
   guide(`r-open-${id}`,`${label} «${hit.node?.name||top?.name}» зараз у Кошику. Відкрийте Провідник подвійним кліком по «Документи».`,'<span><kbd>ЛКМ ×2</kbd> Документи</span>');
  }else if(!cur.trashMode){
   guide(`r-trash-${id}`,`${label} «${hit.node?.name||top?.name}» було видалено. У лівій панелі натисніть «Кошик».`,'<span><kbd>ЛКМ</kbd> Кошик</span>');
  }else{
   clearTargets();rowById(top.id)?.classList.add('vidlik-files-tutorial-target');
   const restore=visibleMenu('restore');
   if(restore){
    restore.classList.add('vidlik-tutorial-ui-target');
    guide(`r-restore-${id}`,'Натисніть «Відновити». Після цього система поверне вас до поточного завдання.','<span><kbd>ЛКМ</kbd> Відновити</span>');
   }else{
    guide(`r-menu-${id}`,`Натисніть правою кнопкою «${top.name}».`,'<span><kbd>ПКМ</kbd> об’єкт</span>');
   }
  }
  return false;
 }
 guide(`r-missing-${id}`,`${label} не знайдено навіть у Кошику. Натисніть Ctrl+Z, щоб скасувати останнє видалення.`,'<span><kbd>CTRL</kbd> + <kbd>Z</kbd></span>');
 return false;
}

function guideToParent(id,purpose='продовжити'){
 const hit=loc(id);if(hit.where!=='tree')return false;
 const parentPath=(hit.path||[]).slice(0,-1);
 if(strictNavigate(parentPath,`nav-${task}-${id}`))return true;
 return false;
}

function begin(n,label,p=''){task=n;phase=p||`task-${n}`;lastGuide='';clearTargets();taskLabel(n,label);schedule(0)}
function discoverFolder(){
 if(refs.folder&&loc(refs.folder).where!=='missing')return refs.folder;
 const added=A()?.findAll?.(n=>n.type==='folder'&&!baselineIds.has(n.id))||[];
 if(added.length){refs.folder=added[0].node.id;return refs.folder}
 return null;
}
function discoverCopy(){
 if(refs.copy&&loc(refs.copy).where!=='missing')return refs.copy;
 const added=A()?.findAll?.(n=>n.kind==='xlsx'&&!baselineIds.has(n.id)&&n.id!==refs.training)||[];
 if(added.length){refs.copy=added[0].node.id;return refs.copy}
 return null;
}

function reconcile(){
 if(!active||!A())return;
 clearTimeout(timer);
 if(refs.folder&&task>=4&&task<=11&&!recovery(refs.folder,'Навчальна папка'))return;

 if(task===1){
  const cur=explorer();
  if(cur.open&&!cur.trashMode&&cur.folder?.id===refs.docs){
   if(!expected.task1)praise('t1-alt','Ви відкрили «Документи» не через ліву панель, але прийшли до правильного місця.');
   begin(2,'ВИБЕРІТЬ НАВЧАЛЬНИЙ ФАЙЛ');return;
  }
  guide('t1','У лівій панелі Провідника натисніть «Документи».','<span><kbd>ЛКМ</kbd> Документи</span>');return;
 }

 if(task===2){
  if(!recovery(refs.training,'Навчальний файл'))return;
  if(!guideToParent(refs.training,'вибрати його'))return;
  mark(refs.training);const name=objectName(refs.training,'навчальний файл');
  if(selectedId()===refs.training){
   if(alt.task2)praise('t2-alt','Ви вибрали потрібний файл клавіатурою замість одного кліку.');
   baselineIds=A()?.allIds?.()||new Set();begin(3,'СТВОРІТЬ НОВУ ПАПКУ','folder-create');return;
  }
  guide(`t2-${name}`,`Один раз натисніть лівою кнопкою на файл «${name}».`,'<span><kbd>ЛКМ</kbd> вибрати файл</span>');return;
 }

 if(task===3){
  const folder=discoverFolder();
  if(!folder){
   const cur=explorer();
   if(!cur.open||cur.trashMode){strictNavigate(loc(refs.docs).path||[],'t3-docs');return}
   const input=inlineInput();
   if(input){
    input.classList.add('vidlik-tutorial-ui-target');
    guide('t3-input','Введіть назву «Сектор 3» і натисніть Enter.','<span><kbd>ТЕКСТ</kbd> Сектор 3 · <kbd>ENTER</kbd></span>');return;
   }
   guide(`t3-create-${cur.folder?.id}`,'Натисніть кнопку ＋ у верхній панелі Провідника.','<span><kbd>＋</kbd> нова папка</span>');return;
  }
  const name=objectName(folder,'нова папка');
  if(!expected.task3)praise('t3-alt-create','Ви створили папку іншим способом.');
  if(name==='Нова папка'){
   mark(folder);guide('t3-name','Введіть назву «Сектор 3» і натисніть Enter.','<span><kbd>ТЕКСТ</kbd> Сектор 3 · <kbd>ENTER</kbd></span>');return;
  }
  if(name!=='Сектор 3')praise('t3-alt-name',`Ви дали папці власну назву «${name}». Система запам’ятала саме цю папку.`);
  begin(4,'ВІДКРИЙТЕ ПАПКУ Й ПОВЕРНІТЬСЯ НАЗАД','folder-roundtrip');return;
 }

 if(task===4){
  if(!recovery(refs.folder,'Навчальна папка'))return;
  const hit=loc(refs.folder),cur=explorer(),name=hit.node?.name||'папка';
  if(cur.folder?.id===refs.folder){
   if(!expected.task4)praise('t4-alt','Ви відкрили папку іншим способом.');
   folderOpened=true;
   guide('t4-back',`Натисніть кнопку ←, щоб повернутися з папки «${name}» назад.`,'<span><kbd>ЛКМ</kbd> ←</span>');return;
  }
  if(folderOpened&&cur.folder?.id===hit.parent?.id){begin(5,'ПЕРЕВІРТЕ ВЛАСТИВОСТІ ФАЙЛУ','properties');return}
  if(!guideToParent(refs.folder,'відкрити її'))return;
  mark(refs.folder);guide(`t4-open-${name}`,`Двічі клацніть папку «${name}».`,'<span><kbd>ЛКМ ×2</kbd> відкрити папку</span>');return;
 }

 if(task===5){
  if(!recovery(refs.training,'Навчальний файл'))return;
  if(propertiesSeen&&!dialog()){begin(6,'СКОПІЮЙТЕ ФАЙЛ','copy');return}
  if(!guideToParent(refs.training,'перевірити його властивості'))return;
  mark(refs.training);const name=objectName(refs.training,'файл');
  const dlg=dialog();
  if(dlg&&selectedId()===refs.training){
   propertiesSeen=true;guide('t5-dialog','Перегляньте ім’я, тип і розташування. Потім натисніть OK.','<span><kbd>OK</kbd></span>');return;
  }
  const prop=visibleMenu('prop');
  if(prop&&selectedId()===refs.training){prop.classList.add('vidlik-tutorial-ui-target');guide('t5-prop','Натисніть «Властивості».','<span><kbd>ЛКМ</kbd> Властивості</span>');return}
  guide(`t5-menu-${name}`,`Натисніть правою кнопкою файл «${name}».`,'<span><kbd>ПКМ</kbd> файл</span>');return;
 }

 if(task===6){
  if(!recovery(refs.training,'Навчальний файл'))return;
  if(copyDone){
   if(alt.task6)praise('t6-alt','Ви скопіювали файл комбінацією клавіш замість контекстного меню.');
   baselineIds=A()?.allIds?.()||new Set();begin(7,'ВСТАВТЕ КОПІЮ','paste');return;
  }
  if(!guideToParent(refs.training,'скопіювати його'))return;
  mark(refs.training);const name=objectName(refs.training,'файл');
  const copy=visibleMenu('copy');
  if(copy&&selectedId()===refs.training){copy.classList.add('vidlik-tutorial-ui-target');guide('t6-copy','Натисніть «Копіювати».','<span><kbd>ЛКМ</kbd> Копіювати</span>');return}
  guide(`t6-menu-${name}`,`Натисніть правою кнопкою файл «${name}».`,'<span><kbd>ПКМ</kbd> файл</span>');return;
 }

 if(task===7){
  const copy=discoverCopy();
  if(copy){
   if(!expected.task7)praise('t7-alt','Ви вставили копію іншим способом.');
   begin(8,'ПЕРЕЙМЕНУЙТЕ КОПІЮ','rename');return;
  }
  if(!recovery(refs.folder,'Навчальна папка'))return;
  const folderHit=loc(refs.folder);
  if(!strictNavigate(folderHit.path||[],'t7-folder'))return;
  const paste=visibleMenu('paste');
  if(paste){paste.classList.add('vidlik-tutorial-ui-target');guide('t7-paste','Натисніть «Вставити».','<span><kbd>ЛКМ</kbd> Вставити</span>');return}
  pane()?.classList.add('vidlik-files-tutorial-target');
  guide('t7-context','Натисніть правою кнопкою по порожньому місцю в папці.','<span><kbd>ПКМ</kbd> порожнє місце</span>');return;
 }

 if(task===8){
  const copy=discoverCopy();if(!copy){begin(7,'ВСТАВТЕ КОПІЮ','paste');return}
  if(!recovery(copy,'Створена копія'))return;
  const hit=loc(copy),name=hit.node?.name||'копія';
  if(name!=='TRAINING_SYNC_SECTOR_3 (2).xlsx'&&name!=='TRAINING_SYNC_SECTOR_3 - копія.xlsx'&&!inlineInput()){
   if(!expected.task8)praise('t8-alt-method','Ви перейменували копію іншим способом.');
   if(!/^Знайомство(?:\.xlsx)?$/i.test(name))praise('t8-alt-name',`Ви дали копії власну назву «${name}».`);
   begin(9,'ПЕРЕМІСТІТЬ ТРЕНУВАЛЬНИЙ ФАЙЛ','move-draft');return;
  }
  if(!guideToParent(copy,'перейменувати її'))return;
  mark(copy);
  const input=inlineInput();
  if(input){phase='rename-input';input.classList.add('vidlik-tutorial-ui-target');guide('t8-input','Введіть «Знайомство» і натисніть Enter.','<span><kbd>ТЕКСТ</kbd> Знайомство · <kbd>ENTER</kbd></span>');return}
  const ren=visibleMenu('rename');
  if(ren&&selectedId()===copy){ren.classList.add('vidlik-tutorial-ui-target');guide('t8-ren','Натисніть «Перейменувати».','<span><kbd>ЛКМ</kbd> Перейменувати</span>');return}
  guide(`t8-menu-${name}`,`Натисніть правою кнопкою файл «${name}».`,'<span><kbd>ПКМ</kbd> файл</span>');return;
 }

 if(task===9){
  if(!refs.draft){begin(10,'ВИДАЛІТЬ ФАЙЛ','delete');return}
  if(!recovery(refs.draft,'Тренувальна чернетка'))return;
  if(parentId(refs.draft)===refs.folder){
   if(alt.task9)praise('t9-alt','Ви перемістили файл за допомогою клавіатури замість контекстного меню.');
   begin(10,'ВИДАЛІТЬ ФАЙЛ','delete');return;
  }
  if(isCut(refs.draft)){
   const dest=loc(refs.folder);
   if(!strictNavigate(dest.path||[],'t9-dest'))return;
   const paste=visibleMenu('paste');
   if(paste){paste.classList.add('vidlik-tutorial-ui-target');guide('t9-paste','Натисніть «Вставити».','<span><kbd>ЛКМ</kbd> Вставити</span>');return}
   pane()?.classList.add('vidlik-files-tutorial-target');
   guide('t9-context-paste','Натисніть правою кнопкою по порожньому місцю.','<span><kbd>ПКМ</kbd> порожнє місце</span>');return;
  }
  if(!guideToParent(refs.draft,'вирізати її'))return;
  mark(refs.draft);const name=objectName(refs.draft,'чернетка');
  const cut=visibleMenu('cut');
  if(cut&&selectedId()===refs.draft){cut.classList.add('vidlik-tutorial-ui-target');guide('t9-cut','Натисніть «Вирізати».','<span><kbd>ЛКМ</kbd> Вирізати</span>');return}
  guide(`t9-${name}`,`Натисніть правою кнопкою файл «${name}».`,'<span><kbd>ПКМ</kbd> файл</span>');return;
 }

 if(task===10){
  if(!refs.draft){begin(11,'ВІДНОВІТЬ ФАЙЛ ІЗ КОШИКА','restore');return}
  const d=loc(refs.draft);
  if(d.where==='trash'){
   if(alt.task10)praise('t10-alt','Ви видалили файл клавішею Delete замість контекстного меню.');
   deleteSeen=true;begin(11,'ВІДНОВІТЬ ФАЙЛ ІЗ КОШИКА','restore');return;
  }
  if(d.where==='missing'){recovery(refs.draft,'Тренувальна чернетка');return}
  if(!guideToParent(refs.draft,'видалити її'))return;
  mark(refs.draft);const name=objectName(refs.draft,'файл');
  const del=visibleMenu('delete');
  if(del&&selectedId()===refs.draft){del.classList.add('vidlik-tutorial-ui-target');guide('t10-del','Натисніть «Видалити».','<span><kbd>ЛКМ</kbd> Видалити</span>');return}
  guide(`t10-${name}`,`Натисніть правою кнопкою файл «${name}».`,'<span><kbd>ПКМ</kbd> файл</span>');return;
 }

 if(task===11){
  const d=loc(refs.draft);
  if(d.where==='tree'&&deleteSeen){
   if(alt.task11)praise('t11-alt','Ви повернули файл скасуванням дії замість команди «Відновити».');
   finish();return;
  }
  if(d.where==='missing'){recovery(refs.draft,'Тренувальна чернетка');return}
  if(d.where==='trash'){recovery(refs.draft,'Тренувальна чернетка');return}
  finish();
 }
}

function finish(){
 active=false;task=12;phase='complete';lastGuide='';clearTargets();
 adminMessage('Готово. Ви завершили розділ «Файли та папки».');
 setFooter('11 / 11 · ФАЙЛИ ТА ПАПКИ · ЗАВЕРШЕНО ✓');
 setHelp('<span><kbd>ГОТОВО</kbd> розділ «Файли та папки» завершено</span>');
 setTimeout(()=>window.dispatchEvent(new CustomEvent('vidlik:files-section-complete')),450);
}
function start(){
 if(active)return;
 active=true;task=0;phase='starting';lastGuide='';clearTargets();praised.clear();
 expected={task1:false,task3:false,task4:false,task7:false,task8:false,task9Cut:false,task9Paste:false,task10:false,task11:false};
 alt={task1:false,task2:false,task3:false,task4:false,task6:false,task7:false,task8:false,task9:false,task10:false,task11:false};
 OS()?.openDesktopApp?.('pc');
 setTimeout(()=>{if(!active)return;if(findInitialRefs())begin(1,'ВІДКРИЙТЕ «ДОКУМЕНТИ»');else guide('init','У лівій панелі Провідника натисніть «Документи».','<span><kbd>ЛКМ</kbd> Документи</span>')},180);
}
function reset(){
 active=false;task=0;phase='idle';lastGuide='';clearTimeout(timer);clearTargets();refs={docs:null,training:null,folder:null,copy:null,draft:null};baselineIds=new Set();praised.clear();
}

mon.addEventListener('click',e=>{
 if(!active)return;
 const nav=e.target.closest('[data-nav]')?.dataset.nav;
 const app=e.target.closest('[data-app]')?.dataset.app;
 const act=e.target.closest('[data-act]')?.dataset.act;
 const menu=e.target.closest('[data-menu]')?.dataset.menu;

 if(task===1){
  if(nav==='docs')expected.task1=true;
  else if(app==='folder'||app==='pc')alt.task1=true;
 }
 if(task===3){
  if(act==='new')expected.task3=true;
  if(menu==='new')alt.task3=true;
 }
 if(task===6&&menu==='copy'&&selectedId()===refs.training){copyDone=true}
 if(task===7&&menu==='paste')expected.task7=true;
 if(task===8&&menu==='rename')expected.task8=true;
 if(task===9){
  if(menu==='cut')expected.task9Cut=true;
  if(menu==='paste')expected.task9Paste=true;
 }
 if(task===10&&menu==='delete')expected.task10=true;
 if(task===11&&menu==='restore')expected.task11=true;
 schedule(menu?100:35);
},true);

mon.addEventListener('dblclick',e=>{
 if(!active)return;
 if(task===4&&e.target.closest('.os-file-item')?.dataset.id===refs.folder)expected.task4=true;
 schedule(55);
},true);

mon.addEventListener('contextmenu',()=>schedule(40),true);

window.addEventListener('keydown',e=>{
 if(!active)return;
 const key=e.key.toLowerCase();
 if(task===2&&(e.key==='ArrowUp'||e.key==='ArrowDown'))alt.task2=true;
 if(task===4&&e.key==='Enter'&&selectedId()===refs.folder)alt.task4=true;
 if(task===6&&e.ctrlKey&&!e.altKey&&!e.metaKey&&key==='c'&&selectedId()===refs.training){alt.task6=true;copyDone=true}
 if(task===7&&e.ctrlKey&&!e.altKey&&!e.metaKey&&key==='v')alt.task7=true;
 if(task===8&&e.key==='F2')alt.task8=true;
 if(task===9&&e.ctrlKey&&!e.altKey&&!e.metaKey&&(key==='x'||key==='v'))alt.task9=true;
 if(task===10&&e.key==='Delete')alt.task10=true;
 if(task===11&&e.ctrlKey&&!e.altKey&&!e.metaKey&&key==='z')alt.task11=true;
 if((e.ctrlKey&&['c','v','x','z'].includes(key))||e.key==='Delete'||e.key==='Enter'||e.key==='F2')schedule(110);else schedule(35);
},true);

A()?.subscribe?.(()=>{if(active)schedule(20)});
window.addEventListener('vidlik:section2-ready',start);
window.addEventListener('vidlik:os-reset',reset);
window.VIDLIK_FILES_TUTORIAL={start,reset,reconcile,get task(){return task},get phase(){return phase},get active(){return active},get refs(){return{...refs}}};
})();