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
let folderInitialName='';
let copyInitialName='';
let folderOpened=false;
let propertiesSeen=false;
let copyDone=false;
let deleteSeen=false;

const A=()=>window.VIDLIK_ADAPTIVE_STATE;
const OS=()=>window.VIDLIK_OS;

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
function setFooter(text){footer.textContent=text;footer.classList.add('vidlik-tutorial-footer')}
function setHelp(html){if(help){help.classList.add('vidlik-tutorial-help');help.innerHTML=html}}
function taskLabel(n,text){setFooter(`ЗАВДАННЯ ${n} / 11 · ${text}`)}
function guide(key,text,html){if(!active||lastGuide===key)return;lastGuide=key;adminMessage(text);if(html)setHelp(html)}
function schedule(ms=35){clearTimeout(timer);timer=setTimeout(reconcile,ms)}
function explorer(){return A()?.currentExplorer?.()||{open:false,trashMode:false,folder:null,selectedIds:[]}}
function selectedId(){return A()?.selectedId?.()||null}
function loc(id){return A()?.locate?.(id)||{where:'missing',node:null,parent:null,path:[]}}
function objectName(id,f='об’єкт'){return A()?.objectName?.(id,f)||f}
function parentId(id){return A()?.parentId?.(id)||null}
function rowById(id){return A()?.rowById?.(id)||null}
function currentFolderId(){return A()?.currentFolderId?.()||null}
function pathText(hit){return A()?.describePath?.((hit?.path||[]).slice(0,-1))||''}
function clearTargets(){document.querySelectorAll('.vidlik-tutorial-ui-target,.vidlik-files-tutorial-target,.os-keyboard-target').forEach(x=>x.classList.remove('vidlik-tutorial-ui-target','vidlik-files-tutorial-target','os-keyboard-target'))}
function mark(id){clearTargets();const row=rowById(id);if(row)row.classList.add('vidlik-files-tutorial-target')}
function visibleMenu(action){return document.querySelector(`.os-context-menu:not([hidden]) [data-menu="${action}"]`)}
function dialog(){return document.querySelector('.os-dialog-wrap')}
function inlineInput(){return document.querySelector('.os-window[data-window-id="explorer"] .os-inline-input')}
function pane(){return document.querySelector('.os-window[data-window-id="explorer"] .os-file-pane')}

function findInitialRefs(){
 const docs=A()?.findByName?.('Документи',n=>n.type==='folder');if(!docs)return false;
 refs.docs=docs.node.id;
 refs.training=(docs.node.children||[]).find(x=>x.kind==='xlsx'&&x.training)?.id||(docs.node.children||[]).find(x=>x.kind==='xlsx')?.id||null;
 refs.draft=(docs.node.children||[]).find(x=>x.kind==='txt'&&x.training)?.id||(docs.node.children||[]).find(x=>x.name==='чернетка.txt')?.id||null;
 return !!refs.training;
}

function recovery(id,label='Потрібний об’єкт'){
 if(!id)return true;
 const hit=loc(id);
 if(hit.where==='tree')return true;
 if(hit.where==='trash'){
  const top=hit.trashTop||hit.node;const cur=explorer();
  if(!cur.open){guide(`r-open-${id}`,`${label} «${hit.node?.name||top?.name}» зараз у Кошику. Відкрийте Провідник і перейдіть до Кошика.`, '<span><kbd>КОШИК</kbd> знайти об’єкт</span>')}
  else if(!cur.trashMode){guide(`r-trash-${id}`,`${label} «${hit.node?.name||top?.name}» було видалено. Відкрийте «Кошик» у лівій панелі.`, '<span><kbd>КОШИК</kbd> відкрити Кошик</span>')}
  else{
   clearTargets();rowById(top.id)?.classList.add('vidlik-files-tutorial-target');
   const restore=visibleMenu('restore');
   if(restore){restore.classList.add('vidlik-tutorial-ui-target');guide(`r-restore-${id}`,'Натисніть «Відновити». Після відновлення ми автоматично повернемося до поточного завдання.','<span><kbd>ЛКМ</kbd> Відновити</span>')}
   else guide(`r-menu-${id}`,`Натисніть правою кнопкою «${top.name}» і виберіть «Відновити».`, '<span><kbd>ПКМ</kbd> об’єкт · <kbd>ВІДНОВИТИ</kbd></span>');
  }
  return false;
 }
 guide(`r-missing-${id}`,`${label} не знайдено навіть у Кошику. Натискайте Ctrl+Z, доки об’єкт не повернеться.`, '<span><kbd>CTRL</kbd> + <kbd>Z</kbd> скасувати видалення</span>');
 return false;
}

function guideToParent(id,purpose='продовжити'){ 
 const hit=loc(id);if(hit.where!=='tree')return false;
 const cur=explorer();if(cur.open&&!cur.trashMode&&cur.folder?.id===hit.parent?.id)return true;
 const dest=pathText(hit),name=hit.node?.name||'об’єкт';
 if(cur.folder?.id===id&&hit.node?.type==='folder')guide(`up-${task}-${id}`,`Ви зараз усередині «${name}». Поверніться на рівень вище кнопкою ←, щоб ${purpose}.`, '<span><kbd>←</kbd> на рівень вище</span>');
 else guide(`nav-${task}-${id}-${cur.folder?.id||'none'}`,`Потрібний об’єкт «${name}» зараз у «${dest}». Перейдіть туди будь-яким уже знайомим способом.`, '<span><kbd>ПРОВІДНИК</kbd> перейти до потрібної папки</span>');
 return false;
}

function begin(n,label,p=''){task=n;phase=p||`task-${n}`;lastGuide='';clearTargets();taskLabel(n,label);schedule(0)}
function discoverFolder(){
 if(refs.folder&&loc(refs.folder).where!=='missing')return refs.folder;
 const added=A()?.findAll?.(n=>n.type==='folder'&&!baselineIds.has(n.id))||[];
 if(added.length){refs.folder=added[0].node.id;folderInitialName=added[0].node.name;return refs.folder}
 return null;
}
function discoverCopy(){
 if(refs.copy&&loc(refs.copy).where!=='missing')return refs.copy;
 const added=A()?.findAll?.(n=>n.kind==='xlsx'&&!baselineIds.has(n.id)&&n.id!==refs.training)||[];
 if(added.length){refs.copy=added[0].node.id;copyInitialName=added[0].node.name;return refs.copy}
 return null;
}

function reconcile(){
 if(!active||!A())return;
 clearTimeout(timer);
 if(refs.folder&&task>=4&&task<=11&&!recovery(refs.folder,'Навчальна папка'))return;

 if(task===1){
  const cur=explorer();
  if(cur.open&&!cur.trashMode&&cur.folder?.id===refs.docs){begin(2,'ВИБЕРІТЬ НАВЧАЛЬНИЙ ФАЙЛ');return}
  guide('t1','Починаємо з «Документів». Відкрийте цю папку через ліву панель, робочий стіл або будь-який інший уже знайомий спосіб.','<span><kbd>ДОКУМЕНТИ</kbd> відкрити папку</span>');return;
 }

 if(task===2){
  if(!recovery(refs.training,'Навчальний файл'))return;
  if(!guideToParent(refs.training,'вибрати його'))return;
  mark(refs.training);const name=objectName(refs.training,'навчальний файл');
  if(selectedId()===refs.training){baselineIds=A()?.allIds?.()||new Set();begin(3,'СТВОРІТЬ НОВУ ПАПКУ','folder-create');return}
  guide(`t2-${name}`,`Знайдіть навчальний файл «${name}» і виберіть його одним кліком. Якщо ви його перейменували — орієнтуйтеся на поточну назву, яку показує система.`, '<span><kbd>ЛКМ</kbd> вибрати навчальний файл</span>');return;
 }

 if(task===3){
  const folder=discoverFolder();
  if(!folder){
   const cur=explorer();
   if(!cur.open||cur.trashMode){guide('t3-nav','Перейдіть у звичайну папку Провідника й створіть нову папку кнопкою ＋.','<span><kbd>＋</kbd> створити папку</span>');return}
   guide(`t3-create-${cur.folder?.id}`,`Створіть нову папку кнопкою ＋. Дайте їй зрозумілу назву — наприклад «Сектор 3». Система запам’ятає саму папку, навіть якщо ви назвете її інакше.`, '<span><kbd>＋</kbd> нова папка · <kbd>ENTER</kbd> підтвердити назву</span>');return;
  }
  const name=objectName(folder,'нова папка');
  if(name==='Нова папка'){
   mark(folder);guide('t3-name','Папка створена. Дайте їй назву й підтвердьте Enter. Назва може бути будь-якою — далі ми відстежуємо її за внутрішнім ID.','<span><kbd>ТЕКСТ</kbd> назва папки · <kbd>ENTER</kbd></span>');return;
  }
  begin(4,'ВІДКРИЙТЕ ПАПКУ Й ПОВЕРНІТЬСЯ НАЗАД','folder-roundtrip');return;
 }

 if(task===4){
  if(!recovery(refs.folder,'Навчальна папка'))return;
  const hit=loc(refs.folder),cur=explorer(),name=hit.node?.name||'папка';
  if(cur.folder?.id===refs.folder){folderOpened=true;guide('t4-back',`Папка «${name}» відкрита. Тепер поверніться назад кнопкою ←.`, '<span><kbd>←</kbd> повернутися назад</span>');return}
  if(folderOpened&&cur.folder?.id===hit.parent?.id){begin(5,'ПЕРЕВІРТЕ ВЛАСТИВОСТІ ФАЙЛУ','properties');return}
  if(!guideToParent(refs.folder,'відкрити її'))return;
  mark(refs.folder);guide(`t4-open-${name}`,`Відкрийте «${name}» подвійним кліком. Після перегляду поверніться назад кнопкою ←.`, '<span><kbd>ЛКМ ×2</kbd> відкрити папку</span>');return;
 }

 if(task===5){
  if(!recovery(refs.training,'Навчальний файл'))return;
  if(propertiesSeen&&!dialog()){begin(6,'СКОПІЮЙТЕ ФАЙЛ','copy');return}
  if(!guideToParent(refs.training,'перевірити його властивості'))return;
  mark(refs.training);const name=objectName(refs.training,'файл');
  const dlg=dialog();
  if(dlg&&selectedId()===refs.training){propertiesSeen=true;guide('t5-dialog','Перегляньте ім’я, тип і розташування, потім натисніть OK.','<span><kbd>OK</kbd> закрити властивості</span>');return}
  const prop=visibleMenu('prop');
  if(prop&&selectedId()===refs.training){prop.classList.add('vidlik-tutorial-ui-target');guide('t5-prop','Натисніть «Властивості».','<span><kbd>ЛКМ</kbd> Властивості</span>');return}
  guide(`t5-menu-${name}`,`Натисніть правою кнопкою файл «${name}» і відкрийте «Властивості».`, '<span><kbd>ПКМ</kbd> файл · <kbd>ВЛАСТИВОСТІ</kbd></span>');return;
 }

 if(task===6){
  if(!recovery(refs.training,'Навчальний файл'))return;
  if(copyDone){baselineIds=A()?.allIds?.()||new Set();begin(7,'ВСТАВТЕ КОПІЮ','paste');return}
  if(!guideToParent(refs.training,'скопіювати його'))return;
  mark(refs.training);const name=objectName(refs.training,'файл');
  const copy=visibleMenu('copy');
  if(copy&&selectedId()===refs.training){copy.classList.add('vidlik-tutorial-ui-target');guide('t6-copy','Натисніть «Копіювати».','<span><kbd>ЛКМ</kbd> Копіювати</span>');return}
  guide(`t6-menu-${name}`,`Натисніть правою кнопкою «${name}» і виберіть «Копіювати». Якщо використаєте Ctrl+C — система теж це прийме.`, '<span><kbd>ПКМ</kbd> · Копіювати</span>');return;
 }

 if(task===7){
  const copy=discoverCopy();if(copy){begin(8,'ПЕРЕЙМЕНУЙТЕ КОПІЮ','rename');return}
  const folder=refs.folder;
  if(!recovery(folder,'Навчальна папка'))return;
  const cur=explorer();
  if(cur.folder?.id!==folder){
   if(!guideToParent(folder,'відкрити її для вставлення'))return;
   mark(folder);guide(`t7-open-${objectName(folder,'папка')}`,`Відкрийте папку «${objectName(folder,'папка')}» і вставте туди копію.`, '<span><kbd>ЛКМ ×2</kbd> відкрити папку</span>');return;
  }
  const paste=visibleMenu('paste');
  if(paste){paste.classList.add('vidlik-tutorial-ui-target');guide('t7-paste','Натисніть «Вставити».','<span><kbd>ЛКМ</kbd> Вставити</span>');return}
  pane()?.classList.add('vidlik-files-tutorial-target');guide('t7-context','Натисніть правою кнопкою по порожньому місцю й виберіть «Вставити». Ctrl+V також буде прийнято.','<span><kbd>ПКМ</kbd> порожнє місце · Вставити</span>');return;
 }

 if(task===8){
  const copy=discoverCopy();if(!copy){begin(7,'ВСТАВТЕ КОПІЮ','paste');return}
  if(!recovery(copy,'Створена копія'))return;
  const hit=loc(copy),name=hit.node?.name||'копія';
  if(copyInitialName&&name!==copyInitialName&&!inlineInput()){begin(9,'ПЕРЕМІСТІТЬ ТРЕНУВАЛЬНИЙ ФАЙЛ','move-draft');return}
  if(!guideToParent(copy,'перейменувати її'))return;
  mark(copy);
  const input=inlineInput();
  if(input){phase='rename-input';input.classList.add('vidlik-tutorial-ui-target');guide('t8-input','Введіть будь-яку зрозумілу нову назву й натисніть Enter. Наприклад: «Знайомство». Розширення .xlsx краще залишити без змін.','<span><kbd>ТЕКСТ</kbd> нова назва · <kbd>ENTER</kbd></span>');return}
  const ren=visibleMenu('rename');
  if(ren&&selectedId()===copy){ren.classList.add('vidlik-tutorial-ui-target');guide('t8-ren','Натисніть «Перейменувати».','<span><kbd>ЛКМ</kbd> Перейменувати</span>');return}
  guide(`t8-menu-${name}`,`Натисніть правою кнопкою «${name}» і виберіть «Перейменувати». Система продовжить відстежувати цей самий файл під новою назвою.`, '<span><kbd>ПКМ</kbd> · Перейменувати</span>');return;
 }

 if(task===9){
  if(!refs.draft){begin(10,'ВИДАЛІТЬ ФАЙЛ','delete');return}
  if(!recovery(refs.draft,'Тренувальна чернетка'))return;
  if(parentId(refs.draft)===refs.folder){begin(10,'ВИДАЛІТЬ ФАЙЛ','delete');return}
  if(!guideToParent(refs.draft,'перемістити її'))return;
  mark(refs.draft);const name=objectName(refs.draft,'чернетка');
  const cut=visibleMenu('cut');
  if(cut&&selectedId()===refs.draft){cut.classList.add('vidlik-tutorial-ui-target');guide('t9-cut','Натисніть «Вирізати», потім перейдіть до навчальної папки й вставте файл.','<span><kbd>ЛКМ</kbd> Вирізати</span>');return}
  guide(`t9-${name}`,`Перемістіть «${name}» до папки «${objectName(refs.folder,'навчальна папка')}». Можна використати ПКМ → Вирізати / Вставити або вже знайомі Ctrl+X / Ctrl+V.`, '<span><kbd>ВИРІЗАТИ</kbd> → <kbd>ВСТАВИТИ</kbd></span>');return;
 }

 if(task===10){
  if(!refs.draft){begin(11,'ВІДНОВІТЬ ФАЙЛ ІЗ КОШИКА','restore');return}
  const d=loc(refs.draft);
  if(d.where==='trash'){deleteSeen=true;begin(11,'ВІДНОВІТЬ ФАЙЛ ІЗ КОШИКА','restore');return}
  if(d.where==='missing'){recovery(refs.draft,'Тренувальна чернетка');return}
  if(!guideToParent(refs.draft,'видалити її'))return;
  mark(refs.draft);const name=objectName(refs.draft,'файл');
  const del=visibleMenu('delete');
  if(del&&selectedId()===refs.draft){del.classList.add('vidlik-tutorial-ui-target');guide('t10-del','Натисніть «Видалити».','<span><kbd>ЛКМ</kbd> Видалити</span>');return}
  guide(`t10-${name}`,`Видаліть «${name}». Можна через контекстне меню або клавішу Delete. Файл повинен опинитися в Кошику.`, '<span><kbd>ВИДАЛИТИ</kbd> файл</span>');return;
 }

 if(task===11){
  const d=loc(refs.draft);
  if(d.where==='tree'&&deleteSeen){finish();return}
  if(d.where==='missing'){recovery(refs.draft,'Тренувальна чернетка');return}
  if(d.where==='trash'){
   recovery(refs.draft,'Тренувальна чернетка');return;
  }
  guide('t11-wait','Файл уже відновлено. Завершуємо розділ.','<span><kbd>ГОТОВО</kbd></span>');finish();
 }
}

function finish(){
 active=false;task=12;phase='complete';lastGuide='';clearTargets();
 adminMessage('Готово. Ви працювали з файлами й папками вільно, а система відстежувала конкретні об’єкти навіть після перейменування, переміщення або видалення.');
 setFooter('11 / 11 · ФАЙЛИ ТА ПАПКИ · ЗАВЕРШЕНО ✓');
 setHelp('<span><kbd>ГОТОВО</kbd> розділ «Файли та папки» завершено</span>');
 setTimeout(()=>window.dispatchEvent(new CustomEvent('vidlik:files-section-complete')),450);
}
function start(){
 if(active)return;active=true;task=0;phase='starting';lastGuide='';clearTargets();
 OS()?.openDesktopApp?.('pc');
 setTimeout(()=>{if(!active)return;if(findInitialRefs())begin(1,'ВІДКРИЙТЕ «ДОКУМЕНТИ»');else guide('init','Відкрийте «Документи». Система сканує навчальні об’єкти.','<span><kbd>ДОКУМЕНТИ</kbd> відкрити папку</span>')},180);
}
function reset(){active=false;task=0;phase='idle';lastGuide='';clearTimeout(timer);clearTargets();refs={docs:null,training:null,folder:null,copy:null,draft:null};baselineIds=new Set()}

mon.addEventListener('click',e=>{
 if(!active)return;
 const menu=e.target.closest('[data-menu]');
 if(menu?.dataset.menu==='copy'&&selectedId()===refs.training){copyDone=true;schedule(70);return}
 if(menu?.dataset.menu==='paste'){schedule(110);return}
 if(menu?.dataset.menu==='restore'){schedule(110);return}
 if(menu?.dataset.menu==='delete'){schedule(110);return}
 schedule(35);
},true);
mon.addEventListener('contextmenu',()=>schedule(40),true);
window.addEventListener('keydown',e=>{
 if(!active)return;
 if(e.ctrlKey&&e.key.toLowerCase()==='c'&&selectedId()===refs.training){copyDone=true;schedule(50);return}
 if((e.ctrlKey&&['v','x','z'].includes(e.key.toLowerCase()))||e.key==='Delete'||e.key==='Enter')schedule(100);else schedule(35);
},true);
A()?.subscribe?.(()=>{if(active)schedule(20)});
window.addEventListener('vidlik:section2-ready',start);
window.addEventListener('vidlik:os-reset',reset);
window.VIDLIK_FILES_TUTORIAL={start,reset,reconcile,get task(){return task},get phase(){return phase},get active(){return active},get refs(){return{...refs}}};
})();
