'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const keyboard=require('../hotkeys/keyboard-core.js');

const root=path.resolve(__dirname,'..');

assert.equal(keyboard.mode({code:'KeyB',ctrl:true}),'real');
assert.equal(keyboard.mode({code:'KeyP',ctrl:true}),'browser-lock');
assert.equal(keyboard.mode({code:'Tab',alt:true}),'simulation');
assert.equal(keyboard.mode({code:'KeyL',meta:true}),'simulation');
assert.equal(keyboard.matches({code:'KeyL',ctrlKey:true,shiftKey:true,altKey:false,metaKey:false},{code:'KeyL',ctrl:true,shift:true}),true);
assert.equal(keyboard.matches({code:'KeyL',ctrlKey:true,shiftKey:false,altKey:false,metaKey:false},{code:'KeyL',ctrl:true,shift:true}),false);

const html=fs.readFileSync(path.join(root,'hotkeys/desktop-sectors.html'),'utf8');
assert.match(html,/keyboard-core\.js\?v=1[\s\S]*desktop-sectors\.js\?v=11/);
assert.doesNotMatch(html,/module-direct-launch\.js/);
assert.equal(fs.existsSync(path.join(root,'hotkeys/module-direct-launch.js')),false);

for(let sector=1;sector<=8;sector++){
  const name=`sector-${String(sector).padStart(2,'0')}-folder.webp`;
  const size=fs.statSync(path.join(root,'hotkeys/assets/module-briefings',name)).size;
  assert.ok(size<600*1024,`${name} is too large: ${size} bytes`);
}

const briefing=fs.readFileSync(path.join(root,'hotkeys/module-briefing.js'),'utf8');
assert.match(briefing,/\.webp\?v=20260905-1/);
assert.match(briefing,/u\.searchParams\.set\('from','briefing'\)/);
assert.match(briefing,/desktop-sectors\.html\?sector=\$\{sector\}&v=15/);
assert.doesNotMatch(briefing,/directSector=/);
assert.match(briefing,/addEventListener\('pageshow'/);

const source=fs.readFileSync(path.join(root,'hotkeys/desktop-sectors.js'),'utf8');
assert.match(source,/keyboard\.capture\(shell\)/);
assert.match(source,/keyboard\.release\(true\)/);
assert.match(source,/keyboard\.matches\(e,t\)/);
assert.match(source,/document\.addEventListener\('fullscreenchange'/);
assert.match(source,/fullscreenchange'.*pauseLevel\(\)/);
assert.doesNotMatch(source,/fullscreenchange'.*leaveLevel\(\)/);
assert.match(source,/location\.replace\(`module-briefing\.html\?sector=\$\{sector\}`\)/);
assert.match(source,/if\(fromBriefing&&history\.length>1\)\{history\.back\(\);return\}/);
assert.match(source,/async function pauseLevel\(\).*paused=true.*keyboard\.release\(true\)/);
assert.match(source,/if\(e\.code==='Escape'\)\{e\.preventDefault\(\);if\(paused\).*resumeLevel\(\).*else pauseLevel\(\);return\}/);
assert.match(source,/function boot\(\).*directLevel.*start\(directLevel-1\)/);
assert.match(source,/id="ds-briefing">⌂ До папки сектора/);
assert.doesNotMatch(source,/function levels\(\)/);
assert.doesNotMatch(source,/phase='levels'|phase==='levels'/);
assert.doesNotMatch(source,/data-level/);

function runDesktop(search,profile={2:[1,2,3,4]}){
  const listeners={window:{},document:{}},app={innerHTML:''},shell={};
  let replaced='',normalized='';
  const context={
    URLSearchParams,
    performance:{now:()=>1000},
    localStorage:{getItem:key=>key==='vidlik-hotkeys-desktop-sectors-v1'?JSON.stringify(profile):null,setItem(){}},
    location:{search,pathname:'/hotkeys/desktop-sectors.html',href:'',replace:value=>{replaced=value}},
    history:{length:2,replaceState:(_state,_title,value)=>{normalized=value},back(){}},
    document:{
      fullscreenElement:null,
      getElementById:id=>id==='ds-app'?app:null,
      querySelector:selector=>selector==='.ds-shell'?shell:null,
      querySelectorAll:()=>[],
      addEventListener:(type,handler)=>{listeners.document[type]=handler}
    },
    window:{
      VidlikKeyboard:{mode:()=>'real',matches:()=>false,shouldPrevent:()=>false,isModifier:()=>false,capture:async()=>({fullscreen:false,keyboardLock:false}),release:async()=>{}},
      addEventListener:(type,handler)=>{listeners.window[type]=handler}
    },
    setInterval:()=>1,clearInterval(){},setTimeout:()=>1,clearTimeout(){}
  };
  vm.runInNewContext(source,context);
  return{app,listeners,replaced,normalized};
}

const direct=runDesktop('?sector=2&v=15&level=3&from=briefing');
assert.match(direct.app.innerHTML,/РІВЕНЬ 03 · Пошук і посилання/);
assert.doesNotMatch(direct.app.innerHTML,/ds-levels|ds-level-grid|class="ds-level/);
assert.equal(direct.normalized,'/hotkeys/desktop-sectors.html?sector=2&v=15&level=3&from=briefing');
direct.listeners.window.keydown({code:'Escape',preventDefault(){}});
assert.match(direct.app.innerHTML,/class="ds-pause"/);
assert.match(direct.app.innerHTML,/До папки сектора/);

const stale=runDesktop('?v=14&level=3&from=briefing');
assert.match(stale.app.innerHTML,/class="ds-hub"/);
assert.doesNotMatch(stale.app.innerHTML,/ds-levels|ds-level-grid|class="ds-level/);

const pauseEnhancement=fs.readFileSync(path.join(root,'hotkeys/pause-enhancement.js'),'utf8');
assert.match(pauseEnhancement,/До папки сектора/);
assert.match(pauseEnhancement,/location\.replace\('module-briefing\.html\?sector=1'\)/);

console.log('Hotkeys core checks passed.');
