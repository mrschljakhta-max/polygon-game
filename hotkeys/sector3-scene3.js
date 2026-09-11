(()=>{
'use strict';

const params=new URLSearchParams(location.search);
if((parseInt(params.get('storyScene')||'0',10)||0)!==1)return;
if(window.VIDLIK_SCENE3)return;

let phase='waiting';
let armed=false;
let officialWin=null;
let officialTaskBtn=null;
let activeBook='original';
let formula='';
let formulaLine=-1;
const EXPECTED='=COUNTIF(A2:A269;A17)';
const FORMULA_LINES=[
  'Ось воно.',
  'Номер Данила не створювали окремо.',
  'Його вставили поверх існуючого запису.'
];

const scene=document.getElementById('scene');
const chat=document.getElementById('adminChat');
const header=document.querySelector('.admin-header');
const help=document.getElementById('help');
if(!scene||!chat||!header||!help)return;

function now(){return new Date().toLocaleTimeString('uk-UA',{hour:'2-digit',minute:'2-digit',hour12:false})}
function setHint(html){help.innerHTML=html}
function originalWin(){return [...document.querySelectorAll('.s3-direct-window')].find(w=>!w.classList.contains('s3-official-window'))||null}
function taskbarHost(){return document.getElementById('osRunningApps')}
function formulaBar(win){return win?.querySelector('.excel-formula-value')}
function nameBox(win){return win?.querySelector('.excel-name-box')}
function grid(win){return win?.querySelector('.excel-grid-body')}

const style=document.createElement('style');
style.id='s3-scene3-official-style';
style.textContent=`
.s3-scene3-title{position:absolute;inset:0;z-index:790;background:rgba(2,6,9,.92);opacity:0;pointer-events:none;transition:opacity .55s ease;overflow:hidden;color:#f6f5f3}
.s3-scene3-title.show{opacity:1;pointer-events:auto}
.s3-scene3-title:before{content:'';position:absolute;left:10.5%;right:8%;top:33%;height:1px;background:linear-gradient(90deg,#e82d43 0 21%,rgba(232,45,67,.26) 52%,transparent)}
.s3-scene3-title:after{content:'';position:absolute;left:10.5%;width:4px;height:4px;border-radius:50%;top:calc(33% - 2px);background:#ff3c54;box-shadow:0 0 16px rgba(255,60,84,.9)}
.s3-scene3-title-inner{position:absolute;left:10.5%;top:37%;width:min(620px,55vw)}
.s3-scene3-title-kicker{font:700 11px/1 ui-monospace,SFMono-Regular,Consolas,monospace;letter-spacing:.3em;color:#ff5267;margin-bottom:18px}
.s3-scene3-title h2{margin:0;font:800 clamp(38px,5.2vw,78px)/.95 system-ui,sans-serif;letter-spacing:.02em;text-transform:uppercase}
.s3-scene3-title h2 b{color:#ff4058;font-weight:800}
.s3-scene3-title p{margin:18px 0 0;color:rgba(236,236,232,.6);font:650 14px/1.5 system-ui,sans-serif;letter-spacing:.08em;text-transform:uppercase}
.s3-scene3-title-enter{margin-top:29px;color:#f2f0ed;font:800 12px/1 ui-monospace,SFMono-Regular,Consolas,monospace;letter-spacing:.08em}.s3-scene3-title-enter span{color:#ff4058;margin-right:7px}
.s3-official-window{transform:translate(2.3%,2.1%)!important;z-index:151!important;box-shadow:0 18px 48px rgba(0,0,0,.38)!important}
.s3-official-window.s3-book-inactive{z-index:92!important;filter:brightness(.78) saturate(.72)}
.s3-book-inactive{z-index:92!important;filter:brightness(.78) saturate(.72)}
.s3-book-active{z-index:154!important;filter:none!important}
.s3-scene3-count-badge{position:absolute;right:14px;top:109px;z-index:30;padding:6px 9px;border:1px solid #9bb8ac;border-radius:4px;background:#eef6f2;color:#155d49;font:800 9px/1.2 ui-monospace,SFMono-Regular,Consolas,monospace;letter-spacing:.05em;box-shadow:0 5px 14px rgba(0,0,0,.12)}
.s3-official-window .s3-scene3-count-badge{background:#f3f4f3;color:#4a5752;border-color:#bdc7c2}
.s3-scene3-search{position:absolute;right:18px;top:72px;z-index:55;min-width:255px;padding:9px 11px;background:#fff;border:1px solid #aabbb4;border-radius:6px;box-shadow:0 10px 30px rgba(0,0,0,.23);font:600 11px/1.25 system-ui,sans-serif;color:#23342f}
.s3-scene3-search strong{display:inline-block;margin-left:9px;color:#174c3d}.s3-scene3-search em{float:right;color:#6c7773;font-style:normal}.s3-scene3-search.not-found{border-color:#cf8791;background:#fff7f8}.s3-scene3-search.not-found strong{color:#9e1f31}.s3-scene3-search.not-found em{color:#b02e40;font-weight:800}
.s3-scene3-formula-row .excel-cell{background:#f3f7f5!important;border-top-color:#a8c1b7!important;font-weight:700}.s3-scene3-formula-row [data-cell="E22"].is-selected{outline:2px solid #1f9b72!important;outline-offset:-2px!important;background:#fff!important}.s3-scene3-formula-row.s3-done [data-cell="E22"]{background:#dff4e9!important;color:#0b684b!important;font-size:13px!important;font-weight:900!important}
.admin-header.s3-system-channel .admin-header-name{color:#65d9d0!important;text-transform:none!important}.admin-header.s3-system-channel .admin-online{color:#77bdb8!important}.admin-header.s3-system-channel .admin-online i{background:#5bd5ca!important;box-shadow:0 0 7px rgba(91,213,202,.65)!important}
.admin-header.s3-maxym-channel .admin-header-name{color:#e7b76c!important;text-transform:none!important}.admin-header.s3-maxym-channel .admin-online{color:#cda86f!important}.admin-header.s3-maxym-channel .admin-online i{background:#e3ad58!important;box-shadow:0 0 7px rgba(227,173,88,.6)!important}
.s3-system-message .admin-bubble{border-color:rgba(64,199,191,.62)!important;background:rgba(7,35,37,.92)!important}.s3-system-message .admin-bubble-name{color:#72e1d9!important}.s3-maxym-message .admin-bubble{border-color:rgba(222,165,78,.66)!important;background:rgba(42,29,10,.92)!important}.s3-maxym-message .admin-bubble-name{color:#efbd70!important}
`;
document.head.appendChild(style);

function setHeader(kind){
 header.classList.remove('excel-polya-channel','s3-system-channel','s3-maxym-channel');
 const name=header.querySelector('.admin-header-name');
 const online=header.querySelector('.admin-online span');
 if(kind==='polya'){
  header.classList.add('excel-polya-channel');if(name)name.textContent='Поля';if(online)online.textContent='захищений канал';
  setTimeout(()=>window.VIDLIK_POLYA_IDENTITY?.normalize?.(),0);
 }else if(kind==='system'){
  header.classList.add('s3-system-channel');header.removeAttribute('data-polya-identity');if(name)name.textContent='Системний адміністратор';if(online)online.textContent='службовий канал';
 }else{
  header.classList.add('s3-maxym-channel');header.removeAttribute('data-polya-identity');if(name)name.textContent='Максим';if(online)online.textContent='невідомий канал';
 }
}
function msg(text,kind='polya'){
 const row=document.createElement('div');
 row.className='admin-message vidlik-tutorial-message excel-story-message s3-scene3-message '+(kind==='polya'?'is-polya':kind==='system'?'s3-system-message':'s3-maxym-message');
 const who=kind==='polya'?'Поля':kind==='system'?'Системний адміністратор':'Максим';
 row.innerHTML='<div class="admin-bubble"><div class="admin-bubble-head"><span class="admin-bubble-name"></span><span class="admin-bubble-time">'+now()+'</span></div><p></p></div>';
 row.querySelector('.admin-bubble-name').textContent=who;row.querySelector('p').textContent=text;row.querySelector('p').style.whiteSpace='pre-line';
 chat.appendChild(row);requestAnimationFrame(()=>{chat.scrollTop=chat.scrollHeight});
}
function ensureTitle(){
 let o=scene.querySelector('.s3-scene3-title');if(o)return o;
 o=document.createElement('div');o.className='s3-scene3-title';
 o.innerHTML='<div class="s3-scene3-title-inner"><div class="s3-scene3-title-kicker">АКТ I · СЦЕНА 03</div><h2>«ОФІЦІЙНА <b>ВЕРСІЯ</b>»</h2><p>Дві версії. Один реєстр.</p><div class="s3-scene3-title-enter"><span>&gt;</span> продовжити</div></div>';
 scene.appendChild(o);return o;
}
function restoreRegister(win){
 if(!win)return;
 win.querySelectorAll('.s3-pattern-filter-menu,.s3-pattern-badge,.s3-direct-search,.s3-scene3-search').forEach(x=>x.remove());
 win.querySelectorAll('.s3-pattern-sheet-row').forEach(r=>r.style.display='none');
 win.querySelectorAll('.excel-row').forEach(r=>{
  if(r.classList.contains('s3-pattern-sheet-row'))return;
  if(r.dataset.s3PrevDisplay){r.style.display=r.dataset.s3PrevDisplay==='__empty__'?'':r.dataset.s3PrevDisplay;delete r.dataset.s3PrevDisplay}
 });
 win.querySelector('.s3-countif-row')?.style.setProperty('display','none');
 const bar=win.querySelector('.excel-sheetbar');bar?.querySelectorAll('button').forEach(b=>b.classList.toggle('is-active',b.textContent.trim()==='Реєстр'));
 win.querySelectorAll('.excel-cell.is-selected').forEach(c=>c.classList.remove('is-selected'));
}
function addCountBadge(win,text){
 let b=win.querySelector('.s3-scene3-count-badge');if(!b){b=document.createElement('div');b.className='s3-scene3-count-badge';win.querySelector('.excel-body')?.appendChild(b)}
 if(b)b.textContent=text;
}
function cleanOfficial(win){
 restoreRegister(win);
 win.querySelectorAll('.excel-row').forEach(r=>{if(/ДАНИЛО\s+ВЕРЕС/i.test(r.textContent||''))r.remove()});
 win.querySelectorAll('.s3-found-row,.s3-countif-row,.s3-scene3-formula-row').forEach(r=>r.remove());
 win.querySelector('.excel-titlebar strong').innerHTML='<span class="excel-app-mark">X</span> REGISTRY_SECTOR_3_OFFICIAL.xlsx — Microsoft Excel';
 const declared=win.querySelector('.excel-declared');if(declared)declared.textContent='ОФІЦІЙНО: 267';
 win.dataset.windowId='excel-official';win.classList.add('s3-official-window');
 addCountBadge(win,'ФАКТИЧНО: 267');
}
function bindOfficialControls(win){
 const min=win.querySelector('[data-direct-win="min"]'),max=win.querySelector('[data-direct-win="max"]'),close=win.querySelector('[data-direct-win="close"]');
 min?.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();win.style.display='none';officialTaskBtn?.classList.add('is-minimized')});
 max?.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();win.classList.toggle('s3-direct-maximized');max.textContent=win.classList.contains('s3-direct-maximized')?'❐':'□'});
 close?.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();win.style.display='none';officialTaskBtn?.classList.add('is-minimized')});
}
function ensureOfficialTask(){
 const host=taskbarHost();if(!host||officialTaskBtn?.isConnected)return;
 const b=document.createElement('button');b.className='os-running-button is-active';b.dataset.directStoryTask='excel-official';b.textContent='Excel · Official';b.title='REGISTRY_SECTOR_3_OFFICIAL.xlsx';
 b.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();if(!officialWin)return;officialWin.style.display='';activate('official')});host.appendChild(b);officialTaskBtn=b;
}
function buildOfficial(){
 const original=originalWin();if(!original)return null;
 restoreRegister(original);addCountBadge(original,'ФАКТИЧНО: 268');
 officialWin?.remove();officialWin=original.cloneNode(true);cleanOfficial(officialWin);original.parentElement?.appendChild(officialWin);bindOfficialControls(officialWin);ensureOfficialTask();activate('official');return officialWin;
}
function activate(book){
 const original=originalWin();if(!original||!officialWin)return;
 activeBook=book;
 original.classList.toggle('s3-book-active',book==='original');original.classList.toggle('s3-book-inactive',book!=='original');
 officialWin.classList.toggle('s3-book-active',book==='official');officialWin.classList.toggle('s3-book-inactive',book!=='official');
 const origBtn=taskbarHost()?.querySelector('[data-direct-story-task="excel-story"]');
 origBtn?.classList.toggle('is-active',book==='original');officialTaskBtn?.classList.toggle('is-active',book==='official');
}
function altTab(){activate(activeBook==='official'?'original':'official')}
function openOfficialSearch(){
 const body=officialWin?.querySelector('.excel-body');if(!body)return;
 let box=body.querySelector('.s3-scene3-search');if(box)box.remove();
 box=document.createElement('div');box.className='s3-scene3-search';box.innerHTML='<span>Знайти:</span><strong>ДАНИЛО ВЕРЕС</strong><em>Enter — знайти</em>';body.appendChild(box);
 phase='searchOpen';setHint('<span>Пошук: <b>ДАНИЛО ВЕРЕС</b></span><span><kbd>ENTER</kbd> знайти</span><span><kbd>ESC</kbd> пауза</span>');
}
function searchOfficial(){
 const box=officialWin?.querySelector('.s3-scene3-search');if(!box)return;
 box.classList.add('not-found');const em=box.querySelector('em');if(em)em.textContent='НЕ ЗНАЙДЕНО';
 phase='notFound';setHint('<span><b>ДАНИЛО ВЕРЕС — НЕ ЗНАЙДЕНО</b></span><span><kbd>ENTER</kbd> далі</span><span><kbd>ESC</kbd> пауза</span>');
}
function ensureFormulaRow(){
 const original=originalWin(),g=grid(original);if(!original||!g)return null;
 let row=original.querySelector('.s3-scene3-formula-row');if(!row){
  row=document.createElement('div');row.className='excel-row register-row s3-scene3-formula-row';row.dataset.row='22';
  const vals=['ДУБЛЬ','КОД 017','КІЛЬКІСТЬ','COUNTIF','',''];
  row.innerHTML='<div class="excel-row-head">22</div>'+vals.map((v,i)=>'<button type="button" class="excel-cell" data-cell="'+String.fromCharCode(65+i)+'22">'+v+'</button>').join('');g.appendChild(row);
 }
 original.querySelectorAll('.excel-cell.is-selected').forEach(c=>c.classList.remove('is-selected'));row.querySelector('[data-cell="E22"]')?.classList.add('is-selected');
 const n=nameBox(original);if(n)n.textContent='E22';const f=formulaBar(original);if(f)f.textContent=formula;
 setTimeout(()=>row.scrollIntoView({block:'center',behavior:'smooth'}),25);return row;
}
function normalized(v){return String(v||'').toUpperCase().replace(/\s+/g,'').replace(/,/g,';')}
function wrongFormula(){setHint('<span>Перевір: <kbd>=COUNTIF(A2:A269;A17)</kbd></span><span><kbd>ENTER</kbd> виконати</span><span><kbd>ESC</kbd> пауза</span>')}
function acceptFormula(){
 if(normalized(formula)!==normalized(EXPECTED)){wrongFormula();return}
 const original=originalWin(),row=ensureFormulaRow();row?.classList.add('s3-done');const cell=row?.querySelector('[data-cell="E22"]');if(cell)cell.textContent='2';const f=formulaBar(original);if(f)f.textContent=EXPECTED;
 phase='formulaResult';formulaLine=-1;msg('Два записи з кодом 017.','polya');setHint('<span>Результат: <b>2</b></span><span><kbd>ENTER</kbd> далі</span><span><kbd>ESC</kbd> пауза</span>');
}
function advanceFormulaResult(){
 if(formulaLine<FORMULA_LINES.length-1){formulaLine++;msg(FORMULA_LINES[formulaLine],'polya');setHint('<span><kbd>ENTER</kbd> далі</span><span><kbd>ESC</kbd> пауза</span>');return}
 setHeader('system');msg('Рекомендується припинити взаємодію з неавторизованим каналом.','system');phase='systemFinal1';setHint('<span><kbd>ENTER</kbd> далі</span><span><kbd>ESC</kbd> пауза</span>');
}
function arm(){
 if(armed||phase!=='waiting')return;
 const t=help.textContent||'';if(!/СЦЕНА\s*02\s*ЗАВЕРШЕНА/i.test(t)||!/PROTOCOL\s*17/i.test(t))return;
 armed=true;phase='ready';setHint('<span>PROTOCOL 17 зафіксовано</span><span><kbd>ENTER</kbd> СЦЕНА 03 · ОФІЦІЙНА ВЕРСІЯ</span><span><kbd>ESC</kbd> пауза</span>');
}
function startTitle(){phase='title';ensureTitle().classList.add('show');setHint('<span><kbd>ENTER</kbd> продовжити</span><span><kbd>ESC</kbd> пауза</span>')}
function startScene(){ensureTitle().classList.remove('show');setHeader('system');msg('Виявлено роботу з неактуальною версією реєстру.','system');phase='system1';setHint('<span><kbd>ENTER</kbd> далі</span><span><kbd>ESC</kbd> пауза</span>')}

window.addEventListener('keydown',e=>{
 if(e.repeat||e.key==='Escape')return;
 const ctrl=e.ctrlKey||e.metaKey;
 if(phase==='ready'&&e.key==='Enter'){e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();startTitle();return}
 if(phase==='title'&&e.key==='Enter'){e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();startScene();return}
 if(phase==='system1'&&e.key==='Enter'){
  e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();msg('Для продовження роботи використовуйте файл, наданий системою.','system');buildOfficial();phase='system2';setHint('<span>Відкрито <b>REGISTRY_SECTOR_3_OFFICIAL.xlsx</b></span><span><kbd>ENTER</kbd> далі</span><span><kbd>ESC</kbd> пауза</span>');return;
 }
 if(phase==='system2'&&e.key==='Enter'){
  e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();setHeader('polya');msg('Не поспішай.','polya');phase='polya1';setHint('<span><kbd>ENTER</kbd> далі</span><span><kbd>ESC</kbd> пауза</span>');return;
 }
 if(phase==='polya1'&&e.key==='Enter'){
  e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();msg('Відкрий обидва файли. Перемикайся між ними через Alt + Tab.','polya');phase='altPrompt';setHint('<span><kbd>ALT</kbd> + <kbd>TAB</kbd> перейти до першої версії</span><span><kbd>ESC</kbd> пауза</span>');return;
 }
 if((phase==='altPrompt'||phase==='altReturn'||phase==='codesAlt')&&e.altKey&&(e.code==='Tab'||e.key==='Tab')){
  e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();altTab();
  if(phase==='altPrompt'){
   activate('original');msg('У твоїй версії — 268 записів. В офіційній — 267.','polya');phase='altReturn';setHint('<span><kbd>ALT</kbd> + <kbd>TAB</kbd> повернутись до офіційної версії</span><span><kbd>ESC</kbd> пауза</span>');
  }else if(phase==='altReturn'){
   activate('official');msg('Тепер знайди Данила в офіційній версії. Натисни Ctrl + F.','polya');phase='searchPrompt';setHint('<span><kbd>CTRL</kbd> + <kbd>F</kbd> пошук у офіційній версії</span><span><kbd>ESC</kbd> пауза</span>');
  }else{
   activate('original');formula='';ensureFormulaRow();msg('Код 017 у твоїй версії зустрічається двічі. Перевір це формулою.\nУ клітинці E22 введи =COUNTIF(A2:A269;A17) і натисни Enter.','polya');phase='formulaInput';setHint('<span>Введіть у <b>E22</b>: <kbd>=COUNTIF(A2:A269;A17)</kbd></span><span><kbd>ENTER</kbd> виконати</span><span><kbd>ESC</kbd> пауза</span>');
  }
  return;
 }
 if(phase==='searchPrompt'&&ctrl&&(e.code==='KeyF'||String(e.key).toLowerCase()==='f')){e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();openOfficialSearch();return}
 if(phase==='searchOpen'&&e.key==='Enter'){e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();searchOfficial();return}
 if(phase==='notFound'&&e.key==='Enter'){e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();setHeader('polya');msg('Тепер розумієш?','polya');phase='explain1';setHint('<span><kbd>ENTER</kbd> далі</span><span><kbd>ESC</kbd> пауза</span>');return}
 if(phase==='explain1'&&e.key==='Enter'){e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();msg('Я не додала Данила до твого файлу.','polya');phase='explain2';return}
 if(phase==='explain2'&&e.key==='Enter'){e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();msg('Його видалили з офіційного.','polya');phase='explain3';return}
 if(phase==='explain3'&&e.key==='Enter'){e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();setHeader('system');msg('У несанкціонованому файлі виявлено сторонні записи.','system');phase='systemCounter1';return}
 if(phase==='systemCounter1'&&e.key==='Enter'){e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();msg('Дані могли бути змінені зовнішнім користувачем.','system');phase='systemCounter2';return}
 if(phase==='systemCounter2'&&e.key==='Enter'){e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();setHeader('polya');msg('Імена можна підмінити. Подивись на коди. Повернись до першого файлу.','polya');phase='codesAlt';setHint('<span><kbd>ALT</kbd> + <kbd>TAB</kbd> повернутись до першої версії</span><span><kbd>ESC</kbd> пауза</span>');return}
 if(phase==='formulaInput'){
  if(e.key==='Enter'){e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();acceptFormula();return}
  if(e.key==='Backspace'){e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();formula=formula.slice(0,-1);const f=formulaBar(originalWin());if(f)f.textContent=formula;return}
  if(e.ctrlKey||e.metaKey||e.altKey||e.key.length!==1)return;
  e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();formula+=e.key;const f=formulaBar(originalWin());if(f)f.textContent=formula;return;
 }
 if(phase==='formulaResult'&&e.key==='Enter'){e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();advanceFormulaResult();return}
 if(phase==='systemFinal1'&&e.key==='Enter'){e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();msg('Користувач «Поля» не має дозволу на доступ до Сектора 3.','system');phase='systemFinal2';return}
 if(phase==='systemFinal2'&&e.key==='Enter'){e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();setHeader('polya');msg('Вони знають, що я тут.','polya');phase='polyaFinal1';return}
 if(phase==='polyaFinal1'&&e.key==='Enter'){e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();msg('Нам треба рухатись швидше.','polya');phase='polyaFinal2';return}
 if(phase==='polyaFinal2'&&e.key==='Enter'){
  e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();setHeader('maxym');msg('Не відповідай їй.','maxym');phase='complete';setHint('<span>СЦЕНА 03 ЗАВЕРШЕНА · <b>МАКСИМ ВИЙШОВ НА ЗВ’ЯЗОК</b></span><span><kbd>ESC</kbd> пауза</span>');return;
 }
},true);

const observer=new MutationObserver(arm);observer.observe(document.documentElement,{childList:true,subtree:true,characterData:true});
setInterval(arm,450);arm();
const api={get phase(){return phase},start:startTitle};
window.VIDLIK_SCENE3=api;
window.VIDLIK_SCENE3_OFFICIAL=api;
})();