(()=>{
'use strict';

const mon=document.querySelector('.monitor-screen');
const chat=document.getElementById('adminChat');
const footer=document.getElementById('adminFooter');
const help=document.getElementById('help');
if(!mon||!chat||!footer)return;

const TRAINING='TRAINING_SYNC_SECTOR_3.xlsx';
const FOLDER='Сектор 3';
const RENAMED='Знайомство.xlsx';
const DRAFT='чернетка.txt';

let active=false;
let task=0;
let phase='idle';
let helperLock=false;
let currentTarget=null;

function explorer(){return document.querySelector('.os-window[data-window-id="explorer"]')}
function address(){return explorer()?.querySelector('.os-address')?.textContent.trim()||''}
function row(name){
 return [...(explorer()?.querySelectorAll('.os-file-item')||[])].find(x=>x.querySelector('.os-file-name b')?.textContent.trim()===name)||null;
}
function nav(name){return explorer()?.querySelector(`[data-nav="${name}"]`)||null}
function act(name){return explorer()?.querySelector(`[data-act="${name}"]`)||null}
function pane(){return explorer()?.querySelector('.os-file-pane')||null}
function menu(name){return document.querySelector(`.os-context-menu:not([hidden]) [data-menu="${name}"]`)||null}
function inlineInput(){return explorer()?.querySelector('.os-inline-input')||null}
function dialogOk(){return document.querySelector('.os-dialog-wrap [data-dlg]')||null}

function nowTime(){
 return new Date().toLocaleTimeString('uk-UA',{hour:'2-digit',minute:'2-digit',hour12:false});
}
function scrollLatest(rowEl){
 requestAnimationFrame(()=>requestAnimationFrame(()=>{
  const top=Math.max(0,chat.scrollHeight-chat.clientHeight);
  if(typeof chat.scrollTo==='function')chat.scrollTo({top,behavior:'smooth'});
  else chat.scrollTop=top;
  rowEl?.setAttribute('data-visible-latest','true');
 }));
}
function adminMessage(text){
 const r=document.createElement('div');
 r.className='admin-message vidlik-tutorial-message';
 const bubble=document.createElement('div');
 bubble.className='admin-bubble';
 const head=document.createElement('div');
 head.className='admin-bubble-head';
 const name=document.createElement('span');
 name.className='admin-bubble-name';
 name.textContent='СИСТЕМНИЙ АДМІНІСТРАТОР';
 const time=document.createElement('span');
 time.className='admin-bubble-time';
 time.textContent=nowTime();
 const p=document.createElement('p');
 p.textContent=text;
 p.style.whiteSpace='pre-line';
 head.append(name,time);bubble.append(head,p);r.append(bubble);chat.appendChild(r);scrollLatest(r);
}
function setFooter(text){footer.textContent=text;footer.classList.add('vidlik-tutorial-footer')}
function setHelp(html){if(help){help.classList.add('vidlik-tutorial-help');help.innerHTML=html}}
function clearTarget(){
 document.querySelectorAll('.vidlik-tutorial-ui-target,.vidlik-files-tutorial-target').forEach(x=>x.classList.remove('vidlik-tutorial-ui-target','vidlik-files-tutorial-target'));
 currentTarget=null;
}
function target(el){clearTarget();if(!el)return;currentTarget=el;el.classList.add('vidlik-tutorial-ui-target','vidlik-files-tutorial-target')}
function helper(text){if(helperLock)return;helperLock=true;adminMessage(text);setTimeout(()=>helperLock=false,1200)}
function stop(e){e.preventDefault();e.stopPropagation();e.stopImmediatePropagation()}
function later(fn,ms=70){setTimeout(()=>{if(active)fn()},ms)}

function fs(){return window.VIDLIK_OS?.getFileSystem?.()||null}
function findFolder(n,name){
 if(!n)return null;
 if(n.type==='folder'&&n.name===name)return n;
 for(const x of n.children||[]){const q=findFolder(x,name);if(q)return q}
 return null;
}
function docsFs(){return findFolder(fs(),'Документи')}
function sectorFs(){return findFolder(docsFs(),FOLDER)}
function hasChild(folder,name){return !!folder?.children?.some(x=>x.name===name)}

function taskLabel(n,text){setFooter(`ЗАВДАННЯ ${n} / 11 · ${text}`)}

function beginTask1(){
 task=1;phase='docs-nav';
 target(nav('docs'));
 adminMessage('Розділ 2 починаємо з папки «Документи».\nЛіворуч у Провіднику є панель швидкої навігації. Натисніть «Документи» один раз.');
 taskLabel(1,'ВІДКРИЙТЕ «ДОКУМЕНТИ»');
 setHelp('<span><kbd>ЛКМ</kbd> «Документи» у лівій панелі</span>');
}
function beginTask2(){
 task=2;phase='select-training';
 target(row(TRAINING));
 adminMessage('Перед вами папки та файли. Папка зберігає об’єкти, а файл містить інформацію.\nЗнайдіть TRAINING_SYNC_SECTOR_3.xlsx і виберіть його одним кліком.');
 taskLabel(2,'ВИБЕРІТЬ НАВЧАЛЬНИЙ ФАЙЛ');
 setHelp('<span><kbd>ЛКМ</kbd> один клік · вибрати файл</span>');
}
function beginTask3(){
 task=3;phase='new-folder';
 target(act('new'));
 adminMessage('Тепер створимо місце для матеріалів цього сектора.\nНатисніть кнопку ＋ у верхній частині Провідника.');
 taskLabel(3,'СТВОРІТЬ ПАПКУ «СЕКТОР 3»');
 setHelp('<span><kbd>＋</kbd> створити нову папку</span>');
}
function waitFolderName(){
 phase='folder-name';
 const i=inlineInput();target(i);
 adminMessage('Нова папка створена. Її назву вже виділено.\nВведіть «Сектор 3» і натисніть Enter.');
 setHelp('<span><kbd>ТЕКСТ</kbd> Сектор 3 · <kbd>ENTER</kbd> підтвердити</span>');
}
function beginTask4(){
 task=4;phase='folder-open';
 target(row(FOLDER));
 adminMessage('Папка готова. Відкрийте «Сектор 3» подвійним кліком.\nПісля цього ми одразу перевіримо, як повернутися назад.');
 taskLabel(4,'ВІДКРИЙТЕ ПАПКУ Й ПОВЕРНІТЬСЯ НАЗАД');
 setHelp('<span><kbd>ЛКМ ×2</kbd> відкрити «Сектор 3»</span>');
}
function task4Back(){
 phase='folder-back';target(act('back'));
 adminMessage('Папка поки порожня. Натисніть ←, щоб повернутися до «Документів».');
 setHelp('<span><kbd>←</kbd> повернутися назад</span>');
}
function beginTask5(){
 task=5;phase='prop-context';target(row(TRAINING));
 adminMessage('Подивимось, що система знає про файл.\nНатисніть TRAINING_SYNC_SECTOR_3.xlsx правою кнопкою миші.');
 taskLabel(5,'ПЕРЕВІРТЕ ВЛАСТИВОСТІ ФАЙЛУ');
 setHelp('<span><kbd>ПКМ</kbd> відкрити додаткові дії</span>');
}
function task5Menu(){phase='prop-menu';target(menu('prop'));adminMessage('Відкрилося меню додаткових дій. Натисніть «Властивості».');setHelp('<span><kbd>ЛКМ</kbd> Властивості</span>')}
function task5Dialog(){
 phase='prop-ok';target(dialogOk());
 adminMessage('Тут видно ім’я, тип і розташування об’єкта. Розширення .xlsx означає файл Microsoft Excel.\nОзнайомтесь і натисніть OK.');
 setHelp('<span><kbd>OK</kbd> закрити властивості</span>');
}
function beginTask6(){
 task=6;phase='copy-context';target(row(TRAINING));
 adminMessage('Зробимо копію навчального файлу.\nНатисніть його правою кнопкою миші.');
 taskLabel(6,'СКОПІЮЙТЕ ФАЙЛ');setHelp('<span><kbd>ПКМ</kbd> TRAINING_SYNC_SECTOR_3.xlsx</span>');
}
function task6Menu(){phase='copy-menu';target(menu('copy'));adminMessage('Натисніть «Копіювати». Оригінал залишиться на місці, а копія потрапить у буфер VIDLIK.');setHelp('<span><kbd>ЛКМ</kbd> Копіювати</span>')}
function beginTask7(){
 task=7;phase='paste-open';target(row(FOLDER));
 adminMessage('Тепер вставимо копію в нашу папку.\nВідкрийте «Сектор 3» подвійним кліком.');
 taskLabel(7,'ВСТАВТЕ КОПІЮ В «СЕКТОР 3»');setHelp('<span><kbd>ЛКМ ×2</kbd> відкрити «Сектор 3»</span>');
}
function task7Context(){phase='paste-context';target(pane());adminMessage('У папці натисніть правою кнопкою миші по порожньому місцю.');setHelp('<span><kbd>ПКМ</kbd> порожнє місце в папці</span>')}
function task7Menu(){phase='paste-menu';target(menu('paste'));adminMessage('Натисніть «Вставити».');setHelp('<span><kbd>ЛКМ</kbd> Вставити</span>')}
function beginTask8(){
 task=8;phase='rename-context';target(row(TRAINING));
 adminMessage('Копія вже в папці. Тепер дамо їй зрозумілу назву.\nНатисніть файл правою кнопкою миші.');
 taskLabel(8,'ПЕРЕЙМЕНУЙТЕ КОПІЮ');setHelp('<span><kbd>ПКМ</kbd> навчальний файл</span>');
}
function task8Menu(){phase='rename-menu';target(menu('rename'));adminMessage('Оберіть «Перейменувати».');setHelp('<span><kbd>ЛКМ</kbd> Перейменувати</span>')}
function task8Input(){phase='rename-input';target(inlineInput());adminMessage('Введіть нову назву: «Знайомство.xlsx» і натисніть Enter.');setHelp('<span><kbd>ТЕКСТ</kbd> Знайомство.xlsx · <kbd>ENTER</kbd></span>')}
function beginTask9(){
 task=9;phase='move-back';target(act('back'));
 adminMessage('Тепер навчимося не копіювати, а переміщувати об’єкти.\nСпочатку поверніться до «Документів» кнопкою ←.');
 taskLabel(9,'ПЕРЕМІСТІТЬ «ЧЕРНЕТКА.TXT»');setHelp('<span><kbd>←</kbd> до «Документів»</span>');
}
function task9Draft(){phase='move-draft-context';target(row(DRAFT));adminMessage('Знайдіть «чернетка.txt» і натисніть її правою кнопкою миші.');setHelp('<span><kbd>ПКМ</kbd> чернетка.txt</span>')}
function task9Cut(){phase='move-cut-menu';target(menu('cut'));adminMessage('Оберіть «Вирізати». На відміну від копіювання, після вставлення файл змінить своє місце.');setHelp('<span><kbd>ЛКМ</kbd> Вирізати</span>')}
function task9OpenFolder(){phase='move-open-folder';target(row(FOLDER));adminMessage('Відкрийте папку «Сектор 3».');setHelp('<span><kbd>ЛКМ ×2</kbd> «Сектор 3»</span>')}
function task9PasteContext(){phase='move-paste-context';target(pane());adminMessage('Натисніть правою кнопкою по порожньому місцю.');setHelp('<span><kbd>ПКМ</kbd> порожнє місце</span>')}
function task9PasteMenu(){phase='move-paste-menu';target(menu('paste'));adminMessage('Натисніть «Вставити».');setHelp('<span><kbd>ЛКМ</kbd> Вставити</span>')}
function beginTask10(){
 task=10;phase='delete-context';target(row(DRAFT));
 adminMessage('Чернетка більше не потрібна. Видалимо її.\nНатисніть «чернетка.txt» правою кнопкою миші.');
 taskLabel(10,'ВИДАЛІТЬ ФАЙЛ');setHelp('<span><kbd>ПКМ</kbd> чернетка.txt</span>');
}
function task10Menu(){phase='delete-menu';target(menu('delete'));adminMessage('Натисніть «Видалити». Файл буде переміщено до Кошика, а не знищено остаточно.');setHelp('<span><kbd>ЛКМ</kbd> Видалити</span>')}
function beginTask11(){
 task=11;phase='trash-nav';target(nav('trash'));
 adminMessage('Перевіримо, куди потрапив файл.\nНатисніть «Кошик» у лівій панелі Провідника.');
 taskLabel(11,'ВІДНОВІТЬ ФАЙЛ ІЗ КОШИКА');setHelp('<span><kbd>ЛКМ</kbd> Кошик</span>');
}
function task11File(){phase='trash-file-context';target(row(DRAFT));adminMessage('Ось видалена чернетка. Натисніть її правою кнопкою миші.');setHelp('<span><kbd>ПКМ</kbd> чернетка.txt</span>')}
function task11Menu(){phase='trash-restore-menu';target(menu('restore'));adminMessage('Натисніть «Відновити». Файл повернеться туди, звідки його було видалено.');setHelp('<span><kbd>ЛКМ</kbd> Відновити</span>')}

function finish(){
 active=false;task=12;phase='complete';clearTarget();
 adminMessage('Готово. Ви створили папку, перевірили властивості файлу, зробили копію, перейменували й перемістили об’єкти, а також відновили файл із Кошика.');
 setFooter('11 / 11 · ФАЙЛИ ТА ПАПКИ · ЗАВЕРШЕНО ✓');
 setHelp('<span><kbd>ГОТОВО</kbd> розділ «Файли та папки» завершено</span>');
 setTimeout(()=>window.dispatchEvent(new CustomEvent('vidlik:files-section-complete')),450);
}

function start(){
 if(active)return;
 active=true;task=0;phase='starting';
 window.VIDLIK_OS?.openDesktopApp?.('pc');
 later(beginTask1,180);
}
function reset(){active=false;task=0;phase='idle';helperLock=false;clearTarget()}

mon.addEventListener('click',e=>{
 if(!active)return;
 const exp=explorer();
 if(!exp)return;

 const wrong=msg=>{stop(e);helper(msg)};

 if(phase==='docs-nav'){
  const x=e.target.closest('[data-nav="docs"]');if(!x)return wrong('Зараз натисніть «Документи» у лівій панелі.');
  later(()=>{if(address().includes('Документи'))beginTask2()});return;
 }
 if(phase==='select-training'){
  const x=e.target.closest('.os-file-item');if(x!==row(TRAINING))return wrong('Потрібен файл TRAINING_SYNC_SECTOR_3.xlsx.');
  if(e.detail===1)later(beginTask3,55);return;
 }
 if(phase==='new-folder'){
  const x=e.target.closest('[data-act="new"]');if(!x)return wrong('Натисніть підсвічену кнопку ＋.');
  later(waitFolderName,60);return;
 }
 if(phase==='folder-open'){
  const x=e.target.closest('.os-file-item');if(x!==row(FOLDER))return wrong('Відкрийте папку «Сектор 3».');
  if(e.detail===2)later(()=>{if(address().includes(FOLDER))task4Back()},90);return;
 }
 if(phase==='folder-back'){
  const x=e.target.closest('[data-act="back"]');if(!x)return wrong('Натисніть стрілку ← у верхній частині Провідника.');
  later(()=>{if(address().endsWith('Документи'))beginTask5()},80);return;
 }
 if(phase==='prop-menu'){
  const x=e.target.closest('[data-menu="prop"]');if(!x)return wrong('У меню натисніть «Властивості».');
  later(task5Dialog,70);return;
 }
 if(phase==='prop-ok'){
  const x=e.target.closest('[data-dlg]');if(!x)return wrong('Закрийте вікно властивостей кнопкою OK.');
  later(beginTask6,60);return;
 }
 if(phase==='copy-menu'){
  const x=e.target.closest('[data-menu="copy"]');if(!x)return wrong('Натисніть «Копіювати».');
  later(beginTask7,70);return;
 }
 if(phase==='paste-open'){
  const x=e.target.closest('.os-file-item');if(x!==row(FOLDER))return wrong('Відкрийте папку «Сектор 3».');
  if(e.detail===2)later(()=>{if(address().includes(FOLDER))task7Context()},90);return;
 }
 if(phase==='paste-menu'){
  const x=e.target.closest('[data-menu="paste"]');if(!x)return wrong('Натисніть «Вставити».');
  later(()=>{if(row(TRAINING))beginTask8()},90);return;
 }
 if(phase==='rename-menu'){
  const x=e.target.closest('[data-menu="rename"]');if(!x)return wrong('Натисніть «Перейменувати».');
  later(task8Input,60);return;
 }
 if(phase==='move-back'){
  const x=e.target.closest('[data-act="back"]');if(!x)return wrong('Поверніться до «Документів» кнопкою ←.');
  later(()=>{if(address().endsWith('Документи'))task9Draft()},80);return;
 }
 if(phase==='move-cut-menu'){
  const x=e.target.closest('[data-menu="cut"]');if(!x)return wrong('Натисніть «Вирізати».');
  later(task9OpenFolder,70);return;
 }
 if(phase==='move-open-folder'){
  const x=e.target.closest('.os-file-item');if(x!==row(FOLDER))return wrong('Відкрийте папку «Сектор 3».');
  if(e.detail===2)later(()=>{if(address().includes(FOLDER))task9PasteContext()},90);return;
 }
 if(phase==='move-paste-menu'){
  const x=e.target.closest('[data-menu="paste"]');if(!x)return wrong('Натисніть «Вставити».');
  later(()=>{if(row(DRAFT))beginTask10()},90);return;
 }
 if(phase==='delete-menu'){
  const x=e.target.closest('[data-menu="delete"]');if(!x)return wrong('Натисніть «Видалити».');
  later(()=>{if(!row(DRAFT))beginTask11()},90);return;
 }
 if(phase==='trash-nav'){
  const x=e.target.closest('[data-nav="trash"]');if(!x)return wrong('Натисніть «Кошик» у лівій панелі.');
  later(()=>{if(address()==='Кошик')task11File()},90);return;
 }
 if(phase==='trash-restore-menu'){
  const x=e.target.closest('[data-menu="restore"]');if(!x)return wrong('Натисніть «Відновити».');
  later(()=>{
   const s=sectorFs();
   if(s&&hasChild(s,DRAFT))finish();
  },110);return;
 }

 if(['folder-name','rename-input'].includes(phase))return;
 if(['prop-context','copy-context','paste-context','rename-context','move-draft-context','move-paste-context','delete-context','trash-file-context'].includes(phase))return;
 },true);

mon.addEventListener('contextmenu',e=>{
 if(!active)return;
 const file=e.target.closest('.os-file-item');
 const empty=e.target.closest('.os-file-pane')&&!file;

 const acceptFile=(name,next,msg)=>{
  if(file!==row(name)){stop(e);helper(msg);return}
  later(next,60);
 };

 if(phase==='prop-context')return acceptFile(TRAINING,task5Menu,'Натисніть правою кнопкою саме TRAINING_SYNC_SECTOR_3.xlsx.');
 if(phase==='copy-context')return acceptFile(TRAINING,task6Menu,'Натисніть правою кнопкою саме навчальний файл.');
 if(phase==='rename-context')return acceptFile(TRAINING,task8Menu,'Натисніть правою кнопкою файл у папці «Сектор 3».');
 if(phase==='move-draft-context')return acceptFile(DRAFT,task9Cut,'Натисніть правою кнопкою «чернетка.txt».');
 if(phase==='delete-context')return acceptFile(DRAFT,task10Menu,'Натисніть правою кнопкою «чернетка.txt».');
 if(phase==='trash-file-context')return acceptFile(DRAFT,task11Menu,'Натисніть правою кнопкою видалену «чернетка.txt».');
 if(phase==='paste-context'){
  if(!empty){stop(e);helper('Натисніть правою кнопкою по порожньому місцю в папці.');return}
  later(task7Menu,60);return;
 }
 if(phase==='move-paste-context'){
  if(!empty){stop(e);helper('Натисніть правою кнопкою по порожньому місцю.');return}
  later(task9PasteMenu,60);return;
 }
 stop(e);
},true);

window.addEventListener('keydown',e=>{
 if(!active)return;
 if(phase==='folder-name'||phase==='rename-input'){
  if(e.key==='Enter'){
   const p=phase;
   setTimeout(()=>{
    if(!active)return;
    if(p==='folder-name'&&hasChild(docsFs(),FOLDER))beginTask4();
    if(p==='rename-input'&&hasChild(sectorFs(),RENAMED))beginTask9();
   },90);
  }
  return;
 }
 stop(e);
 helper('У цьому розділі основні дії виконуємо мишкою. Клавіатура знадобиться лише для введення назв.');
},true);

window.addEventListener('vidlik:section2-ready',start);
window.addEventListener('vidlik:os-reset',reset);
window.VIDLIK_FILES_TUTORIAL={start,reset,get task(){return task},get phase(){return phase},get active(){return active}};
})();
