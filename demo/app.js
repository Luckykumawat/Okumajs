'use strict';
const $=id=>document.getElementById(id);
const CDN_URL='https://cdn.jsdelivr.net/npm/okumajs@0.3.0/dist/flowfx.min.js';
const EXAMPLE_ASSETS='https://cdn.jsdelivr.net/gh/Luckykumawat/Okumajs@v0.3.0/demo/assets/';
const effects=[
  ['Liquid silk','Soft currents. A surface that follows you.','dunes'],
  ['Vortex distortion','A magnetic swirl around your pointer.','tide'],
  ['Elastic terrain','A subdivided mesh with real vertex depth.','violet'],
  ['Wind sculpture','An anchored edge. A wind-swept surface.','dunes'],
  ['Radial ripple','Concentric waves through a quiet landscape.','ember'],
  ['Perlin drift','Layered gradient noise. Organic displacement.','tide'],
  ['Cyber mosaic','Quantized motion meets a luminous grid.','violet']
];
const followerCardStates=new Map(),followerEditors=new Map();
const presetKeys=['liquid-silk','vortex-distortion','elastic-terrain','wind-sculpture','radial-ripple','perlin-drift','cyber-mosaic'];
const mainDesign={hoverMotion:'tilt',transition:'liquid'};
let main,paused=false,toastTimer;
const initial={intensity:.85,speed:.9,frequency:5,zoom:.5,chromatic:.7,damping:7,edgeStrength:1};
const base={...initial};
function toast(message){$('toast').textContent=message;$('toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').classList.remove('show'),3000);}
function settings(){const config={...base};for(const key of ['intensity','speed','frequency','chromatic'])config[key]=Number($(key).value);config.zoom=$('zoom').checked?(base.zoom||.5):0;return {...mainDesign,style:Number($('effect').value),gooey:$('gooey').checked,hoverEdge:$('hover-edge').value,config};}
function imageCode(options,key='gallery',single=false,customSources=null){
 const className='okuma-'+key;
 const {frameColor='#e9ece2',frameEnabled=false,...effectOptions}=options;
 const frameStart=frameEnabled?`<div style="background:${frameColor};padding:6px;border-radius:6px;width:min(100%,800px);${options.scroll?'margin:70vh auto;':''}">\n`:'';
 const frameEnd=frameEnabled?'\n</div>':'';
 const escapeAttribute=value=>String(value).replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;');
 const sources=(customSources??(single?['dunes']:['dunes','violet','tide']).map(name=>({src:EXAMPLE_ASSETS+name+'.svg',alt:name+' landscape'}))).map((image,i)=>`  <img src="${escapeAttribute(image.src)}" alt="${escapeAttribute(image.alt)}"\n       style="${i?'display:none':'display:block;width:100%;height:100%;object-fit:cover'}">`).join('\n');
 return `<!-- Include the CDN script once per page. Replace image URLs with yours.${customSources?' Copy your uploaded files into the assets/ folder beside this HTML. Local preview images are not hosted.':''} -->\n<script src="${CDN_URL}"><\/script>\n\n${frameStart}<div class="${className}" tabindex="0"\n     aria-label="Interactive image gallery"\n     style="width:${frameEnabled?'100%':'min(100%,800px)'};height:480px;${options.scroll&&!frameEnabled?'margin:70vh auto;':''}">\n${sources}\n</div>${frameEnd}\n\n<script>\n(() => {\n  const fx = FlowFX.imageEffect(".${className}", ${JSON.stringify(effectOptions,null,2).replace(/\n/g,'\n  ')});\n  fx.ready.catch(console.error);\n  // Call fx.destroy() when removing this gallery.\n})();\n<\/script>`;
}
function localCode(){return imageCode(settings(),'playground');}
function sync(){const options=settings();main?.setOptions(options);$('effect-title').textContent=effects[options.style-1][0];$('style-number').textContent=String(options.style).padStart(2,'0');for(const key of ['intensity','speed','frequency','chromatic'])$(key+'-value').value=Number($(key).value).toFixed(2);$('install-code').textContent=localCode();$('design-summary').textContent=`HOVER / ${mainDesign.hoverMotion.toUpperCase()} · CLICK / ${mainDesign.transition.toUpperCase()}`;}
function applyImagePreset(preset){Object.assign(base,initial,preset.config);Object.assign(mainDesign,{hoverMotion:preset.hoverMotion??'none',transition:preset.transition??'liquid'});$('effect').value=String(preset.style);$('hover-edge').value=preset.hoverEdge??'none';$('gooey').checked=!!preset.gooey;$('zoom').checked=(base.zoom??0)>0;for(const key of ['intensity','speed','frequency','chromatic'])$(key).value=String(base[key]);sync();}
async function copy(value){try{await navigator.clipboard.writeText(value);toast('Copied. Make something move.');return true;}catch{const area=document.createElement('textarea');area.value=value;document.body.append(area);area.select();const ok=document.execCommand('copy');area.remove();toast(ok?'Copied to clipboard.':'Clipboard unavailable. Use the example below.');return ok;}}
function download(value,name){const url=URL.createObjectURL(new Blob([value],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
function failed(error){console.error(error);$('render-status').textContent='STATIC FALLBACK';$('motion-note').textContent='WebGL could not start. Original images remain visible. '+error.message;toast('WebGL unavailable — showing original images.');}
async function init(){
  try{
    main=FlowFX.imageEffect('#main-stage',{...settings(),onProgress:p=>{$('image-index').textContent=`${String(Math.min(3,Math.round(p*2)+1)).padStart(2,'0')} / 03`;}});
    await main.ready;$('render-status').textContent='WEBGL / READY';
  }catch(error){failed(error);}
  const grid=$('effect-grid');
  effects.forEach(([name,description,asset],i)=>{
    const card=document.createElement('article');card.className='effect-card';
    card.innerHTML=`<div class="effect-image" id="effect-${i+1}" tabindex="0" role="button" aria-label="${name}. Hover to reshape edges. Click or press Enter for next image."><img src="assets/${asset}.svg" alt="Original ${asset} artwork" width="1200" height="900"><img src="assets/${asset==='ember'?'tide':'ember'}.svg" width="1200" height="900" alt="Alternate landscape"><img src="assets/${asset==='violet'?'dunes':'violet'}.svg" width="1200" height="900" alt="Third landscape"><div class="effect-card-top"><span>F / ${String(i+1).padStart(3,'0')}</span><span id="card-index-${i+1}">01 / 03</span></div></div><div class="card-info"><div><h3>${name}</h3><p>${description}</p></div><div class="card-actions"><button aria-label="Open ${name} in playground">↗</button><button data-copy aria-label="Copy ${name} preset">Copy</button></div></div>`;
    grid.append(card);
    card.querySelector('button').addEventListener('click',()=>{applyImagePreset(design);$('playground').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});toast(`${name} loaded in playground`);});
    card.querySelector('[data-copy]').addEventListener('click',()=>copy(imageCode(design,presetKeys[i])));
    const design=structuredClone(FlowFX.imagePresets[presetKeys[i]]);card.querySelector('.card-info p').textContent+=` Hover: ${design.hoverMotion} · Click: ${design.transition}`;
    try{const fx=FlowFX.imageEffect(`#effect-${i+1}`,{...design,onProgress:p=>{$('card-index-'+(i+1)).textContent=String(Math.round(p*2)+1).padStart(2,'0')+' / 03';}});mountImageEditor(card,fx,design,presetKeys[i],name,'#effect-'+(i+1));fx.ready.catch(error=>console.warn(name,error));}catch(error){console.warn(error);}
  });
  initNewStudies();
  syncCategoryFromHash(false);
  try{
    const scroller=FlowFX.imageEffect('#scroll-stage',{style:'wobble',gooey:true,click:false,config:{intensity:.65,zoom:0},onProgress:p=>{$('scroll-percent').textContent=Math.round(p*100)+'%';$('scroll-bar').style.width=p*100+'%';}});
    const galleryDesign={style:'wobble',gooey:true,scroll:true,click:false,config:{intensity:.65,speed:1,zoom:0}};
    const galleryEditor=document.createElement('div');galleryEditor.className='gallery-editor';document.querySelector('.scroll-layout').before(galleryEditor);
    mountImageEditor(galleryEditor,scroller,galleryDesign,'scroll-gallery','Scroll gallery','#scroll-stage');
    $('copy-scroll-gallery').onclick=()=>copy(imageCode(galleryDesign,'scroll-gallery'));
    await scroller.ready;
    const timeline=()=>{const rect=document.querySelector('.scroll-layout').getBoundingClientRect();const stage=$('scroll-stage').getBoundingClientRect();const travel=rect.height-stage.height-80;scroller.setProgress(Math.max(0,Math.min(1,(40-rect.top)/Math.max(1,travel))));};
    window.addEventListener('scroll',timeline,{passive:true});window.addEventListener('resize',timeline);timeline();
  }catch(error){console.warn('Scroll example:',error);}
}
$('effect').addEventListener('input',()=>applyImagePreset(FlowFX.imagePresets[presetKeys[Number($('effect').value)-1]]));
for(const id of ['hover-edge','intensity','speed','frequency','chromatic','gooey','zoom'])$(id).addEventListener('input',sync);
$('next').addEventListener('click',()=>main?.next());$('previous').addEventListener('click',()=>main?.previous());
$('pause').addEventListener('click',()=>{paused=!paused;main?.[paused?'pause':'play']();$('pause').textContent=paused?'▶ Play':'Ⅱ Pause';});
$('reset').addEventListener('click',()=>{Object.assign(base,initial);Object.assign(mainDesign,{hoverMotion:'tilt',transition:'liquid'});$('effect').value='1';$('hover-edge').value='wave';for(const key of ['intensity','speed','frequency','chromatic'])$(key).value=String(base[key]);$('gooey').checked=true;$('zoom').checked=true;main?.setProgress(0);if(paused)$('pause').click();sync();toast('Back to the first current.');});

$('copy-code').addEventListener('click',()=>copy(localCode()));$('copy-install').addEventListener('click',()=>copy(localCode()));
$('export').addEventListener('click',()=>download(JSON.stringify(main?.exportPreset()??{version:1,...settings()},null,2),'flowfx-preset.json'));
$('import').addEventListener('click',()=>$('preset-file').click());
$('preset-file').addEventListener('change',async event=>{
  try{
    const file=event.target.files[0];if(!file)return;
    const preset=JSON.parse(await file.text());
    if(preset.version!==1||!Number.isInteger(preset.style)||preset.style<1||preset.style>7||!preset.config)throw new Error('Expected a FlowFX v1 preset.');
    // Validate before changing any controls.
    if(preset.hoverEdge!==undefined&&!['none','wave','blob','scallop','diamond','curtain','cut','orbit'].includes(preset.hoverEdge))throw new Error('Invalid hover edge.');
    if(preset.hoverMotion!==undefined&&!['none','tilt','swirl','fold','lift','ripple','stretch','glitch'].includes(preset.hoverMotion))throw new Error('Invalid hover motion.');
    if(preset.transition!==undefined&&!['liquid','radial','ribbon','slide','zoom','diagonal','pixel'].includes(preset.transition))throw new Error('Invalid transition.');
    const ranges={edgeStrength:[0,2],intensity:[0,2],speed:[0,3],frequency:[1,15],chromatic:[0,2],zoom:[0,2],damping:[1,20]};
    for(const [key,[min,max]] of Object.entries(ranges))if(preset.config[key]!==undefined&&(typeof preset.config[key]!=='number'||!Number.isFinite(preset.config[key])||preset.config[key]<min||preset.config[key]>max))throw new Error(`Invalid ${key}.`);
    $('effect').value=String(preset.style);$('hover-edge').value=preset.hoverEdge??'none';$('gooey').checked=!!preset.gooey;$('zoom').checked=(preset.config.zoom??.5)>0;
    for(const key of ['intensity','speed','frequency','chromatic'])$(key).value=String(preset.config[key]??base[key]);
    Object.assign(mainDesign,{hoverMotion:preset.hoverMotion??'none',transition:preset.transition??'liquid'});Object.assign(base,preset.config);sync();toast('Preset imported. Your current, your rules.');
  }catch(error){toast('Could not import: '+error.message);}finally{event.target.value='';}
});
const query=matchMedia('(prefers-reduced-motion: reduce)');
function motionNote(){if(query.matches)$('motion-note').textContent='Reduced motion enabled. Distortion is off; image navigation still works.';else $('motion-note').textContent='Try hovering, clicking, or adjusting a slider.';}
query.addEventListener('change',motionNote);motionNote();sync();
function initNewStudies(){
  const edgeNames=[['wave','Tidal edges','Four sides become a moving shoreline.','dunes'],['blob','Living silhouette','A rectangle softens into an organic form.','violet'],['scallop','Scalloped frame','Rhythmic cutouts travel around the edge.','tide']];
  for(const [mode,name,description,asset] of edgeNames){
    const card=document.createElement('article');card.className='edge-card';
    card.innerHTML=`<div class="edge-surface" id="edge-${mode}" tabindex="0" role="button" aria-label="${name}. Hover to morph edges, click for next image."><img src="assets/${asset}.svg" width="1200" height="900" alt="${asset} landscape"><img src="assets/ember.svg" width="1200" height="900" alt="Ember landscape"><img src="assets/${asset==='tide'?'violet':'tide'}.svg" width="1200" height="900" alt="Another landscape"></div><div class="edge-card-caption"><h3>${name}</h3><span id="edge-index-${mode}">01 / 03</span></div><p>${description}</p><span class="study-hint">HOVER TO RESHAPE · CLICK TO CHANGE</span><button class="quiet edge-copy">Copy this card ↗</button>`;
    $('edge-grid').append(card);
    const design=structuredClone(FlowFX.imagePresets[{'wave':'tidal-edges','blob':'living-silhouette','scallop':'scalloped-frame'}[mode]]);
    card.querySelector('button.edge-copy').addEventListener('click',()=>copy(imageCode(design,'edge-'+mode)));
    try{const fx=FlowFX.imageEffect('#edge-'+mode,{...design,onProgress:p=>{$('edge-index-'+mode).textContent=String(Math.round(p*2)+1).padStart(2,'0')+' / 03';}});mountImageEditor(card,fx,design,'edge-'+mode,name,'#edge-'+mode);fx.ready.catch(console.warn);}catch(error){console.warn(error);}
  }
  const definitions=[
    ['depth','Depth dolly','A perspective shear, a slow push inward, and a drifting texture.','dunes',3],
    ['ribbon','Ribbon twist','The image bends into a sculpted ribbon as your scroll moves through it.','violet',4],
    ['shutter','Staggered shutters','Twelve strips peel open at different speeds to reveal the landscape.','ember',6],
    ['lens','Portal lens','A small aperture opens into a full image through a warped, magnifying lens.','tide',1]
  ];
  for(const [mode,name,description,asset,style] of definitions){
    const section=document.createElement('article');section.className='scroll-study';section.id='study-'+mode;
    section.innerHTML=`<div class="study-sticky"><div class="study-copy"><span class="eyebrow">SCROLL STUDY / ${mode.toUpperCase()}</span><h3>${name}</h3><p>${description}</p><span class="study-hint">↓ SCROLL TO PLAY · ↑ SCROLL TO REVERSE</span><div class="study-meter"><span id="study-bar-${mode}"></span></div><output id="study-percent-${mode}" aria-label="${name} progress">0%</output><button class="quiet study-code" data-mode="${mode}">Copy this effect ↗</button></div><div class="study-surface" id="study-surface-${mode}" tabindex="0" aria-label="${name}, a scroll-controlled image"><img src="assets/${asset}.svg" width="1200" height="900" alt="${asset} landscape with ${name} effect"></div></div>`;
    $('scroll-studies').append(section);
    const options={style,scrollEffect:mode,hoverEdge:{depth:'diamond',ribbon:'curtain',shutter:'cut',lens:'orbit'}[mode],hoverMotion:{depth:'tilt',ribbon:'fold',shutter:'glitch',lens:'swirl'}[mode],click:false,config:{intensity:.55,zoom:0,damping:9}};
    section.querySelector('button').addEventListener('click',()=>copy(imageCode({...options,scroll:true},'scroll-'+mode,true)));
    try{
      const fx=FlowFX.imageEffect('#study-surface-'+mode,{...options,onProgress:p=>{$('study-percent-'+mode).value=Math.round(p*100)+'%';$('study-bar-'+mode).style.width=p*100+'%';}});
      mountImageEditor(section.querySelector('.study-copy'),fx,options,'scroll-'+mode,name,'#study-surface-'+mode,true);
      const timeline=()=>{const r=section.getBoundingClientRect();const span=Math.max(1,r.height-window.innerHeight*.25);fx.setProgress(Math.max(0,Math.min(1,(window.innerHeight*.55-r.top)/span)));};
      fx.ready.then(timeline).catch(console.warn);
      window.addEventListener('scroll',timeline,{passive:true});window.addEventListener('resize',timeline);timeline();
    }catch(error){console.warn(error);}
  }
}


let pageFollower, selectedFollower='aura';
const followerPreviews=[];
const followerDescriptions={aura:'A soft radial glow and elastic mint ring.',orbit:'Three rotating orbits with satellite particles.',comet:'A tapered coral trail with a glowing solar head.',ribbon:'Two electric strands weaving through your path.',magnetic:'A velocity-stretched ring with four magnetic poles.',fireflies:'Eight luminous motes with individual flight paths.',pixel:'Grid-snapped candy blocks with a stepped trail.',ink:'Overlapping navy droplets that pool into a brush.',compass:'A directional diamond, north marker and compass ring.',text:'Rotating rose lettering orbiting your pointer.'};
function followerOptions(style=selectedFollower){return {...(followerCardStates.get(style)??{style,...FlowFX.followerStyles[style],size:32,speed:12})};}
function followerCode(options=followerOptions()){return `<!-- Include the CDN script once per page. -->\n<script src="${CDN_URL}"><\/script>\n<script>\n  window.okumaCursor?.destroy();\n  window.okumaCursor = FlowFX.mouseFollower(${JSON.stringify(options,null,2)});\n  // Remove later: window.okumaCursor.destroy();\n<\/script>`;}
function syncFollower(){const state=followerCardStates.get(selectedFollower);if(state&&pageFollower){state.color=$('follower-color').value;state.size=Number($('follower-size').value);pageFollower.setOptions(state);followerEditors.get(selectedFollower)?.apply();followerEditors.get(selectedFollower)?.refresh();} $('follower-code').textContent=followerCode();}
function stopFollower(){pageFollower?.destroy();pageFollower=undefined;for(const preview of followerPreviews)preview.setEnabled(true);$('follower-status').textContent='CARD PREVIEWS · NATIVE POINTER ON';for(const el of document.querySelectorAll('.follower-use')){el.setAttribute('aria-pressed','false');el.textContent='Use on page ↗';}for(const id of ['follower-color','follower-size','stop-follower'])$(id).disabled=true;}
function initFollowers(){
 for(const [i,[style,palette]] of Object.entries(FlowFX.followerStyles).entries()){
  const card=document.createElement('article');card.className='follower-card';card.dataset.style=style;card.style.setProperty('--follower-color',palette.color);
  card.innerHTML=`<div class="follower-preview ${style==='ink'?'on-paper':''}" id="follower-preview-${style}" aria-label="${palette.name} mouse follower preview"><span class="follower-number">CURSOR / ${String(i+1).padStart(2,'0')}</span><span class="follower-stage-label">${style==='text'?'READ THE ROOM':'MAKE YOUR MARK'}</span><span class="follower-touch-hint">MOVE YOUR MOUSE HERE</span></div><div class="follower-card-info"><h3>${palette.name}</h3><span class="follower-swatch" style="background:${palette.color}"></span><p>${followerDescriptions[style]}</p><div class="follower-actions"><button class="follower-use" aria-pressed="false" aria-label="Use ${palette.name} on page">Use on page ↗</button><button class="follower-copy" aria-label="Copy ${palette.name} code">Copy code</button></div></div>`;
  $('follower-grid').append(card);
  const state={style,color:palette.color,accent:palette.accent,size:style==='text'?38:32,speed:12};followerCardStates.set(style,state);
  const preview=FlowFX.mouseFollower({...state,target:'#follower-preview-'+style,idleAnimation:true});followerPreviews.push(preview);
  followerEditors.set(style,mountFollowerEditor(card,preview,state,palette.name));
  card.querySelector('.follower-use').addEventListener('click',()=>{
    stopFollower();selectedFollower=style;$('follower-color').value=state.color;$('follower-size').value=String(state.size);
    pageFollower=FlowFX.mouseFollower(followerOptions(style));for(const p of followerPreviews)p.setEnabled(false);
    $('follower-status').textContent=palette.name.toUpperCase()+' · ACTIVE ON PAGE';for(const id of ['follower-color','follower-size','stop-follower'])$(id).disabled=false;
    card.querySelector('.follower-use').setAttribute('aria-pressed','true');card.querySelector('.follower-use').textContent='Active on page ✓';syncFollower();toast(palette.name+' is following you.');
  });
  card.querySelector('.follower-copy').addEventListener('click',()=>copy(followerCode(followerOptions(style))));
 }
 $('stop-follower').addEventListener('click',()=>{stopFollower();syncFollower();});$('follower-color').addEventListener('input',syncFollower);$('follower-size').addEventListener('input',syncFollower);$('copy-follower').addEventListener('click',()=>copy(followerCode()));syncFollower();
}



// One category panel stays visible; hidden canvases stop rendering naturally.
const categoryNames={hover:'IMAGE EFFECTS','mouse-followers':'CURSOR EFFECTS','scroll-animations':'SCROLL STUDIES','get-started':'INTEGRATION & PUBLISHING'};
function categoryForHash(hash){
 const key=hash.replace(/^#/,'');
 if(key==='categories')return document.querySelector('[role="tab"][aria-selected="true"]')?.dataset.category??'hover';
 if(['mouse-followers','followers'].includes(key))return 'mouse-followers';
 if(['scroll-animations','scroll-lab','scroll'].includes(key)||key.startsWith('study-'))return 'scroll-animations';
 if(['get-started','install'].includes(key))return 'get-started';
 return 'hover';
}
function showCategory(key,{updateURL=false,scroll=true,anchor=''}={}){
 if(!Object.hasOwn(categoryNames,key))return;
 for(const button of document.querySelectorAll('[role="tab"][data-category]')){
   const selected=button.dataset.category===key;button.setAttribute('aria-selected',String(selected));button.tabIndex=selected?0:-1;
   document.getElementById(button.getAttribute('aria-controls')).hidden=!selected;
 }
 $('category-current').textContent=categoryNames[key];
 if(updateURL&&location.hash!=='#'+key)history.pushState(null,'','#'+key);
 // Notify both renderers and scroll timelines after layout changes.
 window.dispatchEvent(new Event('resize'));
 if(scroll)requestAnimationFrame(()=>{
   const target=anchor?document.getElementById(anchor):null;
   (target??$('categories')).scrollIntoView({behavior:'instant',block:'start'});
 });
}
function syncCategoryFromHash(scroll=true){
 const anchor=decodeURIComponent(location.hash.slice(1));showCategory(categoryForHash(location.hash),{scroll,anchor});
}
function initCategories(){
 // Set up before async texture loading, so only the requested panel is shown.
 const buttons=[...document.querySelectorAll('[role="tab"][data-category]')];
 for(const button of buttons){
  button.addEventListener('click',()=>showCategory(button.dataset.category,{updateURL:true}));
  button.addEventListener('keydown',event=>{
   const index=buttons.indexOf(button);let next;
   if(event.key==='ArrowRight')next=(index+1)%buttons.length;
   if(event.key==='ArrowLeft')next=(index-1+buttons.length)%buttons.length;
   if(event.key==='Home')next=0;if(event.key==='End')next=buttons.length-1;
   if(next!==undefined){event.preventDefault();buttons[next].focus();showCategory(buttons[next].dataset.category,{updateURL:true});}
  });
 }
 window.addEventListener('hashchange',()=>syncCategoryFromHash());
 window.addEventListener('popstate',()=>syncCategoryFromHash());
}



let customizerIndex=0;
function customizationPanel(host,name,state,{speedMax=3,speedMin=0,readIntensity,applyIntensity,code,apply,reset,preview}){
 const panel=document.createElement('section');panel.className='card-customizer';panel.id='customize-panel-'+(++customizerIndex);panel.hidden=true;panel.setAttribute('aria-label',name+' live customization');
 panel.innerHTML=`<div class="customizer-heading"><span>LIVE CUSTOMIZATION</span><span class="live-dot">LIVE</span></div><label class="card-control"><span>Speed <output data-value="speed"></output></span><input data-setting="speed" type="range" min="${speedMin}" max="${speedMax}" step="0.05" aria-label="${name} speed"></label><label class="card-control"><span>Intensity <output data-value="intensity"></output></span><input data-setting="intensity" type="range" min="0" max="2" step="0.05" aria-label="${name} intensity"></label><label class="card-color"><span>${state.config?'Frame color':'Color'} <output data-value="color"></output></span><input data-setting="color" type="color" aria-label="${name} color"></label><details class="card-code" open><summary>Code preview <span>HTML + CDN + JS</span></summary><pre><code></code></pre></details><div class="customizer-actions"><button data-copy-custom>Copy my settings ↗</button><button data-reset-custom>Reset</button></div>`;
 const toggle=document.createElement('button');toggle.className='customize-toggle';toggle.textContent='Customize';toggle.setAttribute('aria-label','Customize '+name);toggle.setAttribute('aria-expanded','false');toggle.setAttribute('aria-controls',panel.id);
 const settingsArea=document.createElement('div');settingsArea.className='modal-settings';
 const codeArea=document.createElement('div');codeArea.className='modal-code';
 for(const child of [...panel.children]){(child.matches('.card-code,.customizer-actions')?codeArea:settingsArea).append(child);}
 panel.append(settingsArea,codeArea);
 host.append(toggle,panel);
 const home=document.createComment('customizer home');panel.before(home);
 function setOpen(open){if(open)openCustomizer({panel,toggle,home,name,preview});else if(activeCustomizer?.panel===panel)closeCustomizer();}
 toggle.addEventListener('click',()=>setOpen(panel.hidden));
 panel.addEventListener('keydown',event=>{if(event.key==='Escape'){event.preventDefault();setOpen(false);}});
 const controls=Object.fromEntries([...panel.querySelectorAll('[data-setting]')].map(el=>[el.dataset.setting,el]));
 function refresh(){
  const speed=state.config?state.config.speed:state.speed;
  controls.speed.value=String(speed);controls.intensity.value=String(readIntensity());controls.color.value=state.frameColor??state.color;
  panel.querySelector('[data-value="speed"]').value=Number(speed).toFixed(2);
  panel.querySelector('[data-value="intensity"]').value=Number(readIntensity()).toFixed(2);
  panel.querySelector('[data-value="color"]').value=controls.color.value.toUpperCase();
  panel.querySelector('code').textContent=code();
  if(activeCustomizer?.panel===panel)updateModalPreview();
 }
 for(const [key,control] of Object.entries(controls))control.addEventListener('input',()=>{
  if(key==='speed'){if(state.config)state.config.speed=Number(control.value);else state.speed=Number(control.value);}
  if(key==='intensity')applyIntensity(Number(control.value));
  if(key==='color'){if(state.config){state.frameColor=control.value;state.frameEnabled=true;}else state.color=control.value;}
  apply();refresh();
 });
 panel.querySelector('[data-copy-custom]').addEventListener('click',async event=>{const button=event.currentTarget;const ok=await copy(code());button.textContent=ok?'Copied ✓':'Select code above';setTimeout(()=>button.textContent='Copy my settings ↗',2000);});
 panel.querySelector('[data-reset-custom]').addEventListener('click',()=>{reset();apply();refresh();});refresh();
 return {panel,refresh,toggle};
}
function mountImageEditor(host,fx,state,key,name,selector,single=false){
 state.config={speed:1,intensity:.8,...state.config};state.frameColor='#e9ece2';state.frameEnabled=false;
 const original=structuredClone(state),target=document.querySelector(selector),originalBackground=target.style.background;
 let uploadedImages=null,uploadRevision=0;
 let frame;
 const apply=()=>{
  fx.setOptions({config:state.config});
  if(state.frameEnabled){
   if(!frame){frame=document.createElement('div');frame.className='custom-image-frame';target.before(frame);frame.append(target);}
   frame.style.background=state.frameColor;target.style.background=state.frameColor;
  }else if(frame){frame.replaceWith(target);frame=null;target.style.background=originalBackground;}
 };
 const editor=customizationPanel(host,name,state,{readIntensity:()=>state.config.intensity,applyIntensity:n=>state.config.intensity=n,code:()=>imageCode({...state,scroll:single||state.scroll},key,single,uploadedImages?.map(image=>({src:image.path,alt:image.alt}))),apply,reset:()=>{for(const k of Object.keys(state))delete state[k];Object.assign(state,structuredClone(original));},preview:()=>{const {frameColor,frameEnabled,...options}=state;return {kind:'image',options,sources:uploadedImages??[...target.querySelectorAll('img')].map(img=>({src:img.currentSrc||img.src,alt:img.alt})),frameEnabled,frameColor:frameEnabled?frameColor:'#e9ece2',scrubbable:!!(options.scroll||options.scrollEffect)};}});
 editor.panel.querySelector('.modal-settings').insertAdjacentHTML('afterbegin',`<div class="image-upload"><label>Try your images<input type="file" accept="image/png,image/jpeg,image/webp,image/gif,image/avif" multiple aria-label="Upload images for ${name}"></label><p class="customizer-note">Choose up to 8 JPG, PNG, WebP, GIF or AVIF images (10 MB each). Images stay in your browser. Use several images for click transitions.</p><p class="upload-status" role="status">Using demo images.</p><button type="button" data-restore-images hidden>Restore demo images</button></div><p class="customizer-note">Color changes the frame and visible edge cutouts.</p>`);
 const input=editor.panel.querySelector('input[type=file]'),status=editor.panel.querySelector('.upload-status'),restore=editor.panel.querySelector('[data-restore-images]');
 input.addEventListener('change',async()=>{
  const files=[...input.files];if(!files.length)return;const revision=++uploadRevision;
  if(files.length>8||files.some(file=>!/^image\/(png|jpeg|webp|gif|avif)$/.test(file.type)||file.size>10*1024*1024)){status.textContent='Choose up to 8 supported images, each 10 MB or smaller.';input.value='';return;}
  status.textContent='Loading your images…';
  try{
   const images=await Promise.all(files.map(async(file,index)=>{
    const src=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=reject;reader.readAsDataURL(file);});
    const image=new Image();image.src=src;await image.decode();
    const safeName=file.name.replace(/[^a-zA-Z0-9._-]/g,'_')||'image';
    return {src,alt:file.name,path:'assets/'+String(index+1).padStart(2,'0')+'-'+safeName};
   }));
   if(revision!==uploadRevision)return;uploadedImages=images;restore.hidden=false;
   status.textContent=images.length+' image'+(images.length===1?'':'s')+' loaded. Copy these files to the assets/ paths shown in the code.';editor.refresh();
  }catch(error){if(revision===uploadRevision)status.textContent='Could not read an image. Try another file; your previous preview is kept.';}
  finally{if(revision===uploadRevision)input.value='';}
 });
 restore.addEventListener('click',()=>{uploadRevision++;uploadedImages=null;input.value='';restore.hidden=true;status.textContent='Using demo images.';editor.refresh();});
 return editor;
}
function mountFollowerEditor(host,preview,state,name){
 const original=structuredClone(state),baseSize=state.size;
 const apply=()=>{preview.setOptions(state);host.querySelector('.follower-swatch').style.background=state.color;if(pageFollower&&selectedFollower===state.style){pageFollower.setOptions(state);$('follower-color').value=state.color;$('follower-size').value=String(state.size);} $('follower-code').textContent=followerCode();};
 const editor=customizationPanel(host,name,state,{speedMin:1,speedMax:30,readIntensity:()=>state.size/baseSize,applyIntensity:n=>state.size=Math.max(12,baseSize*n),code:()=>followerCode(state),apply,reset:()=>Object.assign(state,original),preview:()=>({kind:'follower',options:{...state},scrubbable:false})});
 editor.apply=apply;editor.panel.querySelector('.modal-settings').insertAdjacentHTML('afterbegin','<p class="customizer-note">Intensity controls size and spread; speed controls follow response.</p>');return editor;
}


let activeCustomizer=null,customizerDialog=null,modalUI=null,previewReady=false,modalId=0,previousOverflow='';
function ensureCustomizerDialog(){
 if(customizerDialog)return;
 const dialog=document.createElement('dialog');dialog.className='customizer-dialog';dialog.setAttribute('aria-labelledby','customizer-title');dialog.setAttribute('aria-modal','true');
 dialog.innerHTML=`<header class="customizer-dialog-header"><div><span class="eyebrow">LIVE ANIMATION STUDIO</span><h2 id="customizer-title"></h2></div><button data-close-customizer aria-label="Close customization" autofocus>×</button></header><div class="modal-layout"><section class="modal-preview-pane"><h3>Live preview <span class="live-dot">LIVE</span></h3><iframe title="Live animation preview" class="modal-preview-frame"></iframe><p class="modal-preview-status" role="status">Loading preview…</p><label class="modal-scrub" hidden>Scroll progress <output>50%</output><input type="range" min="0" max="1" step="0.01" value="0.5" aria-label="Preview scroll progress"></label></section><div class="modal-editor-mount"></div></div>`;
 document.body.append(dialog);customizerDialog=dialog;
 modalUI={frame:dialog.querySelector('iframe'),mount:dialog.querySelector('.modal-editor-mount'),title:dialog.querySelector('h2'),status:dialog.querySelector('.modal-preview-status'),scrub:dialog.querySelector('.modal-scrub'),progress:dialog.querySelector('.modal-scrub input'),output:dialog.querySelector('.modal-scrub output')};
 dialog.querySelector('[data-close-customizer]').addEventListener('click',closeCustomizer);
 dialog.addEventListener('cancel',event=>{event.preventDefault();closeCustomizer();});
 dialog.addEventListener('click',event=>{const r=dialog.getBoundingClientRect();if(event.target===dialog&&(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom))closeCustomizer();});
 modalUI.progress.addEventListener('input',()=>{modalUI.output.value=Math.round(Number(modalUI.progress.value)*100)+'%';updateModalPreview();});
 window.addEventListener('message',event=>{
  if(event.origin!==location.origin||event.source!==modalUI.frame.contentWindow)return;
  if(event.data?.type==='okuma-preview-ready'){previewReady=true;updateModalPreview();}
  if(event.data?.type==='okuma-preview-close'&&activeCustomizer&&event.data.id===activeCustomizer.id){closeCustomizer();return;}
  if(!activeCustomizer||event.data?.id!==activeCustomizer.id||event.data?.revision!==activeCustomizer.revision)return;
  if(event.data.type==='okuma-preview-rendered'){dialog.dataset.previewState='ready';modalUI.status.textContent=event.data.kind==='follower'?'Move your mouse inside the preview.':'Hover and click the image to try the effect.';}
  if(event.data.type==='okuma-preview-error'){dialog.dataset.previewState='error';modalUI.status.textContent='Preview unavailable. Check WebGL and image access.';}
  if(event.data.type==='okuma-preview-close')closeCustomizer();
 });
 modalUI.frame.src='preview.html?v=upload-1';
}
function openCustomizer(context){
 if(activeCustomizer)closeCustomizer();
 ensureCustomizerDialog();activeCustomizer={...context,id:++modalId,revision:0};
 previousOverflow=document.body.style.overflow;document.body.style.overflow='hidden';
 modalUI.title.textContent=context.name;modalUI.progress.value='0.5';modalUI.output.value='50%';modalUI.status.textContent='Loading preview…';customizerDialog.dataset.previewState='loading';
 context.panel.hidden=false;context.toggle.setAttribute('aria-expanded','true');modalUI.mount.append(context.panel);context.panel.querySelector('.card-code').open=true;
 if(pageFollower)pageFollower.setEnabled(false);
 customizerDialog.showModal();updateModalPreview();
}
function updateModalPreview(){
 if(!activeCustomizer||!modalUI)return;
 const payload=activeCustomizer.preview();modalUI.scrub.hidden=!payload.scrubbable;
 if(!previewReady)return;
 activeCustomizer.revision++;customizerDialog.dataset.previewState='loading';
 modalUI.frame.contentWindow.postMessage({type:'okuma-preview-update',id:activeCustomizer.id,revision:activeCustomizer.revision,payload:{...payload,progress:Number(modalUI.progress.value)}},location.origin);
}
function closeCustomizer(){
 const current=activeCustomizer;if(!current)return;activeCustomizer=null;
 modalUI.frame.contentWindow.postMessage({type:'okuma-preview-stop'},location.origin);
 current.panel.hidden=true;current.home.after(current.panel);current.toggle.setAttribute('aria-expanded','false');
 if(customizerDialog.open)customizerDialog.close();document.body.style.overflow=previousOverflow;
 if(pageFollower)pageFollower.setEnabled(true);current.toggle.focus({preventScroll:true});
}
initCategories();syncCategoryFromHash(false);
if(window.FlowFX){initFollowers();init();}else failed(new Error('Build the library first with npm run build.'));
