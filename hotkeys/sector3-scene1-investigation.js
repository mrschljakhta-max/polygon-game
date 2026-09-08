(()=>{
'use strict';
if(window.__VIDLIK_SCENE1_INVESTIGATION)return;
window.__VIDLIK_SCENE1_INVESTIGATION=true;

let stage='idle';
let bypassLegacy=false;
let finalRewritten=false;
let menu=null;
let gap=null;
let injected=false;

const tutorial=()=>window.VIDLIK_EXCEL_STORY_TUTORIAL;
const win=()=>document.querySelector('.os-excel-story-window');
const help=()=>document.getElementById('help');
const footer=()=>document.getElementById('adminFooter');
const chat=()=>document.getElementById('adminChat');
const isTask7=()=>!!(tutorial()?.active&&tutorial()?.task===7&&win());

const style=document.createElement('style');
style.id='vidlik-scene1-investigation-style';
style.textContent=`
.os-excel-story-window .s3-investigation-filter,
.os-excel-story-window .s3-investigation-sort{border:1px solid rgba(70,170,159,.42);background:rgba(7,36,36,.74);color:#aeeae4;border-radius:3px;padding:.28em .62em;font:800 10px/1.1 Consolas,monospace;letter-spacing:.04em;cursor:pointer;transition:.16s ease}
.os-excel-story-window .s3-investigation-filter:hover,
.os-excel-story-window .s3-investigation-sort:hover,
.os-excel-story-window .s3-investigation-filter.is-active,
.os-excel-story-window .s3-investigation-sort.is-active{color:#e1fffc;border-color:#63d8ce;background:rgba(10,61,59,.88);box-shadow:0 0 12px rgba(75,215,202,.14)}
.os-excel-story-window .excel-tabs .s3-data-tab{cursor:pointer;position:relative}
.os-excel-story-window .excel-tabs .s3-data-tab.is-target{color:#b8fff7;text-shadow:0 0 9px rgba(75,215,202,.22)}
.os-excel-story-window .excel-tabs .s3-data-tab.is-target::after{content:'';position:absolute;left:8%;right:8%;bottom:-5px;height:1px;background:#65d8cf;box-shadow:0 0 7px rgba(77,222,210,.4)}
.os-excel-story-window .s3-filter-chevron{display:inline-grid;place-items:center;width:15px;height:15px;margin-left:5px;border:1px solid rgba(68,133,126,.48);border-radius:2px;color:#65d7ce;background:rgba(4,27,27,.75);font:900 9px/1 Consolas,monospace;vertical-align:middle;cursor:pointer}
.os-excel-story-window .s3-filter-menu{position:absolute;z-index:120;left:42px;top:112px;width:245px;padding:8px;border:1px solid rgba(77,193,181,.52);background:rgba(4,21,23,.97);box-shadow:0 16px 30px rgba(0,0,0,.42),0 0 18px rgba(51,185,173,.08);border-radius:4px;color:#dceceb;font-family:Inter,"Segoe UI",Arial,sans-serif}
.os-excel-story-window .s3-filter-menu small{display:block;padding:5px 7px 7px;color:#6ea9a3;font:800 8px/1 Consolas,monospace;letter-spacing:.08em;text-transform:uppercase}
.os-excel-story-window .s3-filter-menu button{width:100%;border:0;background:transparent;color:#e7f2f1;text-align:left;padding:9px 10px;border-radius:3px;font:700 11px/1.2 "Segoe UI",Arial,sans-serif;cursor:pointer}
.os-excel-story-window .s3-filter-menu button:hover,
.os-excel-story-window .s3-filter-menu button:focus{outline:0;background:rgba(55,151,142,.18);color:#bafff8}
.os-excel-story-window .s3-hidden-gap{height:25px;display:flex;align-items:center;justify-content:center;gap:9px;margin:1px 0;border-top:1px dashed rgba(73,182,171,.5);border-bottom:1px dashed rgba(73,182,171,.5);background:linear-gradient(90deg,transparent,rgba(42,126,119,.09),transparent);color:#68bdb5;font:800 9px/1 Consolas,monospace;letter-spacing:.07em;text-transform:uppercase;cursor:pointer;animation:s3GapReveal .34s ease both}
.os-excel-story-window .s3-hidden-gap b{color:#d1fff9;font-weight:900}
.os-excel-story-window .s3-hidden-gap kbd{border:1px solid rgba(100,190,181,.42);background:rgba(5,28,29,.72);border-radius:3px;padding:.2em .45em;color:#e5fffb;font:800 8px/1 Consolas,monospace}
.os-excel-story-window.is-s3-sorted .register-row{transition:transform .28s ease,opacity .28s ease}
.os-excel-story-window .register-row[data-row="16"] [data-cell="A16"],
.os-excel-story-window .register-row[data-row="18"] [data-cell="A18"]{color:#f1b779;font-weight:900}
@keyframes s3GapReveal{from{opacity:0;transform:scaleY(.55)}to{opacity:1;transform:scaleY(1)}}
`;
document.head.appendChild(style);

function setFooter(text){const el=footer();if(el&&el.textContent!==text)el.textContent=text}
function setHelp(html){const el=help();if(el&&el.innerHTML!==html)el.innerHTML=html}
function appendPolya(text){
 const host=chat();if(!host)return;
 const row=document.createElement('div');row.className='admin-message vidlik-tutorial-message excel-story-message is-polya';
 const bubble=document.createElement('div');bubble.className='admin-bubble';
 const head=document.createElement('div');head.className='admin-bubble-head';
 const name=document.createElement('span');name.className='admin-bubble-name';name.textContent='ПОЛЯ';
 const time=document.createElement('span');time.className='admin-bubble-time';time.textContent=new Date().toLocaleTimeString('uk-UA',{hour:'2-digit',minute:'2-digit',hour12:false});
 const p=document.createElement('p');p.textContent=text;p.style.whiteSpace='pre-line';
 head.append(name,time);bubble.append(head,p);row.appendChild(bubble);host.appendChild(row);
 requestAnimationFrame(()=>{host.scrollTop=Math.max(0,host.scrollHeight-host.clientHeight)});
}
function toast(text){
 const t=win()?.querySelector('.excel-toast');if(!t)return;
 t.textContent=text;t.hidden=false;clearTimeout(toast.t);toast.t=setTimeout(()=>{if(t)t.hidden=true},1450);
}
function correctCodes(){
 const w=win();if(!w)return;
 const vals={A15:'015',B15:'ОПЕРАТОР 015',A16:'016',B16:'ОПЕРАТОР 016',A18:'018',B18:'ОПЕРАТОР 018',A19:'019',B19:'ОПЕРАТОР 019'};
 for(const [addr,val] of Object.entries(vals)){const el=w.querySelector(`[data-cell="${addr}"]`);if(el)el.textContent=val}
}
function removeLegacyGuide(row){
 const p=row?.querySelector?.('p');if(!p)return false;
 const t=(p.textContent||'').trim();
 if(t.startsWith('Відкрий пошук у книзі комбінацією Ctrl + F.')||t.startsWith('Введи 17 і натисни Enter.')||t.startsWith('Закрий пошук клавішею Esc.')){row.remove();return true}
 if(t.startsWith('Ось він.')&&t.includes('Не евакуйований')){p.textContent='Данило Верес.';return true}
 if(t==='Я маю тобі дещо пояснити.'&&!finalRewritten){
  finalRewritten=true;p.textContent='Мій брат.';
  setTimeout(()=>appendPolya('Я маю тобі дещо пояснити.'),900);
  return true;
 }
 return false;
}
const observer=new MutationObserver(records=>{
 for(const r of records)for(const n of r.addedNodes){
  if(!(n instanceof Element))continue;
  if(n.matches?.('.admin-message'))removeLegacyGuide(n);
  n.querySelectorAll?.('.admin-message').forEach(removeLegacyGuide);
 }
});
observer.observe(document.body,{subtree:true,childList:true});

function injectControls(){
 const w=win();if(!w||injected)return;
 const tools=w.querySelector('.excel-tools');
 const tabs=[...w.querySelectorAll('.excel-tabs span')];
 const data=tabs.find(x=>x.textContent.trim()==='Дані');
 if(data){data.classList.add('s3-data-tab','is-target');data.dataset.s3DataTab='1'}
 if(tools){
  const f=document.createElement('button');f.type='button';f.className='s3-investigation-filter';f.dataset.s3Filter='1';f.textContent='⌄ Фільтр';
  const s=document.createElement('button');s.type='button';s.className='s3-investigation-sort';s.dataset.s3Sort='1';s.textContent='↑ Сортування';s.hidden=true;
  tools.append(f,s);
 }
 injected=true;
}
function cleanupControls(){
 menu?.remove();menu=null;gap?.remove();gap=null;
 const w=win();
 w?.classList.remove('is-s3-sorted');
 w?.querySelectorAll('[data-s3-filter],[data-s3-sort],.s3-filter-chevron').forEach(x=>x.remove());
 w?.querySelectorAll('.s3-data-tab').forEach(x=>{x.classList.remove('s3-data-tab','is-target');delete x.dataset.s3DataTab});
 injected=false;
}
function filterButton(){return win()?.querySelector('[data-s3-filter]')}
function sortButton(){return win()?.querySelector('[data-s3-sort]')}
function addHeaderChevron(){
 const a1=win()?.querySelector('[data-cell="A1"]');if(!a1||a1.querySelector('.s3-filter-chevron'))return;
 const ch=document.createElement('span');ch.className='s3-filter-chevron';ch.dataset.s3FilterMenu='1';ch.textContent='▼';a1.appendChild(ch);
}
function enableFilter(){
 if(!isTask7()||stage==='revealed')return;
 stage='filtered';injectControls();correctCodes();
 filterButton()?.classList.add('is-active');
 const sb=sortButton();if(sb)sb.hidden=false;
 addHeaderChevron();
 setHelp('<span><kbd>ALT</kbd> + <kbd>↓</kbd> відкрити меню КОД</span><span><kbd>ЛКМ</kbd> ▼ у заголовку КОД</span>');
 toast('Фільтр увімкнено');
}
function openFilterMenu(){
 if(stage==='await-filter'){enableFilter();return}
 if(stage!=='filtered')return;
 menu?.remove();
 const w=win();if(!w)return;
 menu=document.createElement('div');menu.className='s3-filter-menu';
 menu.innerHTML='<small>КОД · ФІЛЬТР</small><button type="button" data-s3-sort-asc="1">↑ Сортувати від найменшого до найбільшого</button>';
 w.querySelector('.excel-body')?.appendChild(menu);
 stage='menu';
 setHelp('<span><kbd>ENTER</kbd> сортувати за зростанням</span><span><kbd>ESC</kbd> закрити меню</span>');
 menu.querySelector('button')?.focus({preventScroll:true});
}
function showGap(){
 const w=win();if(!w)return;
 correctCodes();w.classList.add('is-s3-sorted');
 gap?.remove();
 gap=document.createElement('button');gap.type='button';gap.className='s3-hidden-gap';gap.dataset.s3RevealGap='1';
 gap.innerHTML='<span>016</span><b>рядок 17 приховано</b><span>018</span><kbd>CTRL+SHIFT+9</kbd>';
 const row16=w.querySelector('.register-row[data-row="16"]');row16?.insertAdjacentElement('afterend',gap);
 requestAnimationFrame(()=>gap?.scrollIntoView({block:'center',behavior:'smooth'}));
}
function sortAscending(){
 if(!['filtered','menu'].includes(stage))return;
 menu?.remove();menu=null;stage='sorted';
 sortButton()?.classList.add('is-active');
 showGap();
 setFooter('ЗАВДАННЯ 7 / 7 · ПОКАЖІТЬ ПРИХОВАНИЙ РЯДОК');
 setHelp('<span><kbd>CTRL</kbd> + <kbd>SHIFT</kbd> + <kbd>9</kbd> показати приховані рядки</span><span><kbd>ЛКМ</kbd> рядок 17</span>');
 appendPolya('Бачиш розрив? 016… 018.\nСімнадцятий рядок не видалений. Його приховали.');
}
function fire(key,code,extra={}){window.dispatchEvent(new KeyboardEvent('keydown',{key,code,bubbles:true,cancelable:true,...extra}))}
function syncLegacyReveal(){
 bypassLegacy=true;
 try{
  fire('f','KeyF',{ctrlKey:true});
  fire('1','Digit1');fire('7','Digit7');fire('Enter','Enter');fire('Escape','Escape');
 }finally{bypassLegacy=false}
 setTimeout(correctCodes,0);
}
function revealHidden(){
 if(stage!=='sorted')return;
 stage='revealed';gap?.remove();gap=null;menu?.remove();menu=null;
 setFooter('7 / 7 · СЦЕНА 01 · ІНША ВЕРСІЯ');
 setHelp('<span><kbd>017</kbd> прихований запис відновлено</span>');
 syncLegacyReveal();
}
function beginTask7(){
 stage='await-filter';finalRewritten=false;injectControls();correctCodes();
 setFooter('ЗАВДАННЯ 7 / 7 · ВИЯВІТЬ ПРИХОВАНИЙ ЗАПИС');
 setHelp('<span><kbd>CTRL</kbd> + <kbd>SHIFT</kbd> + <kbd>L</kbd> увімкнути фільтр</span><span><kbd>ДАНІ</kbd> → ФІЛЬТР</span>');
}

window.addEventListener('keydown',e=>{
 if(bypassLegacy||!isTask7())return;
 const k=e.key.toLowerCase();
 if(e.ctrlKey&&!e.altKey&&!e.metaKey&&k==='f'){
  e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();
  toast('Не шукай ім’я. Перевір структуру реєстру.');
  setHelp('<span><kbd>CTRL</kbd> + <kbd>SHIFT</kbd> + <kbd>L</kbd> увімкнути фільтр</span>');
  return;
 }
 if(e.ctrlKey&&e.shiftKey&&!e.altKey&&!e.metaKey&&k==='l'){
  e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();enableFilter();return;
 }
 if(e.altKey&&!e.ctrlKey&&!e.metaKey&&e.key==='ArrowDown'){
  e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();openFilterMenu();return;
 }
 if(stage==='menu'&&e.key==='Enter'){
  e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();sortAscending();return;
 }
 if(stage==='menu'&&e.key==='Escape'){
  e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();menu?.remove();menu=null;stage='filtered';setHelp('<span><kbd>ALT</kbd> + <kbd>↓</kbd> відкрити меню КОД</span>');return;
 }
 if(stage==='sorted'&&e.ctrlKey&&e.shiftKey&&e.code==='Digit9'){
  e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();revealHidden();return;
 }
},true);

document.addEventListener('click',e=>{
 if(!isTask7())return;
 if(e.target.closest('[data-s3-data-tab],[data-s3-filter]')){e.preventDefault();e.stopImmediatePropagation();enableFilter();return}
 if(e.target.closest('[data-s3-filter-menu]')){e.preventDefault();e.stopImmediatePropagation();openFilterMenu();return}
 if(e.target.closest('[data-s3-sort],[data-s3-sort-asc]')){e.preventDefault();e.stopImmediatePropagation();sortAscending();return}
 if(e.target.closest('[data-s3-reveal-gap]')){e.preventDefault();e.stopImmediatePropagation();revealHidden();return}
},true);

setInterval(()=>{
 const t=tutorial();
 if(t?.active&&t.task===7){
  if(stage==='idle')beginTask7();
  else{injectControls();correctCodes();if(stage==='sorted'&&!document.querySelector('.s3-hidden-gap'))showGap()}
 }else if(stage!=='idle'&&(!t?.active||t.task<7)){
  cleanupControls();stage='idle';finalRewritten=false;
 }
},80);
})();