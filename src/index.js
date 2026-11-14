import {mouseFollower,destroyFollowers,followerStyles} from './followers.js';
import {imagePresets} from './image-presets.js';
export {mouseFollower,destroyFollowers,followerStyles,imagePresets};
import * as THREE from 'three';
import {vertexShader,fragmentShader} from './shaders.js';
import {defaults,normalizeConfig,resolveStyle,normalizeProgress,styles,scrollEffects,hoverEdges,hoverMotions,transitions,resolveMode} from './config.js';
export {styles};
export const version='0.3.0';
const registry=new Set();
const owners=new WeakMap();
let engine;
let motionQuery;
const motion=()=>motionQuery??=window.matchMedia('(prefers-reduced-motion: reduce)');
const clamp=THREE.MathUtils.clamp;
function cover(texture,aspect) {
  const image=texture.image;
  const ratio=(image.naturalWidth||image.width)/(image.naturalHeight||image.height);
  return new THREE.Vector2(Math.min(1,aspect/ratio),Math.min(1,ratio/aspect));
}
function createEngine() {
  const renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
  renderer.setClearColor(0,0);
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  const canvas=renderer.domElement;
  canvas.setAttribute('aria-hidden','true');
  canvas.dataset.flowfx='canvas';
  Object.assign(canvas.style,{position:'fixed',inset:'0',width:'100%',height:'100%',pointerEvents:'none',zIndex:'10'});
  document.body.append(canvas);
  const scene=new THREE.Scene();
  const camera=new THREE.OrthographicCamera(-0.5,0.5,0.5,-0.5,0.01,10); camera.position.z=3;
  let raf=0, last=0, width=0, height=0, stopped=false;
  function render(now) {
    if(stopped) return;
    const dt=Math.min((now-last)/1000||0.016,0.05); last=now;
    const w=canvas.clientWidth,h=canvas.clientHeight;
    if(w!==width||h!==height) {width=w;height=h;renderer.setSize(w,h,false);}
    renderer.setScissorTest(false); renderer.clear(); renderer.setScissorTest(true);
    let animate=false;
    for(const effect of registry) {
      if(!effect.loaded||effect.destroyed) continue;
      const rect=effect.target.getBoundingClientRect();
      if(rect.bottom<=0||rect.top>=h||rect.right<=0||rect.left>=w||rect.width<1||rect.height<1) continue;
      effect.update(dt,rect);
      renderer.setViewport(rect.left,h-rect.bottom,rect.width,rect.height);
      renderer.setScissor(Math.max(0,rect.left),Math.max(0,h-rect.bottom),Math.min(w,rect.right)-Math.max(0,rect.left),Math.min(h,rect.bottom)-Math.max(0,rect.top));
      effect.mesh.visible=true; scene.add(effect.mesh); renderer.render(scene,camera); scene.remove(effect.mesh);
      if(!effect.paused&&!motion().matches) animate=true;
    }
    raf=animate&&!document.hidden ? requestAnimationFrame(render) : 0;
  }
  function invalidate(){if(!raf&&!stopped&&!document.hidden) raf=requestAnimationFrame(render);}
  const onVisibility=()=>{if(document.hidden){cancelAnimationFrame(raf);raf=0;}else{last=0;invalidate();}};
  window.addEventListener('scroll',invalidate,{passive:true});
  window.addEventListener('resize',invalidate);
  document.addEventListener('visibilitychange',onVisibility);
  const query=motion(); query.addEventListener('change',invalidate);
  canvas.addEventListener('webglcontextlost',event=>{
    if(stopped)return;
    event.preventDefault();
    for(const effect of [...registry]) effect.destroy();
  });
  return {renderer,invalidate,destroy(){
    stopped=true;cancelAnimationFrame(raf);
    window.removeEventListener('scroll',invalidate);window.removeEventListener('resize',invalidate);
    document.removeEventListener('visibilitychange',onVisibility);query.removeEventListener('change',invalidate);
    renderer.dispose();renderer.forceContextLoss();canvas.remove();engine=undefined;
  }};
}
function makeUniforms(){
  return {
    uTime:{value:0},uStyle:{value:1},uIntensity:{value:0.8},uFrequency:{value:5},uActivity:{value:0},uImpulse:{value:0},
    uPointer:{value:new THREE.Vector2(0.5,0.5)},uResolution:{value:new THREE.Vector2(1,1)},
    uTextureA:{value:null},uTextureB:{value:null},uCoverA:{value:new THREE.Vector2(1,1)},uCoverB:{value:new THREE.Vector2(1,1)},
    uHoverMotion:{value:0},uTransition:{value:0},uScroll:{value:0},uScrollMode:{value:0},uEdgeMode:{value:0},uEdgeStrength:{value:1},uMotion:{value:1},
    uProgress:{value:0},uGooey:{value:0},uZoom:{value:0.45},uChromatic:{value:0.7}
  };
}
class ImageEffect {
  constructor(target,options) {
    this.target=target;this.options={...options};this.config=normalizeConfig(options.config);
    this.style=resolveStyle(options.style);
    resolveMode(options.scrollEffect,scrollEffects,'scrollEffect');resolveMode(options.hoverEdge,hoverEdges,'hoverEdge');
    resolveMode(options.hoverMotion,hoverMotions,'hoverMotion');resolveMode(options.transition,transitions,'transition');
    this.destroyed=false;this.loaded=false;this.paused=false;
    this.pointer=new THREE.Vector2(0.5,0.5);this.activity=0;this.impulse=0;this.progress=0;this.targetProgress=0;this.time=0;
    this.abort=new AbortController();this.textures=[];this.originals=[];
    this.images=target.matches('img')?[target]:[...target.querySelectorAll('img')];
    if(!this.images.length) throw new Error('FlowFX: target needs at least one image.');
    this.uniforms=makeUniforms();
    this.ready=this.initialize();
  }
  async initialize(){
    try {
      if(this.options.preset){
        const response=await fetch(this.options.preset,{signal:this.abort.signal});
        if(!response.ok) throw new Error(`FlowFX: preset HTTP ${response.status}`);
        const preset=await response.json();
        this.config=normalizeConfig(this.options.config,normalizeConfig(preset.config));
        this.style=resolveStyle(this.options.style??preset.style);
        if(this.options.gooey===undefined) this.options.gooey=!!preset.gooey;
        for(const [key,modes] of [['hoverEdge',hoverEdges],['scrollEffect',scrollEffects],['hoverMotion',hoverMotions],['transition',transitions]]){
          const value=this.options[key]??preset[key];resolveMode(value,modes,key);this.options[key]=value;
        }
      }
      const loader=new THREE.TextureLoader();loader.setCrossOrigin('anonymous');
      await Promise.all(this.images.map(async image=>{
        if(!image.complete) await new Promise((resolve,reject)=>{
          image.addEventListener('load',resolve,{once:true,signal:this.abort.signal});
          image.addEventListener('error',()=>reject(new Error('FlowFX: source image failed to load.')),{once:true,signal:this.abort.signal});
          this.abort.signal.addEventListener('abort',()=>reject(new DOMException('Aborted','AbortError')),{once:true});
        });
        if(this.destroyed) return;
        const texture=await loader.loadAsync(image.currentSrc||image.src);
        if(this.destroyed){texture.dispose();return;}
        texture.colorSpace=THREE.SRGBColorSpace;
        texture.minFilter=THREE.LinearFilter;texture.magFilter=THREE.LinearFilter;texture.generateMipmaps=false;
        this.textures[this.images.indexOf(image)]=texture;
      }));
      if(this.destroyed) return this;
      engine??=createEngine();
      this.geometry=new THREE.PlaneGeometry(1,1,64,64);
      this.material=new THREE.ShaderMaterial({uniforms:this.uniforms,vertexShader,fragmentShader,transparent:true,side:THREE.DoubleSide,depthTest:false});
      this.mesh=new THREE.Mesh(this.geometry,this.material);
      // Compile and render once before hiding the accessible source images.
      const rect=this.target.getBoundingClientRect();
      this.update(0.016,{...rect,width:Math.max(1,rect.width),height:Math.max(1,rect.height),top:rect.top});
      const probe=new THREE.Scene();probe.add(this.mesh);
      const camera=new THREE.OrthographicCamera(-.5,.5,.5,-.5,.01,10);camera.position.z=3;
      engine.renderer.compile(probe,camera);
      this.originals=this.images.map((image,index)=>({image,opacity:image.style.opacity,display:image.style.display}));
      this.images.forEach((image,index)=>{image.style.opacity='0';if(index)image.style.display='none';});
      this.bind();this.loaded=true;engine.invalidate();
      if(this.options.debug)this.createDebugPanel();
      return this;
    } catch(error){
      this.destroy();
      if(error.name==='AbortError') return this;
      throw error;
    }
  }
  bind(){
    const signal=this.abort.signal;
    this.target.addEventListener('pointerenter',()=>{this.activity=1;engine?.invalidate();},{signal});
    this.target.addEventListener('pointermove',event=>{
      const r=this.target.getBoundingClientRect();
      this.pointer.set(clamp((event.clientX-r.left)/r.width,0,1),clamp(1-(event.clientY-r.top)/r.height,0,1));
      this.activity=1;engine?.invalidate();
    },{signal,passive:true});
    this.target.addEventListener('pointerleave',()=>{this.activity=0;engine?.invalidate();},{signal});
    this.target.addEventListener('focusin',()=>{this.activity=1;engine?.invalidate();},{signal});
    this.target.addEventListener('focusout',()=>{this.activity=0;engine?.invalidate();},{signal});
    this.target.addEventListener('click',()=>{this.impulse=1;if(this.textures.length>1&&this.options.click!==false)this.next();engine?.invalidate();},{signal});
    this.target.addEventListener('keydown',event=>{
      if(!this.target.matches('button, a, input, select, textarea')&&['Enter',' '].includes(event.key)) {event.preventDefault();this.impulse=1;if(this.textures.length>1&&this.options.click!==false)this.next();engine?.invalidate();}
      if(this.textures.length>1&&this.options.click!==false&&event.key==='ArrowRight'){event.preventDefault();this.next();}
      if(this.textures.length>1&&this.options.click!==false&&event.key==='ArrowLeft'){event.preventDefault();this.previous();}
    },{signal});
    this.target.addEventListener('pointerdown',event=>{if(event.pointerType==='touch')this.touchY=event.clientY;},{signal,passive:true});
    this.target.addEventListener('pointerup',event=>{
      if(event.pointerType==='touch'&&this.touchY!==undefined){
        const distance=this.touchY-event.clientY;
        if(Math.abs(distance)>40&&this.textures.length>1){
          const step=clamp((this.options.touchSpeed??6)/6,0.2,3)/(this.textures.length-1);
          this.setProgress(this.targetProgress+Math.sign(distance)*step);
        }
        this.touchY=undefined;
      }
    },{signal,passive:true});
    this.observer=new ResizeObserver(()=>engine?.invalidate());this.observer.observe(this.target);
  }
  update(dt,rect){
    const u=this.uniforms,c=this.config,reduced=motion().matches;
    const factor=1-Math.exp(-c.damping*dt);
    if(!this.paused&&!reduced)this.time+=dt*c.speed;
    if(this.options.scroll){
      let p=clamp((window.innerHeight-rect.top)/(window.innerHeight+rect.height),0,1);
      p=clamp((p-.5)*((this.options.scrollSpeed??6)/6)+.5,0,1);
      const stops=this.textures.length-1;
      this.targetProgress=this.options.scrollSnapping&&stops>0?Math.round(p*stops)/stops:p;
    }
    if(!this.paused){
      this.progress=reduced?this.targetProgress:THREE.MathUtils.lerp(this.progress,this.targetProgress,factor);
      u.uActivity.value=reduced?0:THREE.MathUtils.lerp(u.uActivity.value,this.activity,factor);
      u.uPointer.value.lerp(this.pointer,factor);this.impulse*=Math.exp(-dt*3.5);
    }
    const position=this.progress*(this.textures.length-1);
    const index=Math.min(Math.floor(position),this.textures.length-1),next=Math.min(index+1,this.textures.length-1);
    const a=this.textures[index],b=this.textures[next];
    u.uTextureA.value=a;u.uTextureB.value=b;u.uProgress.value=position-index;
    u.uCoverA.value.copy(cover(a,rect.width/rect.height));u.uCoverB.value.copy(cover(b,rect.width/rect.height));
    u.uResolution.value.set(rect.width,rect.height);u.uTime.value=this.time;u.uStyle.value=this.style;
    u.uIntensity.value=reduced?0:c.intensity;u.uImpulse.value=reduced?0:this.impulse;
    u.uFrequency.value=c.frequency;u.uZoom.value=reduced?0:c.zoom;u.uChromatic.value=reduced?0:c.chromatic;
    u.uGooey.value=reduced?0:Number(!!this.options.gooey);
    u.uScroll.value=this.progress;u.uMotion.value=reduced?0:1;
    u.uScrollMode.value=reduced?0:resolveMode(this.options.scrollEffect,scrollEffects,'scrollEffect');
    u.uEdgeMode.value=reduced?0:resolveMode(this.options.hoverEdge,hoverEdges,'hoverEdge');
    u.uEdgeStrength.value=c.edgeStrength;
    u.uHoverMotion.value=reduced?0:resolveMode(this.options.hoverMotion,hoverMotions,'hoverMotion');
    u.uTransition.value=resolveMode(this.options.transition,transitions,'transition');
    this.options.onProgress?.(this.progress);
  }
  setOptions(options={}){
    if(this.destroyed)return this;
    resolveMode(options.scrollEffect,scrollEffects,'scrollEffect');resolveMode(options.hoverEdge,hoverEdges,'hoverEdge');
    resolveMode(options.hoverMotion,hoverMotions,'hoverMotion');resolveMode(options.transition,transitions,'transition');
    if(options.config)this.config=normalizeConfig(options.config,this.config);
    if(options.style!==undefined)this.style=resolveStyle(options.style);
    Object.assign(this.options,options);engine?.invalidate();return this;
  }
  setProgress(progress){this.targetProgress=normalizeProgress(progress);engine?.invalidate();return this;}
  next(){const n=this.images.length-1;if(n)this.setProgress((Math.round(this.targetProgress*n)+1)%(n+1)/n);return this;}
  previous(){const n=this.images.length-1;if(n)this.setProgress((Math.round(this.targetProgress*n)+n)%(n+1)/n);return this;}
  pause(){this.paused=true;engine?.invalidate();return this;}
  play(){this.paused=false;engine?.invalidate();return this;}
  refresh(){engine?.invalidate();return this;}
  exportPreset(){return {version:1,style:this.style,gooey:!!this.options.gooey,hoverEdge:this.options.hoverEdge||'none',scrollEffect:this.options.scrollEffect||'none',hoverMotion:this.options.hoverMotion||'none',transition:this.options.transition||'liquid',config:{...this.config}};}
  createDebugPanel(){
    const host=document.createElement('div');host.dataset.flowfx='debug';
    Object.assign(host.style,{position:'fixed',right:'16px',bottom:'16px',zIndex:'2147483647'});
    const root=host.attachShadow({mode:'open'});
    root.innerHTML=`<style>:host{font:13px system-ui;color:#eef4ee}details{width:230px;background:#15201e;padding:16px;border:1px solid #54665c;border-radius:12px;box-shadow:0 12px 50px #0006}summary{cursor:pointer;font-weight:700}label{display:flex;justify-content:space-between;gap:12px;margin-top:13px}input{width:110px;accent-color:#d7ff66}button{margin-top:14px;background:#d7ff66;border:0;border-radius:5px;padding:9px;cursor:pointer}textarea{box-sizing:border-box;width:100%;height:90px;margin-top:10px;background:#091310;color:white;border:1px solid #54665c}</style><details open><summary>FlowFX · shader controls</summary></details>`;
    const details=root.querySelector('details');
    for(const [key,max] of Object.entries({intensity:2,speed:3,frequency:15,zoom:2,chromatic:2,damping:20,edgeStrength:2})){
      const label=document.createElement('label');label.textContent=key;
      const input=document.createElement('input');input.type='range';input.min=key==='frequency'||key==='damping'?'1':'0';input.max=String(max);input.step='.05';input.value=String(this.config[key]);input.setAttribute('aria-label',key);
      input.addEventListener('input',()=>this.setOptions({config:{[key]:Number(input.value)}}));label.append(input);details.append(label);
    }
    const button=document.createElement('button');button.textContent='Export preset JSON';
    const output=document.createElement('textarea');output.readOnly=true;output.hidden=true;output.setAttribute('aria-label','Exported preset JSON');
    button.addEventListener('click',()=>{output.hidden=false;output.value=JSON.stringify(this.exportPreset(),null,2);output.select();});details.append(button,output);
    document.body.append(host);this.panel=host;
  }
  destroy(){
    if(this.destroyed)return;
    this.destroyed=true;this.abort.abort();this.observer?.disconnect();this.panel?.remove();
    for(const {image,opacity,display} of this.originals){image.style.opacity=opacity;image.style.display=display;}
    this.geometry?.dispose();this.material?.dispose();this.textures.forEach(t=>t.dispose());
    registry.delete(this);if(owners.get(this.target)===this)owners.delete(this.target);
    if(!registry.size)engine?.destroy();else engine?.invalidate();
  }
}
export function imageEffect(selector,options={}) {
  if(typeof document==='undefined')throw new Error('FlowFX: call imageEffect in a browser after mounting the DOM.');
  const targets=typeof selector==='string'?[...document.querySelectorAll(selector)]:selector instanceof Element?[selector]:[...selector];
  if(!targets.length)throw new Error('FlowFX: selector matched no elements.');
  resolveStyle(options.style);normalizeConfig(options.config);
  resolveMode(options.scrollEffect,scrollEffects,'scrollEffect');resolveMode(options.hoverEdge,hoverEdges,'hoverEdge');
    resolveMode(options.hoverMotion,hoverMotions,'hoverMotion');resolveMode(options.transition,transitions,'transition');
  for(const target of targets){
    if(!target.matches('img')&&!target.querySelector('img'))throw new Error('FlowFX: each target needs at least one image.');
    if(owners.has(target))throw new Error('FlowFX: target already initialized. Destroy it before reinitializing.');
  }
  const instances=targets.map(target=>{const effect=new ImageEffect(target,options);registry.add(effect);owners.set(target,effect);return effect;});
  const group={instances,ready:Promise.all(instances.map(e=>e.ready)),exportPreset:()=>instances[0].exportPreset()};
  for(const method of ['setOptions','setProgress','next','previous','pause','play','refresh','destroy'])group[method]=(...args)=>{instances.forEach(e=>e[method](...args));return group;};
  return group;
}
export function destroyAll(){for(const effect of [...registry])effect.destroy();destroyFollowers();}
export default {imageEffect,destroyAll,styles,version,mouseFollower,destroyFollowers,followerStyles,imagePresets};
