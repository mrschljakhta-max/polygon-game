from pathlib import Path

p = Path('index.html')
s = p.read_text(encoding='utf-8')

if '#mobileGameShell{' not in s:
    s = s.replace('</style>', '''#mobileGameShell{position:fixed;inset:0;z-index:10000;display:none;background:#050505}\n#mobileGameShell.active{display:block}\n#mobileGameFrame{display:block;width:100%;height:100%;border:0;background:#050505}\n</style>''', 1)

if 'id="mobileGameShell"' not in s:
    s = s.replace('<script>\nconst CAMPAIGN_KEY=', '''<div id="mobileGameShell" aria-hidden="true">\n  <iframe id="mobileGameFrame" title="Полігон — рівень" allow="fullscreen; autoplay"></iframe>\n</div>\n<script>\nconst CAMPAIGN_KEY=''', 1)

if 'const MOBILE_GAME=' not in s:
    s = s.replace("const toast=document.getElementById('toast');\n", "const toast=document.getElementById('toast');\nconst mobileGameShell=document.getElementById('mobileGameShell');\nconst mobileGameFrame=document.getElementById('mobileGameFrame');\nconst MOBILE_GAME=window.matchMedia('(pointer: coarse)').matches||/Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);\n", 1)

s = s.replace("function requestGameFullscreen(){\n  const mobileLike=window.matchMedia('(pointer: coarse)').matches||/Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);\n  if(!mobileLike)return;\n", "function requestGameFullscreen(){\n  if(!MOBILE_GAME)return;\n", 1)

old_enter = '''function enterLevel(level){\n  if(changing)return;\n  changing=true;\n  history.replaceState(null,'','#levels');\n  if(reduceMotion){location.href=`game.html?level=${level}`;return}\n  stage.classList.add('to-game');\n  setTimeout(()=>{location.href=`game.html?level=${level}`},470);\n}\n'''
new_enter = '''function openEmbeddedLevel(level){\n  mobileGameFrame.src=`game.html?level=${level}&embedded=1`;\n  mobileGameShell.classList.add('active');\n  mobileGameShell.setAttribute('aria-hidden','false');\n  history.pushState({mobileGame:true,level},'',`#game-${level}`);\n  changing=false;\n}\nfunction closeEmbeddedLevel(fromHistory=false){\n  if(!mobileGameShell.classList.contains('active'))return;\n  mobileGameShell.classList.remove('active');\n  mobileGameShell.setAttribute('aria-hidden','true');\n  mobileGameFrame.src='about:blank';\n  stage.classList.remove('to-game');\n  changing=false;\n  renderProgress();\n  setScreens(true);\n  if(!fromHistory)history.replaceState(null,'','#levels');\n}\nfunction enterLevel(level){\n  if(changing)return;\n  changing=true;\n  if(MOBILE_GAME){\n    requestGameFullscreen();\n    if(reduceMotion){openEmbeddedLevel(level);return}\n    stage.classList.add('to-game');\n    setTimeout(()=>openEmbeddedLevel(level),470);\n    return;\n  }\n  history.replaceState(null,'','#levels');\n  if(reduceMotion){location.href=`game.html?level=${level}`;return}\n  stage.classList.add('to-game');\n  setTimeout(()=>{location.href=`game.html?level=${level}`},470);\n}\n'''
if 'function openEmbeddedLevel(level)' not in s:
    if old_enter not in s:
        raise SystemExit('index enterLevel block not found')
    s = s.replace(old_enter, new_enter, 1)

if 'RX01_GAME_BACK' not in s:
    marker = "window.addEventListener('storage',event=>{if(event.key===CAMPAIGN_KEY)renderProgress()});\n"
    extra = "window.addEventListener('message',event=>{if(event.data&&event.data.type==='RX01_GAME_BACK')closeEmbeddedLevel(false)});\nwindow.addEventListener('popstate',()=>{if(mobileGameShell.classList.contains('active'))closeEmbeddedLevel(true)});\n"
    s = s.replace(marker, marker + extra, 1)

old_boot = "renderProgress();\nif(location.hash==='#levels')showLevelsImmediately();\n"
new_boot = "renderProgress();\nif(/^#game-\\d+$/.test(location.hash))history.replaceState(null,'','#levels');\nif(location.hash==='#levels')showLevelsImmediately();\n"
s = s.replace(old_boot, new_boot, 1)
p.write_text(s, encoding='utf-8')

p = Path('game.html')
g = p.read_text(encoding='utf-8')
g = g.replace('<a class="home" href="./#levels">← РІВНІ</a>', '<a class="home" id="homeLink" href="./#levels">← РІВНІ</a>', 1)

const_game = "const frame=document.getElementById('frame'),trans=document.getElementById('transition'),trSmall=document.getElementById('trSmall'),trBig=document.getElementById('trBig');\n"
if 'const embedded=' not in g:
    embedded = "const embedded=new URLSearchParams(location.search).get('embedded')==='1'&&window.parent!==window;\nconst homeLink=document.getElementById('homeLink');\nhomeLink.addEventListener('click',event=>{\n  if(!embedded)return;\n  event.preventDefault();\n  try{window.parent.postMessage({type:'RX01_GAME_BACK'},'*')}catch(e){}\n});\n"
    g = g.replace(const_game, const_game + embedded, 1)

g = g.replace("function requestGameplayFullscreen(){\n  const mobileLike=window.matchMedia('(pointer: coarse)').matches||/Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);\n", "function requestGameplayFullscreen(){\n  if(embedded)return;\n  const mobileLike=window.matchMedia('(pointer: coarse)').matches||/Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);\n", 1)
g = g.replace("function armFrameFullscreen(){\n  try{\n", "function armFrameFullscreen(){\n  if(embedded)return;\n  try{\n", 1)
p.write_text(g, encoding='utf-8')
