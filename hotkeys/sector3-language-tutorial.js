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
let value='';
let lastGuide='';
let timer=null;
let win=null;
let taskBtn=null;
let minimized=false;
let maximized=false;
let closedRecoveries=0;

const OS=()=>window.VIDLIK_OS;

const EN={};
'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').forEach(c=>EN['Key'+c]=c.toLowerCase());
const UA={KeyQ:'й',KeyW:'ц',KeyE:'у',KeyR:'к',KeyT:'е',KeyY:'н',KeyU:'г',KeyI:'ш',KeyO:'щ',KeyP:'з',BracketLeft:'х',BracketRight:'ї',KeyA:'ф',KeyS:'і',KeyD:'в',KeyF:'а',KeyG:'п',KeyH:'р',KeyJ:'о',KeyK:'л',KeyL:'д',Semicolon:'ж',Quote:'є',KeyZ:'я',KeyX:'ч',KeyC:'с',KeyV:'м',KeyB:'и',KeyN:'т',KeyM:'ь',Comma:'б',Period:'ю',Backquote:'ґ'};
const SHIFT_DIGITS={Digit1:'!',Digit2:'@',Digit3:'#',Digit4:'$',Digit5:'%',Digit6:'^',Digit7:'&',Digit8:'*',Digit9:'(',Digit0:')'};

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
function taskLabel(n,text){setFooter(`ЗАВДАННЯ ${n} / 7 · ${text}`)}
function guide(key,text,html){if(!active||lastGuide===key)return;lastGuide=key;adminMessage(text);if(html)setHelp(html)}
function schedule(ms=30){clearTimeout(timer);timer=setTimeout(reconcile,ms)}
function lang(){return OS()?.language==='ENG'?'ENG':'UKR'}

function languageButton(){return document.getElementById('osLanguageButton')}
function languageMenu(){return document.getElementById('osLanguageMenu')}
function languageChoice(code){return languageMenu()?.querySelector(`[data-lang="${code}"]`)||null}
function runningArea(){return document.getElementById('osRunningApps')}
function layer(){return mon.querySelector('.os-layer')}

function clearTargets(){
 document.querySelectorAll('.vidlik-language-target,.vidlik-language-field-target').forEach(x=>x.classList.remove('vidlik-language-target','vidlik-language-field-target'));
}
function highlightLanguage(code){
 clearTargets();
 const menu=languageMenu();
 if(menu&&!menu.hidden){
  const choice=languageChoice(code);if(choice)choice.classList.add('vidlik-language-target');
 }else languageButton()?.classList.add('vidlik-language-target');
}
function highlightField(){clearTargets();win?.querySelector('.vidlik-language-input')?.classList.add('vidlik-language-field-target')}
function highlightTask(){clearTargets();taskBtn?.classList.add('vidlik-language-target')}

function translate(e){
 if(e.code==='Space')return' ';
 if(/^Digit\d$/.test(e.code))return e.shiftKey?SHIFT_DIGITS[e.code]:e.code.slice(-1);
 const map=lang()==='ENG'?EN:UA;
 let c=map[e.code];
 if(c)return e.shiftKey?c.toUpperCase():c;
 if(lang()==='ENG'){
  const p={Minus:['-','_'],Equal:['=','+'],Semicolon:[';',':'],Quote:["'",'"'],Comma:[',','<'],Period:['.','>'],Slash:['/','?'],BracketLeft:['[','{'],BracketRight:[']','}']};
  return p[e.code]?.[e.shiftKey?1:0]||'';
 }
 return{Minus:'-',Equal:'=',Slash:'.'}[e.code]||'';
}

function setValue(v){
 value=v;
 if(!win)return;
 const input=win.querySelector('.vidlik-language-input');
 if(input)input.value=value;
 const len=win.querySelector('.vidlik-language-length');
 if(len)len.textContent=String(value.length);
}
function setPrompt(title,target,note=''){
 if(!win)return;
 const t=win.querySelector('.vidlik-language-task-title');if(t)t.textContent=title;
 const q=win.querySelector('.vidlik-language-target-text');if(q)q.textContent=target;
 const n=win.querySelector('.vidlik-language-note');if(n)n.textContent=note;
 const state=win.querySelector('.vidlik-language-current strong');if(state)state.textContent=lang();
}
function syncLanguageBadge(){
 if(!win)return;
 const state=win.querySelector('.vidlik-language-current strong');if(state)state.textContent=lang();
 const badge=win.querySelector('.vidlik-language-layout-badge');if(badge)badge.textContent=lang();
}

function buildWindow(){
 if(win?.isConnected)return win;
 const host=layer();if(!host)return null;
 win=document.createElement('section');
 win.className='os-window os-language-training-window os-window-active';
 win.dataset.windowId='language-trainer';
 win.innerHTML=`
  <header class="os-window-titlebar">
   <strong>VIDLIK · Тренажер введення</strong>
   <span class="os-window-actions">
    <button type="button" data-language-win="min" title="Згорнути">—</button>
    <button type="button" data-language-win="max" title="Розгорнути">□</button>
    <button type="button" data-language-win="close" title="Закрити">×</button>
   </span>
  </header>
  <div class="os-window-body vidlik-language-body">
   <div class="vidlik-language-topline">
    <span class="vidlik-language-current">ПОТОЧНА МОВА: <strong>${lang()}</strong></span>
    <span class="vidlik-language-layout-badge">${lang()}</span>
   </div>
   <div class="vidlik-language-card">
    <div class="vidlik-language-task-title">Підготовка</div>
    <div class="vidlik-language-target-text">—</div>
    <input class="vidlik-language-input" readonly autocomplete="off" spellcheck="false" aria-label="Поле тренування введення">
    <div class="vidlik-language-meta"><span class="vidlik-language-note">—</span><span>СИМВОЛІВ: <b class="vidlik-language-length">0</b></span></div>
   </div>
   <div class="vidlik-language-key-demo">
    <span>ФІЗИЧНА КЛАВІША</span><kbd>F</kbd><i>→</i><strong class="vidlik-language-key-result">?</strong>
   </div>
  </div>`;
 host.appendChild(win);
 minimized=false;maximized=false;
 createTaskButton();
 win.addEventListener('mousedown',()=>{win.style.zIndex='240'});
 return win;
}
function createTaskButton(){
 const area=runningArea();if(!area)return;
 if(taskBtn?.isConnected)return;
 taskBtn=document.createElement('button');
 taskBtn.className='os-running-button is-active vidlik-language-taskbar-button';
 taskBtn.type='button';
 taskBtn.textContent='Тренажер введення';
 taskBtn.title='Тренажер введення';
 area.appendChild(taskBtn);
 taskBtn.addEventListener('click',e=>{
  e.preventDefault();e.stopPropagation();
  if(!win?.isConnected)buildWindow();
  minimized=!minimized;
  if(!minimized){win.classList.remove('os-minimized','os-window-minimized');taskBtn.classList.remove('is-minimized');taskBtn.classList.add('is-active');win.style.zIndex='240'}
  else{win.classList.add('os-minimized','os-window-minimized');taskBtn.classList.add('is-minimized');taskBtn.classList.remove('is-active')}
  schedule(0);
 },true);
}
function recoverWindow(){
 if(win?.isConnected)return true;
 buildWindow();
 closedRecoveries++;
 guide(`window-recover-${closedRecoveries}`,'Вікно тренажера було закрито. Я відкрив його знову — продовжимо з поточного завдання.','<span><kbd>Тренажер введення</kbd> відновлено</span>');
 return false;
}
function ensureWindow(){
 if(!win?.isConnected){recoverWindow();return false}
 if(minimized){
  highlightTask();
  guide('window-minimized','Вікно тренажера згорнуто. Натисніть «Тренажер введення» на панелі задач.','<span><kbd>ЛКМ</kbd> Тренажер введення</span>');
  return false;
 }
 return true;
}

function instructLanguage(code,key){
 syncLanguageBadge();
 highlightLanguage(code);
 const menu=languageMenu();
 const current=lang();
 if(current===code)return true;
 if(menu&&!menu.hidden){
  guide(`${key}-choose-${code}`,`У меню мов натисніть «${code==='ENG'?'English':'Українська'}».`,`<span><kbd>ЛКМ</kbd> ${code}</span>`);
 }else{
  guide(`${key}-open-menu-${current}`,`Натисніть індикатор мови «${current}» на панелі задач.`,`<span><kbd>ЛКМ</kbd> ${current}</span>`);
 }
 return false;
}

function begin(n,label,newPhase){
 task=n;phase=newPhase;lastGuide='';setValue('');taskLabel(n,label);schedule(0);
}
function beginTask1(){begin(1,'ПЕРЕМКНІТЬ UKR → ENG','switch-eng')}
function beginTask2(){begin(2,'ПЕРЕВІРТЕ КЛАВІШУ F В ENG','key-f-eng')}
function beginTask3(){begin(3,'ПЕРЕМКНІТЬ ENG → UKR','switch-ukr')}
function beginTask4(){begin(4,'ПЕРЕВІРТЕ ТУ САМУ КЛАВІШУ F','key-f-ukr')}
function beginTask5(){begin(5,'ВВЕДІТЬ УКРАЇНСЬКЕ СЛОВО','type-ukr')}
function beginTask6(){begin(6,'ПЕРЕМКНІТЬСЯ НА ENG І ВВЕДІТЬ ТЕКСТ','switch-eng-word')}
function beginTask7(){begin(7,'ВВЕДІТЬ ФРАГМЕНТ ФОРМУЛИ','formula')}

function reconcile(){
 if(!active)return;
 clearTimeout(timer);
 if(!ensureWindow())return;
 syncLanguageBadge();

 if(task===0){
  if(lang()!=='UKR'){
   setPrompt('Підготовка','UKR','Почнемо з української розкладки.');
   instructLanguage('UKR','prepare');return;
  }
  adminMessage('До цього ми вже керували файлами клавіатурою. Тепер розберемося, чому одна й та сама фізична клавіша може вводити різні символи.\nМову будемо перемикати тільки через індикатор на панелі задач.');
  beginTask1();return;
 }

 if(task===1){
  setPrompt('Перемикання мови','ENG','Відкрийте індикатор мови на панелі задач.');
  if(instructLanguage('ENG','t1')){beginTask2();return}
  return;
 }

 if(task===2){
  setPrompt('Та сама клавіша — інший символ','f','Натисніть фізичну клавішу F один раз.');
  highlightField();
  if(lang()!=='ENG'){instructLanguage('ENG','t2-recover-lang');return}
  if(value==='f'){const r=win.querySelector('.vidlik-language-key-result');if(r)r.textContent='f';setTimeout(beginTask3,280);return}
  guide('t2-key','Натисніть фізичну клавішу F. У розкладці ENG вона введе «f».','<span><kbd>F</kbd> → f</span>');return;
 }

 if(task===3){
  setPrompt('Повернення до української','UKR','Перемкніть мову через панель задач.');
  if(instructLanguage('UKR','t3')){beginTask4();return}
  return;
 }

 if(task===4){
  setPrompt('Та сама фізична клавіша','а','Натисніть фізичну клавішу F ще раз.');
  highlightField();
  if(lang()!=='UKR'){instructLanguage('UKR','t4-recover-lang');return}
  if(value==='а'){const r=win.querySelector('.vidlik-language-key-result');if(r)r.textContent='а';adminMessage('Саме так. Фізична клавіша не змінилася, але активна розкладка визначила, який символ отримала система.');setTimeout(beginTask5,360);return}
  guide('t4-key','Натисніть ту саму фізичну клавішу F. У розкладці UKR вона введе «а».','<span><kbd>F</kbd> → а</span>');return;
 }

 if(task===5){
  const target='відлік';
  setPrompt('Українське введення',target,'Введіть слово малими літерами й натисніть Enter.');
  highlightField();
  if(lang()!=='UKR'){instructLanguage('UKR','t5-lang');return}
  if(value===target){guide('t5-enter','Слово введено правильно. Натисніть Enter.','<span><kbd>ENTER</kbd> підтвердити</span>');return}
  guide(`t5-type-${value}`,`Введіть «${target}». Якщо помилилися — Backspace видаляє останній символ.`,`<span><kbd>ТЕКСТ</kbd> ${target} · <kbd>BACKSPACE</kbd> виправити</span>`);return;
 }

 if(task===6){
  const target='vidlik';
  if(phase==='switch-eng-word'){
   setPrompt('Англійське введення','ENG','Спочатку перемкніть мову через панель задач.');
   if(instructLanguage('ENG','t6-switch')){phase='type-eng';lastGuide='';setValue('');schedule(0)}
   return;
  }
  setPrompt('Англійське введення',target,'Введіть слово малими літерами й натисніть Enter.');
  highlightField();
  if(lang()!=='ENG'){instructLanguage('ENG','t6-lang');return}
  if(value===target){guide('t6-enter','Текст введено правильно. Натисніть Enter.','<span><kbd>ENTER</kbd> підтвердити</span>');return}
  guide(`t6-type-${value}`,`Введіть «${target}» малими літерами.`,`<span><kbd>ТЕКСТ</kbd> ${target}</span>`);return;
 }

 if(task===7){
  const target='=sum';
  setPrompt('Підготовка до Excel',target,'Знак = починає формулу. Назву функції вводимо в ENG.');
  highlightField();
  if(lang()!=='ENG'){instructLanguage('ENG','t7-lang');return}
  if(value===target){guide('t7-enter','Фрагмент введено правильно. Натисніть Enter.','<span><kbd>ENTER</kbd> завершити</span>');return}
  guide(`t7-type-${value}`,`Введіть «${target}» і натисніть Enter.`,`<span><kbd>=</kbd><kbd>S</kbd><kbd>U</kbd><kbd>M</kbd></span>`);return;
 }
}

function finish(){
 active=false;task=8;phase='complete';lastGuide='';clearTargets();
 setPrompt('Розділ завершено','ГОТОВО','Мову введення опановано.');
 adminMessage('Готово. Ви вмієте перемикати UKR / ENG через панель задач і розумієте, як розкладка змінює введений символ.\nНаступний крок — перша таблиця Excel.');
 setFooter('7 / 7 · МОВА ВВЕДЕННЯ · ЗАВЕРШЕНО ✓');
 setHelp('<span><kbd>ГОТОВО</kbd> мова введення</span>');
 setTimeout(()=>window.dispatchEvent(new CustomEvent('vidlik:language-section-complete')),500);
}

function confirmCurrent(){
 if(task===5&&value==='відлік'){beginTask6();return true}
 if(task===6&&phase==='type-eng'&&value==='vidlik'){beginTask7();return true}
 if(task===7&&value==='=sum'){finish();return true}
 return false;
}

function typingTask(){return task===2||task===4||task===5||(task===6&&phase==='type-eng')||task===7}
function expectedLanguage(){
 if(task===2||task===6||task===7)return'ENG';
 if(task===4||task===5)return'UKR';
 return null;
}

function keydown(e){
 if(!active||!typingTask()||minimized||!win?.isConnected)return;
 if(e.ctrlKey||e.altKey||e.metaKey)return;
 const expected=expectedLanguage();
 if(expected&&lang()!==expected){e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();schedule(0);return}
 if(e.key==='Backspace'){
  e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();
  setValue(value.slice(0,-1));lastGuide='';schedule(0);return;
 }
 if(e.key==='Enter'){
  e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();
  if(!confirmCurrent()){
   lastGuide='';guide(`enter-wrong-${task}-${value}`,'Текст ще не збігається із завданням. Виправте його й натисніть Enter ще раз.','<span><kbd>BACKSPACE</kbd> виправити</span>');
  }
  return;
 }
 if(task===2||task===4){
  e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();
  if(e.code!=='KeyF'){
   guide(`wrong-key-${task}-${e.code}`,'Для цієї вправи потрібна саме фізична клавіша F.','<span><kbd>F</kbd></span>');return;
  }
  setValue(translate(e));lastGuide='';schedule(0);return;
 }
 const c=translate(e);if(!c)return;
 e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();
 setValue(value+c);lastGuide='';schedule(0);
}

function click(e){
 if(!active)return;
 const control=e.target.closest('[data-language-win]');
 if(control&&win?.contains(control)){
  e.preventDefault();e.stopPropagation();
  const a=control.dataset.languageWin;
  if(a==='min'){
   minimized=true;win.classList.add('os-minimized','os-window-minimized');taskBtn?.classList.add('is-minimized');taskBtn?.classList.remove('is-active');schedule(0);return;
  }
  if(a==='max'){
   maximized=!maximized;win.classList.toggle('os-maximized',maximized);control.textContent=maximized?'❐':'□';return;
  }
  if(a==='close'){
   win.remove();win=null;taskBtn?.remove();taskBtn=null;schedule(180);return;
  }
 }
 if(e.target.closest('#osLanguageButton,[data-lang]'))schedule(30);
}

function start(){
 if(active)return;
 active=true;task=0;phase='prepare';lastGuide='';closedRecoveries=0;value='';
 buildWindow();
 taskLabel(1,'ПІДГОТОВКА ДО РОЗДІЛУ');
 setHelp('<span><kbd>UKR / ENG</kbd> перемикання мишкою</span>');
 schedule(120);
}
function reset(){
 active=false;task=0;phase='idle';lastGuide='';clearTimeout(timer);clearTargets();
 win?.remove();win=null;taskBtn?.remove();taskBtn=null;minimized=false;maximized=false;value='';
}

window.addEventListener('keydown',keydown,true);
mon.addEventListener('click',click,true);
window.addEventListener('vidlik:section4-ready',start);
window.addEventListener('vidlik:os-reset',reset);

window.VIDLIK_LANGUAGE_TUTORIAL={start,reset,reconcile,get task(){return task},get phase(){return phase},get active(){return active}};
})();
