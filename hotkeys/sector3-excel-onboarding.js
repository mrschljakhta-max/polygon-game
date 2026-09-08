(()=>{
'use strict';
if(window.VIDLIK_EXCEL_ONBOARDING)return;

const mon=document.querySelector('.monitor-screen');
const chat=document.getElementById('adminChat');
const footer=document.getElementById('adminFooter');
const help=document.getElementById('help');
const excelIcon=document.querySelector('.desktop-icon[data-app="excel"]');
if(!mon||!chat||!footer||!help||!excelIcon)return;

let active=false;
let completed=false;
let stage=0;
let overlay=null;
let launching=false;

function nowTime(){return new Date().toLocaleTimeString('uk-UA',{hour:'2-digit',minute:'2-digit',hour12:false})}
function scrollLatest(rowEl){requestAnimationFrame(()=>requestAnimationFrame(()=>{const top=Math.max(0,chat.scrollHeight-chat.clientHeight);if(typeof chat.scrollTo==='function')chat.scrollTo({top,behavior:'smooth'});else chat.scrollTop=top;rowEl?.setAttribute('data-visible-latest','true')}))}
function adminMessage(text){
 const r=document.createElement('div');r.className='admin-message vidlik-tutorial-message excel-onboarding-message';
 const bubble=document.createElement('div');bubble.className='admin-bubble';
 const head=document.createElement('div');head.className='admin-bubble-head';
 const name=document.createElement('span');name.className='admin-bubble-name';name.textContent='СИСТЕМНИЙ АДМІНІСТРАТОР';
 const time=document.createElement('span');time.className='admin-bubble-time';time.textContent=nowTime();
 const p=document.createElement('p');p.textContent=text;p.style.whiteSpace='pre-line';
 head.append(name,time);bubble.append(head,p);r.append(bubble);chat.appendChild(r);scrollLatest(r);
}
function setFooter(text){footer.textContent=text;footer.classList.add('vidlik-tutorial-footer')}
function setHelp(html){help.classList.add('vidlik-tutorial-help');help.innerHTML=html}

function minimizeOldWindows(){
 document.querySelector('.os-language-training-window')?.remove();
 document.querySelector('.vidlik-language-taskbar-button')?.remove();
 for(const b of [...mon.querySelectorAll('.os-window:not(.os-minimized):not(.os-window-minimized) [data-win="min"]')]){
  try{b.click()}catch(_){ }
 }
}
function removeOverlay(){overlay?.remove();overlay=null;mon.classList.remove('vidlik-excel-card-open','vidlik-excel-launching')}
function ensureOverlay(){
 if(overlay?.isConnected)return overlay;
 overlay=document.createElement('section');
 overlay.className='vidlik-excel-onboarding';
 overlay.setAttribute('aria-label','Знайомство з Microsoft Excel');
 mon.appendChild(overlay);
 requestAnimationFrame(()=>overlay?.classList.add('is-visible'));
 return overlay;
}
function card(inner,foot=''){const root=ensureOverlay();root.innerHTML=`<div class="vidlik-excel-onboarding-card">${inner}<div class="vidlik-excel-onboarding-foot"><span>VIDLIK · ЕПІЗОД 05</span>${foot}</div></div>`;mon.classList.add('vidlik-excel-card-open')}

function stageOne(){
 card(`
  <div class="vidlik-excel-onboarding-head">
   <div class="vidlik-excel-onboarding-logo">X</div>
   <div><div class="vidlik-excel-onboarding-kicker">Microsoft Excel</div><h3>Що це за програма?</h3></div>
  </div>
  <p class="vidlik-excel-onboarding-copy"><strong>Excel</strong> — програма для роботи з електронними таблицями. У ній зберігають структуровані дані, виконують розрахунки, сортують і фільтрують записи та аналізують великі масиви інформації.</p>
  <div class="vidlik-excel-onboarding-grid">
   <div class="vidlik-excel-onboarding-item"><b>.XLSX</b><span>Основний формат файлу сучасної книги Excel.</span></div>
   <div class="vidlik-excel-onboarding-item"><b>ДАНІ</b><span>Текст, числа, дати й інші значення організовані в таблицю.</span></div>
   <div class="vidlik-excel-onboarding-item"><b>РОЗРАХУНКИ</b><span>Формули виконують обчислення автоматично.</span></div>
   <div class="vidlik-excel-onboarding-item"><b>АНАЛІЗ</b><span>Пошук, сортування й фільтри допомагають знаходити потрібне.</span></div>
  </div>`,`<span><kbd>ENTER</kbd> далі</span>`);
 setHelp('<span><kbd>ENTER</kbd> далі · що таке Excel</span>');
}
function stageTwo(){
 card(`
  <div class="vidlik-excel-onboarding-head">
   <div class="vidlik-excel-onboarding-logo">X</div>
   <div><div class="vidlik-excel-onboarding-kicker">Будова документа</div><h3>Книга → аркуш → клітинка</h3></div>
  </div>
  <p class="vidlik-excel-onboarding-copy">Файл Excel називається <strong>книгою</strong>. Усередині книги може бути кілька <strong>аркушів</strong>. Кожен аркуш складається зі стовпців і рядків, а їх перетин утворює <strong>клітинку</strong>.</p>
  <div class="vidlik-excel-onboarding-grid">
   <div class="vidlik-excel-onboarding-item"><b>КНИГА</b><span>Один файл .xlsx. У нашому випадку — TRAINING_SYNC_SECTOR_3.xlsx.</span></div>
   <div class="vidlik-excel-onboarding-item"><b>АРКУШ</b><span>Окрема вкладка всередині книги, наприклад «Вступ» або «Реєстр».</span></div>
   <div class="vidlik-excel-onboarding-item"><b>КЛІТИНКА B2</b><span>Стовпець B + рядок 2. Адреса дозволяє точно звернутися до значення.</span></div>
   <div class="vidlik-excel-onboarding-item"><b>ФОРМУЛА</b><span>Починається зі знака = і може використовувати числа, функції та адреси клітинок.</span></div>
  </div>`,`<span><kbd>ENTER</kbd> далі</span>`);
 setHelp('<span><kbd>ENTER</kbd> далі · книга, аркуш, клітинка</span>');
}
function stageThree(){
 card(`
  <div class="vidlik-excel-onboarding-head">
   <div class="vidlik-excel-onboarding-logo">X</div>
   <div><div class="vidlik-excel-onboarding-kicker">Інтерфейс</div><h3>Що буде у вікні Excel</h3></div>
  </div>
  <p class="vidlik-excel-onboarding-copy">Не треба запам’ятовувати все одразу. Спочатку навчимося орієнтуватися у чотирьох основних зонах.</p>
  <div class="vidlik-excel-onboarding-map">
   <div><b>СТРІЧКА</b><span>Вкладки «Основне», «Вставлення», «Формули», «Дані» та команди програми.</span></div>
   <div><b>РЯДОК ФОРМУЛ</b><span>Показує адресу активної клітинки та її значення або формулу.</span></div>
   <div><b>ТАБЛИЦЯ</b><span>Літери позначають стовпці, числа — рядки. Стрілки переміщують активну клітинку.</span></div>
   <div><b>ВКЛАДКИ</b><span>Унизу перемикаємося між аркушами однієї книги.</span></div>
  </div>`,`<span><kbd>ENTER</kbd> до запуску</span>`);
 setHelp('<span><kbd>ENTER</kbd> далі · основні зони Excel</span>');
}
function stageReady(){
 removeOverlay();
 mon.classList.add('vidlik-excel-onboarding-active');
 adminMessage('Тепер відкрийте Microsoft Excel. Двічі клацніть зелений значок на робочому столі.\nПісля запуску ми спочатку закріпимо навігацію по клітинках — і лише потім перейдемо до введення даних та формул.');
 setFooter('ЕПІЗОД 5 · ПЕРША ТАБЛИЦЯ · ЗАПУСК EXCEL');
 setHelp('<span><kbd>ЛКМ ×2</kbd> Microsoft Excel · відкрити</span>');
}
function setStage(next){
 if(!active||launching)return;
 stage=next;
 if(stage===1)stageOne();
 else if(stage===2)stageTwo();
 else if(stage===3)stageThree();
 else if(stage===4)stageReady();
}

function begin(){
 if(active||completed)return;
 active=true;stage=0;launching=false;
 minimizeOldWindows();
 removeOverlay();
 mon.classList.add('vidlik-excel-onboarding-active');
 excelIcon.classList.add('vidlik-excel-icon-focus');
 setFooter('ЕПІЗОД 5 · ПЕРША ТАБЛИЦЯ · ЗНАЙОМСТВО З EXCEL');
 setHelp('<span><kbd>ЛКМ</kbd> вибрати значок Microsoft Excel</span>');
 adminMessage('Перед наступним завданням — коротке знайомство з новою програмою.\nНа робочому столі знайдіть зелений значок Microsoft Excel і виберіть його одним кліком.');
}

function launch(){
 if(!active||launching||stage!==4)return;
 launching=true;
 mon.classList.remove('vidlik-excel-onboarding-active');
 excelIcon.classList.remove('vidlik-excel-icon-focus','is-selected');
 const root=ensureOverlay();
 root.classList.add('is-visible');
 mon.classList.add('vidlik-excel-launching');
 root.innerHTML=`<div class="vidlik-excel-onboarding-card"><div class="vidlik-excel-onboarding-head"><div class="vidlik-excel-onboarding-logo">X</div></div><div class="vidlik-excel-onboarding-kicker">Microsoft Excel</div><h3>Відкриття навчальної книги…</h3><p class="vidlik-excel-onboarding-copy">TRAINING_SYNC_SECTOR_3.xlsx</p><div class="vidlik-excel-onboarding-foot"><span>VIDLIK OS</span><span>ПІДГОТОВКА РОБОЧОГО СЕРЕДОВИЩА</span></div></div>`;
 setHelp('<span><kbd>EXCEL</kbd> відкриття книги…</span>');
 setTimeout(()=>{
  completed=true;active=false;launching=false;
  removeOverlay();
  window.VIDLIK_EXCEL_STORY_TUTORIAL?.start?.();
 },720);
}

function gate(e){
 if(completed)return;
 e.preventDefault?.();
 e.stopImmediatePropagation();
 e.stopPropagation();
 begin();
}
window.addEventListener('vidlik:episode5-ready',gate,true);
window.addEventListener('vidlik:section5-ready',gate,true);

mon.addEventListener('click',e=>{
 if(!active||launching)return;
 const icon=e.target.closest('.desktop-icon[data-app="excel"]');
 if(!icon)return;
 if(stage===0){
  /*
   * Own the first click completely. The OS desktop may still have minimized
   * windows in its layer and we do not want its legacy icon handler to decide
   * whether the onboarding advances. One click means one deterministic action:
   * select Excel and open the explanation card.
   */
  e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();
  excelIcon.classList.add('is-selected');
  adminMessage('Так. Це Microsoft Excel. Спочатку розберемося, що саме він робить і як влаштований документ.');
  setStage(1);
  return;
 }
 if(stage===4&&e.detail>=2){
  e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();launch();
 }
},true);
mon.addEventListener('dblclick',e=>{
 if(!active||stage!==4)return;
 if(!e.target.closest('.desktop-icon[data-app="excel"]'))return;
 e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();launch();
},true);

window.addEventListener('keydown',e=>{
 if(!active||launching)return;
 if(e.key==='Escape')return; // Pause Router keeps ownership of Escape.
 if(stage>=1&&stage<=3&&e.key==='Enter'){
  e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();setStage(stage+1);return;
 }
 if(stage===4&&e.key==='Enter'&&excelIcon.classList.contains('is-selected')){
  e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();launch();return;
 }
 if(stage>=1){
  e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();
 }
},true);

window.addEventListener('vidlik:os-reset',()=>{
 active=false;completed=false;stage=0;launching=false;removeOverlay();
 mon.classList.remove('vidlik-excel-onboarding-active');
 excelIcon.classList.remove('vidlik-excel-icon-focus','is-selected');
});

window.VIDLIK_EXCEL_ONBOARDING={begin,launch,get active(){return active},get stage(){return stage},get completed(){return completed}};
})();
