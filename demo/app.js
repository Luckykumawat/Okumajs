'use strict';
const $=id=>document.getElementById(id);
const effects=[
  ['Liquid silk','Soft currents. A surface that follows you.','dunes'],
  ['Vortex distortion','A magnetic swirl around your pointer.','tide'],
  ['Elastic terrain','A subdivided mesh with real vertex depth.','violet'],
  ['Wind sculpture','An anchored edge. A wind-swept surface.','dunes'],
  ['Radial ripple','Concentric waves through a quiet landscape.','ember'],
  ['Perlin drift','Layered gradient noise. Organic displacement.','tide'],
  ['Cyber mosaic','Quantized motion meets a luminous grid.','violet']
];
const presetKeys=['liquid-silk','vortex-distortion','elastic-terrain','wind-sculpture','radial-ripple','perlin-drift','cyber-mosaic'];
const mainDesign={hoverMotion:'tilt',transition:'liquid'};
let main,paused=false,toastTimer;
const initial={intensity:.85,speed:.9,frequency:5,zoom:.5,chromatic:.7,damping:7,edgeStrength:1};
const base={...initial};
function toast(message){$('toast').textContent=message;$('toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').classList.remove('show'),3000);}
function settings(){const config={...base};for(const key of ['intensity','speed','frequency','chromatic'])config[key]=Number($(key).value);config.zoom=$('zoom').checked?(base.zoom||.5):0;return {...mainDesign,style:Number($('effect').value),gooey:$('gooey').checked,hoverEdge:$('hover-edge').value,config};}
function localCode(){return `<!-- Serve your files over HTTP -->\n<script src="./lib/flowfx.min.js"><\/script>\n\n<div class="art" tabindex="0"\n     aria-label="Hover to reshape. Click for next image."\n     style="width:100%;height:500px">\n  <img src="./image-1.jpg" alt="First artwork"\n       style="width:100%;height:100%;object-fit:cover">\n  <img src="./image-2.jpg" alt="Second artwork" style="display:none">\n  <img src="./image-3.jpg" alt="Third artwork" style="display:none">\n</div>\n\n<script>\n  const fx = FlowFX.imageEffect(".art", ${JSON.stringify(settings(),null,2).replace(/\n/g,'\n  ')});\n  fx.ready.catch(console.error);\n<\/script>`;}
function sync(){const options=settings();main?.setOptions(options);$('effect-title').textContent=effects[options.style-1][0];$('style-number').textContent=String(options.style).padStart(2,'0');for(const key of ['intensity','speed','frequency','chromatic'])$(key+'-value').value=Number($(key).value).toFixed(2);$('install-code').textContent=localCode();$('design-summary').textContent=`HOVER / ${mainDesign.hoverMotion.toUpperCase()} · CLICK / ${mainDesign.transition.toUpperCase()}`;}
function applyImagePreset(preset){Object.assign(base,initial,preset.config);Object.assign(mainDesign,{hoverMotion:preset.hoverMotion??'none',transition:preset.transition??'liquid'});$('effect').value=String(preset.style);$('hover-edge').value=preset.hoverEdge??'none';$('gooey').checked=!!preset.gooey;$('zoom').checked=(base.zoom??0)>0;for(const key of ['intensity','speed','frequency','chromatic'])$(key).value=String(base[key]);sync();}
async function copy(value){try{await navigator.clipboard.writeText(value);toast('Copied. Make something move.');}catch{const area=document.createElement('textarea');area.value=value;document.body.append(area);area.select();const ok=document.execCommand('copy');area.remove();toast(ok?'Copied to clipboard.':'Clipboard unavailable. Use the example below.');}}
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
    card.querySelector('button').addEventListener('click',()=>{applyImagePreset(FlowFX.imagePresets[presetKeys[i]]);$('playground').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});toast(`${name} loaded in playground`);});
    card.querySelector('[data-copy]').addEventListener('click',()=>copy(`const fx = FlowFX.imageEffect(".your-gallery", ${JSON.stringify(FlowFX.imagePresets[presetKeys[i]],null,2)});\nfx.ready.catch(console.error);`));
    const design=FlowFX.imagePresets[presetKeys[i]];card.querySelector('.card-info p').textContent+=` Hover: ${design.hoverMotion} · Click: ${design.transition}`;
    try{const fx=FlowFX.imageEffect(`#effect-${i+1}`,{...design,onProgress:p=>{$('card-index-'+(i+1)).textContent=String(Math.round(p*2)+1).padStart(2,'0')+' / 03';}});fx.ready.catch(error=>console.warn(name,error));}catch(error){console.warn(error);}
  });
  initNewStudies();
  syncCategoryFromHash(false);
  try{
    const scroller=FlowFX.imageEffect('#scroll-stage',{style:'wobble',gooey:true,click:false,config:{intensity:.65,zoom:0},onProgress:p=>{$('scroll-percent').textContent=Math.round(p*100)+'%';$('scroll-bar').style.width=p*100+'%';}});
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
    const design=FlowFX.imagePresets[{'wave':'tidal-edges','blob':'living-silhouette','scallop':'scalloped-frame'}[mode]];
    card.querySelector('button.edge-copy').addEventListener('click',()=>copy(`const fx = FlowFX.imageEffect(".your-gallery", ${JSON.stringify(design,null,2)});\nfx.ready.catch(console.error);`));
    try{const fx=FlowFX.imageEffect('#edge-'+mode,{...design,onProgress:p=>{$('edge-index-'+mode).textContent=String(Math.round(p*2)+1).padStart(2,'0')+' / 03';}});fx.ready.catch(console.warn);}catch(error){console.warn(error);}
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
    section.querySelector('button').addEventListener('click',()=>copy(`const fx = FlowFX.imageEffect(".art", ${JSON.stringify({...options,scroll:true},null,2)});\nfx.ready.catch(console.error);`));
    try{
      const fx=FlowFX.imageEffect('#study-surface-'+mode,{...options,onProgress:p=>{$('study-percent-'+mode).value=Math.round(p*100)+'%';$('study-bar-'+mode).style.width=p*100+'%';}});
      const timeline=()=>{const r=section.getBoundingClientRect();const span=Math.max(1,r.height-window.innerHeight*.25);fx.setProgress(Math.max(0,Math.min(1,(window.innerHeight*.55-r.top)/span)));};
      fx.ready.then(timeline).catch(console.warn);
      window.addEventListener('scroll',timeline,{passive:true});window.addEventListener('resize',timeline);timeline();
    }catch(error){console.warn(error);}
  }
}


let pageFollower, selectedFollower='aura';
const followerPreviews=[];
const followerDescriptions={aura:'A soft radial glow and elastic mint ring.',orbit:'Three rotating orbits with satellite particles.',comet:'A tapered coral trail with a glowing solar head.',ribbon:'Two electric strands weaving through your path.',magnetic:'A velocity-stretched ring with four magnetic poles.',fireflies:'Eight luminous motes with individual flight paths.',pixel:'Grid-snapped candy blocks with a stepped trail.',ink:'Overlapping navy droplets that pool into a brush.',compass:'A directional diamond, north marker and compass ring.',text:'Rotating rose lettering orbiting your pointer.'};
function followerOptions(style=selectedFollower){const palette=FlowFX.followerStyles[style];return {style,color:style===selectedFollower?$('follower-color').value:palette.color,accent:palette.accent,size:style===selectedFollower?Number($('follower-size').value):32};}
function followerCode(options=followerOptions()){return `// Include flowfx.min.js before this snippet.\nconst cursor = FlowFX.mouseFollower(${JSON.stringify(options,null,2)});\n\n// When removing the effect:\n// cursor.destroy();`;}
function syncFollower(){const options=followerOptions();if(pageFollower)pageFollower.setOptions(options);$('follower-code').textContent=followerCode(options);}
function stopFollower(){pageFollower?.destroy();pageFollower=undefined;for(const preview of followerPreviews)preview.setEnabled(true);$('follower-status').textContent='CARD PREVIEWS · NATIVE POINTER ON';for(const el of document.querySelectorAll('.follower-use')){el.setAttribute('aria-pressed','false');el.textContent='Use on page ↗';}for(const id of ['follower-color','follower-size','stop-follower'])$(id).disabled=true;}
function initFollowers(){
 for(const [i,[style,palette]] of Object.entries(FlowFX.followerStyles).entries()){
  const card=document.createElement('article');card.className='follower-card';card.dataset.style=style;card.style.setProperty('--follower-color',palette.color);
  card.innerHTML=`<div class="follower-preview ${style==='ink'?'on-paper':''}" id="follower-preview-${style}" aria-label="${palette.name} mouse follower preview"><span class="follower-number">CURSOR / ${String(i+1).padStart(2,'0')}</span><span class="follower-stage-label">${style==='text'?'READ THE ROOM':'MAKE YOUR MARK'}</span><span class="follower-touch-hint">MOVE YOUR MOUSE HERE</span></div><div class="follower-card-info"><h3>${palette.name}</h3><span class="follower-swatch" style="background:${palette.color}"></span><p>${followerDescriptions[style]}</p><div class="follower-actions"><button class="follower-use" aria-pressed="false" aria-label="Use ${palette.name} on page">Use on page ↗</button><button class="follower-copy" aria-label="Copy ${palette.name} code">Copy code</button></div></div>`;
  $('follower-grid').append(card);
  const preview=FlowFX.mouseFollower({style,target:'#follower-preview-'+style,idleAnimation:true,size:style==='text'?38:32});followerPreviews.push(preview);
  card.querySelector('.follower-use').addEventListener('click',()=>{
    stopFollower();selectedFollower=style;$('follower-color').value=palette.color;$('follower-size').value='32';
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

initCategories();syncCategoryFromHash(false);
if(window.FlowFX){initFollowers();init();}else failed(new Error('Build the library first with npm run build.'));
