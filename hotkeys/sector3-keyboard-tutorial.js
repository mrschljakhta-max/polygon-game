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
let focusIndex=-1;
let lastGuide='';
let reconcileTimer=null;
let refs={docs:null,folder:null,original:null,draft:null,copy:null,reports:null};
let arrowUsed=false;
let enterUsed=false;
let tabCount=0;
let shiftTabUsed=false;
let deleteKeyUsed=false;
let copyKeyUsed=false;
let pasteKeyUsed=false;
let cutKeyUsed=false;
let ctrlZUsed=false;
let selectAllUsed=false;
let searchKeyUsed=false;
let beforePasteIds=new Set();
let moveOriginParentId=null;

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
function guide(key,text,html){
 if(!active||lastGuide===key)return;
 lastGuide=key;
 adminMessage(text);
 if(html)setHelp(html);
}
function schedule(ms=35){clearTimeout(reconcileTimer);reconcileTimer=setTimeout(reconcile,ms)}
function clearVisuals(){document.querySelectorAll('.os-keyboard-focus,.os-keyboard-target,.vidlik-tutorial-ui-target').forEach(x=>x.classList.remove('os-keyboard-focus','os-keyboard-target','vidlik-tutorial-ui-target'));focusIndex=-1}
function markId(id){document.querySelectorAll('.os-keyboard-target').forEach(x=>x.classList.remove('os-keyboard-target'));A()?.rowById(id)?.classList.add('os-keyboard-target')}
function explorer(){return A()?.currentExplorer?.()||{open:false,trashMode:false,folder:null,selectedIds:[]}}
function selectedId(){return A()?.selectedId?.()||null}
function currentFolderId(){return A()?.currentFolderId?.()||null}
function objectName(id,fallback='об’єкт'){return A()?.objectName?.(id,fallback)||fallback}
function loc(id){return A()?.locate?.(id)||{where:'missing',node:null,parent:null,path:[]}}
function parentId(id){return A()?.parentId?.(id)||null}
function pathText(hit){return A()?.describePath?.((hit?.path||[]).slice(0,-1))||''}
function allRows(){return [...document.querySelectorAll('.os-window[data-window-id="explorer"] .os-file-item')]}
function searchInput(){return document.querySelector('.os-window[data-window-id="explorer"] input[id^="osSearch-"]')}
function searchButton(){return document.querySelector('.os-window[data-window-id="explorer"] [data-act="search"]')}
function backButton(){return document.querySelector('.os-window[data-window-id="explorer"] [data-act="back"]')}
function newButton(){return document.querySelector('.os-window[data-window-id="explorer"] [data-act="new"]')}
function keyboardFocusables(){return [backButton(),newButton(),searchButton()].filter(Boolean)}
function setKeyboardFocus(index){
 const items=keyboardFocusables();if(!items.length)return null;
 document.querySelectorAll('.os-keyboard-focus').forEach(x=>x.classList.remove('os-keyboard-focus'));
 focusIndex=Math.max(0,Math.min(items.length-1,index));
 const el=items[focusIndex];el.classList.add('os-keyboard-focus');return el;
}
function isCtrl(e,key){return e.ctrlKey&&!e.altKey&&!e.metaKey&&e.key.toLowerCase()===key}
function stop(e){e.preventDefault();e.stopPropagation();e.stopImmediatePropagation()}

function findInitialRefs(){
 const api=A();if(!api)return false;
 const docsHit=api.findByName('Документи',(n)=>n.type==='folder');
 if(!docsHit)return false;
 refs.docs=docsHit.node.id;
 refs.reports=(docsHit.node.children||[]).find(x=>x.type==='folder'&&x.name==='Звіти')?.id||null;
 let candidate=(docsHit.node.children||[]).find(x=>x.type==='folder'&&(x.children||[]).some(y=>y.kind==='xlsx'&&y.training));
 if(!candidate)candidate=(docsHit.node.children||[]).find(x=>x.type==='folder'&&(x.children||[]).some(y=>y.kind==='xlsx'));
 if(!candidate)return false;
 refs.folder=candidate.id;
 refs.original=(candidate.children||[]).find(x=>x.kind==='xlsx'&&x.training)?.id||(candidate.children||[]).find(x=>x.kind==='xlsx')?.id||null;
 refs.draft=(candidate.children||[]).find(x=>x.kind==='txt'&&x.training)?.id||(candidate.children||[]).find(x=>x.kind==='txt')?.id||null;
 return !!refs.folder;
}

function recoveryFor(id,label='потрібний об’єкт'){
 if(!id)return true;
 const hit=loc(id);
 if(hit.where==='tree')return true;
 if(hit.where==='trash'){
  const top=hit.trashTop||hit.node;
  const bin=explorer();
  if(!bin.open){
   guide(`restore-open-explorer-${id}`,`${label} «${hit.node?.name||top?.name}» зараз у Кошику. Відкрийте Провідник, потім «Кошик» і відновіть його.`, '<span><kbd>КОШИК</kbd> знайти видалений об’єкт</span>');
  }else if(!bin.trashMode){
   guide(`restore-go-trash-${id}`,`${label} «${hit.node?.name||top?.name}» було переміщено до Кошика. Відкрийте «Кошик» у лівій панелі.`, '<span><kbd>КОШИК</kbd> відкрити Кошик</span>');
  }else{
   const row=A()?.rowById(top.id);if(row)row.classList.add('os-keyboard-target');
   const restore=document.querySelector('.os-context-menu:not([hidden]) [data-menu="restore"]');
   if(restore){
    restore.classList.add('vidlik-tutorial-ui-target');
    guide(`restore-click-${id}`,`Меню відкрито. Натисніть «Відновити». Після цього продовжимо поточне завдання.`, '<span><kbd>ЛКМ</kbd> Відновити</span>');
   }else{
    guide(`restore-menu-${id}`,`Знайдіть «${top.name}» у Кошику, натисніть його правою кнопкою миші й оберіть «Відновити».`, '<span><kbd>ПКМ</kbd> об’єкт · <kbd>ЛКМ</kbd> Відновити</span>');
   }
  }
  return false;
 }
 guide(`missing-${id}`,`${label} більше не знаходиться ні у файловій системі, ні в Кошику. Натискайте Ctrl+Z, доки об’єкт не повернеться.`, '<span><kbd>CTRL</kbd> + <kbd>Z</kbd> повернути видалений об’єкт</span>');
 return false;
}

function guideToParent(id,purpose='продовжити завдання'){
 const hit=loc(id);if(hit.where!=='tree')return false;
 const cur=explorer();
 const parent=hit.parent;
 if(cur.open&&!cur.trashMode&&cur.folder?.id===parent?.id)return true;
 const name=hit.node?.name||'об’єкт';
 const destination=pathText(hit)||'потрібна папка';
 if(cur.trashMode){
  guide(`nav-from-trash-${task}-${id}`,`Ми зараз у Кошику. Потрібний об’єкт «${name}» знаходиться у «${destination}». Перейдіть туди через ліву панель або кнопку «Назад», щоб ${purpose}.`, '<span><kbd>ПРОВІДНИК</kbd> повернутися до потрібної папки</span>');
 }else if(cur.folder?.id===id&&hit.node?.type==='folder'){
  guide(`nav-inside-target-${task}-${id}`,`Ви вже всередині папки «${name}». Для поточної вправи потрібен рівень вище. Натисніть ←, після чого знову виберіть «${name}».`, '<span><kbd>←</kbd> на рівень вище</span>');
 }else{
  guide(`nav-parent-${task}-${id}-${cur.folder?.id||'none'}`,`Потрібний об’єкт «${name}» зараз знаходиться у «${destination}». Перейдіть до цієї папки будь-яким уже знайомим способом, після чого продовжимо.`, '<span><kbd>ПРОВІДНИК</kbd> перейдіть до потрібного розташування</span>');
 }
 return false;
}

function ensureFolderInside(){
 if(!recoveryFor(refs.folder,'Сюжетна папка'))return false;
 const hit=loc(refs.folder);const cur=explorer();const name=hit.node?.name||'папка';
 if(cur.open&&!cur.trashMode&&cur.folder?.id===refs.folder)return true;
 if(hit.where==='tree'&&cur.open&&!cur.trashMode&&cur.folder?.id===hit.parent?.id){
  markId(refs.folder);
  guide(`enter-folder-${task}-${name}`,`Поверніться в папку «${name}»: виберіть її та відкрийте подвійним кліком або Enter. Після цього продовжимо з того самого завдання.`, '<span><kbd>ЛКМ ×2</kbd> або <kbd>ENTER</kbd> відкрити папку</span>');
  return false;
 }
 guideToParent(refs.folder,'повернутися до вправи');
 return false;
}

function beginTask1(){task=1;phase='arrows';lastGuide='';clearVisuals();taskLabel(1,'ВИБЕРІТЬ ПАПКУ СТРІЛКАМИ');reconcile()}
function beginTask2(){task=2;phase='enter-open';lastGuide='';clearVisuals();taskLabel(2,'ВІДКРИЙТЕ ПАПКУ КЛАВІШЕЮ ENTER');reconcile()}
function beginTask3(){task=3;phase='tab-forward';lastGuide='';clearVisuals();tabCount=0;taskLabel(3,'ПЕРЕМІЩУЙТЕ ФОКУС КЛАВІШЕЮ TAB');reconcile()}
function beginTask4(){task=4;phase='tab-back';lastGuide='';shiftTabUsed=false;taskLabel(4,'ПОВЕРНІТЬ ФОКУС SHIFT + TAB');reconcile()}
function beginTask5(){task=5;phase='delete';lastGuide='';clearVisuals();deleteKeyUsed=false;taskLabel(5,'ВИДАЛІТЬ ФАЙЛ КЛАВІШЕЮ DELETE');reconcile()}
function beginTask6(){task=6;phase='copy';lastGuide='';clearVisuals();copyKeyUsed=false;taskLabel(6,'СКОПІЮЙТЕ ФАЙЛ CTRL + C');reconcile()}
function beginTask7(){task=7;phase='paste';lastGuide='';pasteKeyUsed=false;beforePasteIds=A()?.allIds?.()||new Set();taskLabel(7,'ВСТАВТЕ КОПІЮ CTRL + V');reconcile()}
function beginTask8(){task=8;phase='move';lastGuide='';clearVisuals();cutKeyUsed=false;pasteKeyUsed=false;moveOriginParentId=refs.copy?parentId(refs.copy):null;taskLabel(8,'ПЕРЕМІСТІТЬ ФАЙЛ CTRL + X / CTRL + V');reconcile()}
function beginTask9(){task=9;phase='undo';lastGuide='';ctrlZUsed=false;taskLabel(9,'СКАСУЙТЕ ДІЮ CTRL + Z');reconcile()}
function beginTask10(){task=10;phase='select-all';lastGuide='';selectAllUsed=false;taskLabel(10,'ВИДІЛІТЬ УСІ ОБ’ЄКТИ CTRL + A');reconcile()}
function beginTask11(){task=11;phase='search';lastGuide='';searchKeyUsed=false;taskLabel(11,'ЗНАЙДІТЬ ОБ’ЄКТ CTRL + F');reconcile()}

function discoverCopy(){
 if(refs.copy&&loc(refs.copy).where!=='missing')return refs.copy;
 const before=beforePasteIds||new Set();
 const candidates=A()?.findAll?.((n)=>n.kind==='xlsx'&&!before.has(n.id))||[];
 if(candidates.length){refs.copy=candidates[0].node.id;return refs.copy}
 return null;
}

function reconcile(){
 if(!active||!A())return;
 clearTimeout(reconcileTimer);

 if(task<=10&&refs.folder&&!recoveryFor(refs.folder,'Сюжетна папка'))return;

 if(task===1){
  if(!guideToParent(refs.folder,'вибрати її стрілками'))return;
  markId(refs.folder);
  if(arrowUsed&&selectedId()===refs.folder){beginTask2();return}
  const name=objectName(refs.folder,'папка');
  guide(`t1-${name}-${selectedId()}`,`Натискайте ↑ або ↓, доки не буде вибрано папку «${name}». Якщо ви її проскочили — просто поверніться стрілкою назад.`, '<span><kbd>↑</kbd><kbd>↓</kbd> рух між об’єктами</span>');
  return;
 }

 if(task===2){
  const cur=explorer();const name=objectName(refs.folder,'папка');
  if(cur.folder?.id===refs.folder){
   if(enterUsed){beginTask3();return}
   guide(`t2-opened-mouse-${name}`,`Папку «${name}» уже відкрито. Це не помилка. Для вправи з Enter поверніться на рівень вище кнопкою ←, виберіть її й відкрийте клавішею Enter.`, '<span><kbd>←</kbd> назад · <kbd>ENTER</kbd> відкрити</span>');
   return;
  }
  if(!guideToParent(refs.folder,'відкрити її клавішею Enter'))return;
  markId(refs.folder);
  if(selectedId()===refs.folder){
   guide(`t2-ready-${name}`,`Папку «${name}» вибрано. Натисніть Enter, щоб її відкрити.`, '<span><kbd>ENTER</kbd> відкрити вибраний об’єкт</span>');
  }else{
   guide(`t2-select-${name}`,`Поверніть виділення на папку «${name}» стрілками ↑/↓, а потім натисніть Enter.`, '<span><kbd>↑</kbd><kbd>↓</kbd> вибрати · <kbd>ENTER</kbd> відкрити</span>');
  }
  return;
 }

 if(task===3){
  if(!ensureFolderInside())return;
  if(tabCount>=2){beginTask4();return}
  guide(`t3-${tabCount}`,`Клавіша Tab переміщує фокус між елементами інтерфейсу. Натисніть Tab ${tabCount?'ще раз':'двічі'} й стежте за бірюзовою рамкою.`, '<span><kbd>TAB</kbd> наступний елемент</span>');
  return;
 }

 if(task===4){
  if(!ensureFolderInside())return;
  if(shiftTabUsed){beginTask5();return}
  guide('t4',`Тепер поверніть фокус на попередній елемент: затисніть Shift і натисніть Tab.`, '<span><kbd>SHIFT</kbd> + <kbd>TAB</kbd> попередній елемент</span>');
  return;
 }

 if(task===5){
  if(!refs.draft){beginTask6();return}
  const dloc=loc(refs.draft);
  if(dloc.where==='trash'){
   if(deleteKeyUsed){beginTask6();return}
   recoveryFor(refs.draft,'Тренувальний файл');return;
  }
  if(dloc.where==='missing'){recoveryFor(refs.draft,'Тренувальний файл');return}
  if(!guideToParent(refs.draft,'видалити його клавішею Delete'))return;
  markId(refs.draft);
  const name=objectName(refs.draft,'чернетка');
  if(selectedId()===refs.draft){
   guide(`t5-ready-${name}`,`Файл «${name}» вибрано. Натисніть Delete.`, '<span><kbd>DELETE</kbd> перемістити до Кошика</span>');
  }else{
   guide(`t5-select-${name}`,`Виберіть файл «${name}» стрілками або мишкою. Коли він буде виділений, натисніть Delete.`, '<span><kbd>↑</kbd><kbd>↓</kbd> вибрати · <kbd>DELETE</kbd></span>');
  }
  return;
 }

 if(task===6){
  if(!refs.original){beginTask7();return}
  if(!recoveryFor(refs.original,'Навчальний файл'))return;
  if(!guideToParent(refs.original,'скопіювати його'))return;
  markId(refs.original);
  const name=objectName(refs.original,'навчальний файл');
  if(copyKeyUsed){beginTask7();return}
  if(selectedId()===refs.original){
   guide(`t6-ready-${name}`,`Файл «${name}» вибрано. Затисніть Ctrl і натисніть C.`, '<span><kbd>CTRL</kbd> + <kbd>C</kbd> копіювати</span>');
  }else{
   guide(`t6-select-${name}`,`Виберіть «${name}». Назва могла змінитися — система відстежує сам файл, а не його текстову назву.`, '<span><kbd>↑</kbd><kbd>↓</kbd> або миша · вибрати файл</span>');
  }
  return;
 }

 if(task===7){
  if(!recoveryFor(refs.original,'Навчальний файл'))return;
  const copy=discoverCopy();
  if(copy){beginTask8();return}
  if(!ensureFolderInside())return;
  guide('t7',`Копія збережена в буфері VIDLIK. Натисніть Ctrl+V. Якщо ви перед цим перейшли в іншу папку — копія буде вставлена саме туди, і система це врахує.`, '<span><kbd>CTRL</kbd> + <kbd>V</kbd> вставити</span>');
  return;
 }

 if(task===8){
  const copy=discoverCopy();if(!copy){guide('t8-no-copy','Копію поки не знайдено. Поверніться до попереднього файлу, скопіюйте його Ctrl+C і вставте Ctrl+V.','<span><kbd>CTRL+C</kbd> · <kbd>CTRL+V</kbd></span>');return}
  if(!recoveryFor(copy,'Створена копія'))return;
  const hit=loc(copy);const name=hit.node?.name||'копія';
  if(hit.where==='tree'&&hit.parent?.id===refs.docs){beginTask9();return}
  if(!cutKeyUsed){
   if(!guideToParent(copy,'вирізати його для переміщення'))return;
   markId(copy);
   if(selectedId()===copy){
    guide(`t8-cut-ready-${name}`,`Файл «${name}» вибрано. Натисніть Ctrl+X. Він стане напівпрозорим і чекатиме на нове місце.`, '<span><kbd>CTRL</kbd> + <kbd>X</kbd> вирізати</span>');
   }else{
    guide(`t8-cut-select-${name}`,`Знайдіть поточну копію «${name}» і виберіть її. Після цього натисніть Ctrl+X.`, '<span><kbd>↑</kbd><kbd>↓</kbd> або миша · вибрати копію</span>');
   }
   return;
  }
  const cur=explorer();
  if(cur.folder?.id!==refs.docs){
   const docsName=objectName(refs.docs,'Документи');
   guide(`t8-go-docs-${cur.folder?.id||'none'}`,`Файл вирізано. Тепер перейдіть до папки «${docsName}» будь-яким способом: кнопкою ←, лівою панеллю, Tab/Enter або мишкою. Потім натисніть Ctrl+V.`, '<span><kbd>ДОКУМЕНТИ</kbd> перейти · <kbd>CTRL+V</kbd> вставити</span>');
   return;
  }
  guide('t8-paste-docs',`Ми в «${objectName(refs.docs,'Документи')}». Натисніть Ctrl+V, щоб завершити переміщення.`, '<span><kbd>CTRL</kbd> + <kbd>V</kbd> завершити переміщення</span>');
  return;
 }

 if(task===9){
  if(!recoveryFor(refs.copy,'Переміщений файл'))return;
  const hit=loc(refs.copy);
  if(ctrlZUsed&&hit.where==='tree'&&moveOriginParentId&&hit.parent?.id===moveOriginParentId){beginTask10();return}
  const name=hit.node?.name||'файл';
  guide(`t9-${hit.parent?.id||'none'}-${ctrlZUsed}`,`Уявімо, що переміщення «${name}» було помилкою. Натисніть Ctrl+Z. Якщо після першого натискання файл ще не повернувся у попередню папку, повторіть Ctrl+Z — система перевірить результат.`, '<span><kbd>CTRL</kbd> + <kbd>Z</kbd> скасувати останню дію</span>');
  return;
 }

 if(task===10){
  const cur=explorer();
  if(!cur.open||cur.trashMode){guide('t10-nav','Перейдіть у будь-яку звичайну папку, де є щонайменше два об’єкти. Там виконаємо наступну вправу.','<span><kbd>ПРОВІДНИК</kbd> відкрити папку</span>');return}
  const rows=allRows();
  if(rows.length<2){guide(`t10-more-${cur.folder?.id}`,`У цій папці замало об’єктів. Перейдіть до «Документів» або іншої папки з кількома файлами.`, '<span><kbd>ДОКУМЕНТИ</kbd> папка з кількома об’єктами</span>');return}
  const selected=document.querySelectorAll('.os-window[data-window-id="explorer"] .os-file-item.selected').length;
  if(selectAllUsed&&selected===rows.length){beginTask11();return}
  guide(`t10-${cur.folder?.id}-${selected}`,`Натисніть Ctrl+A, щоб одним рухом вибрати всі ${rows.length} об’єктів у цій папці.`, '<span><kbd>CTRL</kbd> + <kbd>A</kbd> виділити все</span>');
  return;
 }

 if(task===11){
  if(!refs.reports){finish();return}
  if(!recoveryFor(refs.reports,'Папка для пошуку'))return;
  const target=loc(refs.reports);const parent=target.parent;const cur=explorer();const targetName=target.node?.name||'Звіти';
  if(!cur.open||cur.trashMode||cur.folder?.id!==parent?.id){
   guide(`t11-nav-${cur.folder?.id||'none'}-${parent?.id}`,`Для пошуку потрібна папка «${pathText(target)}». Перейдіть туди. Папка, яку будемо шукати, зараз називається «${targetName}».`, '<span><kbd>ПРОВІДНИК</kbd> перейти до папки пошуку</span>');
   return;
  }
  const input=searchInput();
  if(!searchKeyUsed||!input){
   guide(`t11-ctrl-f-${targetName}`,`Натисніть Ctrl+F. Це відкриє поле пошуку в поточній папці.`, '<span><kbd>CTRL</kbd> + <kbd>F</kbd> пошук</span>');
   return;
  }
  input.classList.add('vidlik-tutorial-ui-target','os-inline-keyboard-search');
  const visible=A()?.rowById(refs.reports);
  if(visible&&input.value.trim()){
   finish();return;
  }
  guide(`t11-type-${targetName}`,`Поле пошуку активне. Введіть поточну назву «${targetName}» і натисніть Enter. Якщо ви раніше перейменували папку, використовуйте саме нову назву.`, `<span><kbd>ТЕКСТ</kbd> ${targetName} · <kbd>ENTER</kbd></span>`);
 }
}

function finish(){
 active=false;task=12;phase='complete';clearVisuals();lastGuide='';
 adminMessage('Готово. Ви керували файлами з клавіатури й при цьому могли вільно рухатися по системі. Сисадмін відстежував не назви, а фактичний стан об’єктів.');
 setFooter('11 / 11 · РОБОТА З КЛАВІАТУРОЮ · ЗАВЕРШЕНО ✓');
 setHelp('<span><kbd>ГОТОВО</kbd> розділ «Робота з клавіатурою» завершено</span>');
 setTimeout(()=>window.dispatchEvent(new CustomEvent('vidlik:keyboard-section-complete')),450);
}

function start(){
 if(active)return;
 active=true;task=0;phase='starting';lastGuide='';clearVisuals();
 OS()?.openDesktopApp?.('docs');
 setTimeout(()=>{
  if(!active)return;
  if(!findInitialRefs()){
   guide('init-missing','Не вдалося одразу визначити навчальну папку. Відкрийте «Документи» — система повторно просканує структуру.','<span><kbd>ДОКУМЕНТИ</kbd> відкрити папку</span>');
   const retry=setInterval(()=>{if(!active){clearInterval(retry);return}if(findInitialRefs()){clearInterval(retry);beginTask1()}},350);
  }else beginTask1();
 },180);
}
function reset(){active=false;task=0;phase='idle';lastGuide='';clearTimeout(reconcileTimer);clearVisuals();refs={docs:null,folder:null,original:null,draft:null,copy:null,reports:null}}

window.addEventListener('keydown',e=>{
 if(!active)return;

 if(task===1&&(e.key==='ArrowUp'||e.key==='ArrowDown')){arrowUsed=true;schedule(0);return}

 if(task===2&&e.key==='Enter'){
  if(selectedId()===refs.folder){enterUsed=true;schedule(45);return}
 }

 if(task===3&&e.key==='Tab'&&!e.shiftKey&&ensureFolderInside()){
  stop(e);tabCount+=1;setKeyboardFocus(focusIndex<0?0:Math.min(focusIndex+1,keyboardFocusables().length-1));schedule(0);return;
 }

 if(task===4&&e.key==='Tab'&&e.shiftKey&&ensureFolderInside()){
  stop(e);shiftTabUsed=true;setKeyboardFocus(Math.max(0,focusIndex-1));schedule(0);return;
 }

 if(task===5&&e.key==='Delete'&&selectedId()===refs.draft){deleteKeyUsed=true;schedule(80);return}

 if(task===6&&isCtrl(e,'c')&&selectedId()===refs.original){copyKeyUsed=true;schedule(45);return}

 if(task===7&&isCtrl(e,'v')){pasteKeyUsed=true;schedule(95);return}

 if(task===8&&refs.copy){
  if(isCtrl(e,'x')&&selectedId()===refs.copy){cutKeyUsed=true;moveOriginParentId=parentId(refs.copy);schedule(55);return}
  if(isCtrl(e,'v')&&cutKeyUsed){pasteKeyUsed=true;schedule(110);return}
 }

 if(task===9&&isCtrl(e,'z')){ctrlZUsed=true;schedule(120);return}
 if(task===10&&isCtrl(e,'a')){selectAllUsed=true;schedule(60);return}
 if(task===11&&isCtrl(e,'f')){searchKeyUsed=true;schedule(70);return}
 if(task===11&&searchKeyUsed&&e.key==='Enter'){schedule(110);return}

 if((e.key==='Enter')&&document.querySelector('.os-keyboard-focus')){
  const el=document.querySelector('.os-keyboard-focus');if(el){stop(e);el.click();schedule(40);return}
 }

 schedule(25);
},true);

mon.addEventListener('pointerup',()=>schedule(35),true);
mon.addEventListener('contextmenu',()=>schedule(35),true);
A()?.subscribe?.(()=>{if(active)schedule(20)});
window.addEventListener('vidlik:section3-ready',start);
window.addEventListener('vidlik:os-reset',reset);

window.VIDLIK_KEYBOARD_TUTORIAL={
 start,reset,reconcile,
 get task(){return task},get phase(){return phase},get active(){return active},
 get refs(){return{...refs}}
};
})();
