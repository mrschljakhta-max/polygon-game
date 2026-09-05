'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const keyboard=require('../hotkeys/keyboard-core.js');

const root=path.resolve(__dirname,'..');

assert.equal(keyboard.mode({code:'KeyB',ctrl:true}),'real');
assert.equal(keyboard.mode({code:'KeyP',ctrl:true}),'browser-lock');
assert.equal(keyboard.mode({code:'Tab',alt:true}),'simulation');
assert.equal(keyboard.mode({code:'KeyL',meta:true}),'simulation');
assert.equal(keyboard.matches({code:'KeyL',ctrlKey:true,shiftKey:true,altKey:false,metaKey:false},{code:'KeyL',ctrl:true,shift:true}),true);
assert.equal(keyboard.matches({code:'KeyL',ctrlKey:true,shiftKey:false,altKey:false,metaKey:false},{code:'KeyL',ctrl:true,shift:true}),false);

const html=fs.readFileSync(path.join(root,'hotkeys/desktop-sectors.html'),'utf8');
assert.match(html,/keyboard-core\.js\?v=1[\s\S]*desktop-sectors\.js\?v=10/);

for(let sector=1;sector<=8;sector++){
  const name=`sector-${String(sector).padStart(2,'0')}-folder.webp`;
  const size=fs.statSync(path.join(root,'hotkeys/assets/module-briefings',name)).size;
  assert.ok(size<600*1024,`${name} is too large: ${size} bytes`);
}

const briefing=fs.readFileSync(path.join(root,'hotkeys/module-briefing.js'),'utf8');
assert.match(briefing,/\.webp\?v=20260905-1/);
assert.match(briefing,/u\.searchParams\.set\('from','briefing'\)/);
assert.match(briefing,/addEventListener\('pageshow'/);

const source=fs.readFileSync(path.join(root,'hotkeys/desktop-sectors.js'),'utf8');
assert.match(source,/keyboard\.capture\(shell\)/);
assert.match(source,/keyboard\.release\(true\)/);
assert.match(source,/keyboard\.matches\(e,t\)/);
assert.match(source,/document\.addEventListener\('fullscreenchange'/);
assert.match(source,/fullscreenchange'.*leaveLevel\(\)/);
assert.doesNotMatch(source,/fullscreenchange'.*paused=true/);
assert.match(source,/location\.replace\(`module-briefing\.html\?sector=\$\{sector\}`\)/);
assert.match(source,/if\(fromBriefing&&history\.length>1\)\{history\.back\(\);return\}/);
assert.doesNotMatch(source,/async function leaveLevel\(\).*phase='levels'/);
assert.match(source,/if\(e\.code==='Escape'\)\{e\.preventDefault\(\);leaveLevel\(\);return\}/);
assert.doesNotMatch(source,/if\(paused\)\{if\(e\.code==='Escape'/);

console.log('Hotkeys core checks passed.');
