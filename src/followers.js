import {followerStyles,normalizeFollowerOptions} from './follower-config.js';
export {followerStyles};
const followers=new Set(),owners=new WeakMap();
let layer;
function circle(ctx,x,y,r,fill){ctx.beginPath();ctx.arc(x,y,Math.max(.1,r),0,Math.PI*2);if(fill)ctx.fill();else ctx.stroke();}
function glow(ctx,x,y,r,color){const gradient=ctx.createRadialGradient(x,y,0,x,y,r);gradient.addColorStop(0,color);gradient.addColorStop(1,color+'00');ctx.fillStyle=gradient;circle(ctx,x,y,r,true);}
function draw(ctx,f,time){
  const o=f.options,s=o.size,x=f.x,y=f.y,p=f.points;
  const dx=f.velocity.x,dy=f.velocity.y,angle=Math.atan2(dy,dx),stretch=Math.min(1,Math.hypot(dx,dy)/25);
  ctx.fillStyle=o.color;ctx.strokeStyle=o.color;ctx.lineWidth=1.5;ctx.lineCap='round';ctx.lineJoin='round';
  if(o.style==='aura'){
    ctx.globalAlpha=.32;glow(ctx,x,y,s*1.6,o.color);ctx.globalAlpha=1;
    ctx.beginPath();ctx.ellipse(x,y,s*.65*(1+stretch*.5),s*.65,angle,0,Math.PI*2);ctx.stroke();ctx.fillStyle=o.accent;circle(ctx,x,y,3,true);
  }else if(o.style==='orbit'){
    ctx.save();ctx.translate(x,y);ctx.rotate(time*.7);
    for(let i=0;i<3;i++){ctx.save();ctx.rotate(i*Math.PI/3);ctx.globalAlpha=.55;ctx.beginPath();ctx.ellipse(0,0,s,s*.35,0,0,Math.PI*2);ctx.stroke();ctx.globalAlpha=1;ctx.fillStyle=i%2?o.accent:o.color;circle(ctx,Math.cos(time*2+i)*s,Math.sin(time*2+i)*s*.35,3.5,true);ctx.restore();}
    ctx.fillStyle=o.accent;circle(ctx,0,0,3,true);ctx.restore();
  }else if(o.style==='comet'){
    p.forEach((q,i)=>{ctx.globalAlpha=(1-i/p.length)*.7;ctx.fillStyle=i%3?o.color:o.accent;circle(ctx,q.x,q.y,Math.max(1,s*.22*(1-i/p.length)),true);});
    ctx.globalAlpha=.5;glow(ctx,x,y,s*.7,o.color);ctx.globalAlpha=1;ctx.fillStyle=o.accent;circle(ctx,x,y,5,true);
  }else if(o.style==='ribbon'){
    for(let strand=0;strand<2;strand++){
      ctx.beginPath();ctx.strokeStyle=strand?o.accent:o.color;ctx.lineWidth=strand?2:s*.16;
      p.forEach((q,i)=>{const drift=Math.sin(time*4-i*.3+strand*2)*i*.7;const px=q.x+drift,py=q.y+Math.cos(i*.2+time*3)*i*.4;if(i)ctx.lineTo(px,py);else ctx.moveTo(px,py);});ctx.stroke();
    }
    ctx.fillStyle=o.accent;circle(ctx,x,y,3,true);
  }else if(o.style==='magnetic'){
    ctx.save();ctx.translate(x,y);ctx.rotate(angle);ctx.scale(1+stretch*.8,1-stretch*.25);
    ctx.beginPath();ctx.arc(0,0,s*.65,.2,Math.PI-.2);ctx.stroke();ctx.beginPath();ctx.arc(0,0,s*.65,Math.PI+.2,Math.PI*2-.2);ctx.stroke();
    ctx.strokeStyle=o.accent;ctx.lineWidth=1;for(let i=0;i<4;i++){ctx.rotate(Math.PI/2);ctx.strokeRect(s*.8,-3,6,6);}ctx.restore();ctx.fillStyle=o.accent;circle(ctx,x,y,2,true);
  }else if(o.style==='fireflies'){
    for(let i=0;i<8;i++){const a=i*2.399+time*(i%2?1:-.7),r=s*(.35+.6*(.5+.5*Math.sin(time*1.7+i)));const px=x+Math.cos(a)*r,py=y+Math.sin(a*1.3)*r;ctx.globalAlpha=.5;glow(ctx,px,py,9,i%2?o.color:o.accent);ctx.globalAlpha=.6+.4*Math.sin(time*3+i);ctx.fillStyle=i%2?o.accent:o.color;circle(ctx,px,py,1.8,true);}ctx.globalAlpha=1;
  }else if(o.style==='pixel'){
    for(let i=p.length-1;i>=0;i--){const q=p[i],size=Math.max(2,Math.round((1-i/p.length)*s*.25));ctx.globalAlpha=(1-i/p.length)*.85;ctx.fillStyle=i%3?o.color:o.accent;ctx.fillRect(Math.round(q.x/7)*7,Math.round(q.y/7)*7,size,size);}ctx.globalAlpha=1;ctx.strokeStyle=o.accent;ctx.strokeRect(Math.round(x/7)*7-5,Math.round(y/7)*7-5,17,17);
  }else if(o.style==='ink'){
    p.forEach((q,i)=>{ctx.globalAlpha=.12+(1-i/p.length)*.4;ctx.fillStyle=o.color;circle(ctx,q.x,q.y,s*.27*(1-i/p.length)+1,true);});ctx.globalAlpha=1;ctx.fillStyle=o.color;circle(ctx,x,y,s*.3,true);ctx.strokeStyle=o.accent;ctx.lineWidth=1;circle(ctx,x+s*.15,y-s*.1,s*.12,false);
  }else if(o.style==='compass'){
    ctx.save();ctx.translate(x,y);ctx.rotate(angle+Math.PI/4+time*.1);ctx.strokeRect(-s*.45,-s*.45,s*.9,s*.9);ctx.strokeStyle=o.accent;ctx.rotate(Math.PI/4);ctx.beginPath();ctx.moveTo(0,-s*.85);ctx.lineTo(-4,-s*.55);ctx.lineTo(4,-s*.55);ctx.closePath();ctx.stroke();ctx.restore();
    ctx.globalAlpha=.4;circle(ctx,x,y,s*.8,false);ctx.globalAlpha=1;ctx.fillStyle=o.accent;circle(ctx,x,y,2,true);
  }else if(o.style==='text'){
    ctx.save();ctx.translate(x,y);ctx.rotate(time*.55);ctx.font=`600 ${Math.max(8,s*.25)}px monospace`;ctx.textAlign='center';ctx.textBaseline='middle';
    const label=o.text||'FLOW · ';[...label].forEach((char,i)=>{ctx.save();ctx.rotate(i/label.length*Math.PI*2);ctx.fillStyle=i%3?o.color:o.accent;ctx.fillText(char,0,-s);ctx.restore();});ctx.restore();ctx.strokeStyle=o.accent;circle(ctx,x,y,4,false);
  }
  if(f.pulse>.01){ctx.globalAlpha=f.pulse;ctx.strokeStyle=o.accent;ctx.lineWidth=1;circle(ctx,x,y,s*(1.6-f.pulse),false);ctx.globalAlpha=1;}
}
function createLayer(){
  const canvas=document.createElement('canvas');canvas.dataset.flowfx='followers';canvas.setAttribute('aria-hidden','true');
  Object.assign(canvas.style,{position:'fixed',inset:'0',width:'100%',height:'100%',pointerEvents:'none',zIndex:'2147483000'});document.body.append(canvas);
  const ctx=canvas.getContext('2d');if(!ctx){canvas.remove();throw new Error('FlowFX: Canvas 2D is unavailable.');}
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let raf=0,last=0,width=0,height=0,ratio=0,stopped=false;
  function render(now){
    raf=0;if(stopped)return;
    const w=canvas.clientWidth,h=canvas.clientHeight,dpr=Math.min(devicePixelRatio||1,2);
    if(w!==width||h!==height||dpr!==ratio){width=w;height=h;ratio=dpr;canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);}
    ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,w,h);
    const dt=Math.min((now-last)/1000||.016,.05);last=now;let moving=false;
    if(!document.hidden&&!reduced.matches)for(const f of followers){
      if(!f.enabled||f.destroyed)continue;
      const r=f.bounds();if(r.bottom<0||r.top>h||r.right<0||r.left>w||r.width<1||r.height<1)continue;
      if(!f.active&&!f.options.idleAnimation)continue;
      moving=true;const time=now/1000;
      if(!f.active){f.targetX=r.width*(.5+Math.sin(time*.8+f.seed)*.22);f.targetY=r.height*(.5+Math.sin(time*1.1+f.seed)*.2);}
      if(!f.started){f.x=f.targetX;f.y=f.targetY;f.started=true;}
      const beforeX=f.x,beforeY=f.y,k=1-Math.exp(-f.options.speed*dt);f.x+=(f.targetX-f.x)*k;f.y+=(f.targetY-f.y)*k;f.velocity={x:(f.x-beforeX)/Math.max(.2,dt*60),y:(f.y-beforeY)/Math.max(.2,dt*60)};
      f.points.unshift({x:f.x,y:f.y});f.points.length=Math.min(f.points.length,f.options.trail);f.pulse*=Math.exp(-dt*4);
      ctx.save();ctx.beginPath();ctx.rect(r.left,r.top,r.width,r.height);ctx.clip();ctx.translate(r.left,r.top);draw(ctx,f,time);ctx.restore();
    }
    if(moving)raf=requestAnimationFrame(render);
  }
  function invalidate(){if(!raf&&!stopped)raf=requestAnimationFrame(render);}
  const visibility=()=>{if(document.hidden){cancelAnimationFrame(raf);raf=0;}else invalidate();};
  const changed=()=>{for(const f of followers)f.applyCursor();invalidate();};
  window.addEventListener('resize',invalidate);window.addEventListener('scroll',invalidate,{passive:true});document.addEventListener('visibilitychange',visibility);reduced.addEventListener('change',changed);
  return {canvas,invalidate,destroy(){stopped=true;cancelAnimationFrame(raf);window.removeEventListener('resize',invalidate);window.removeEventListener('scroll',invalidate);document.removeEventListener('visibilitychange',visibility);reduced.removeEventListener('change',changed);canvas.remove();layer=undefined;}};
}
let seed=0;
export function mouseFollower(options={}){
  if(typeof document==='undefined')throw new Error('FlowFX: create a mouseFollower in the browser after mount.');
  const settings=normalizeFollowerOptions(options);
  const target=typeof options.target==='string'?document.querySelector(options.target):options.target??document.documentElement;
  if(!(target instanceof Element))throw new Error('FlowFX: follower target must match one element.');
  if(owners.has(target))throw new Error('FlowFX: this target already has a mouse follower. Destroy it first.');
  const global=target===document.documentElement;
  if(global&&settings.idleAnimation)throw new Error('FlowFX: idleAnimation is for scoped previews only.');
  layer??=createLayer();
  const abort=new AbortController(),originalCursor=target.style.cursor;
  const f={target,options:settings,active:false,enabled:true,destroyed:false,started:false,x:0,y:0,targetX:0,targetY:0,points:[],velocity:{x:0,y:0},pulse:0,seed:++seed,
    bounds(){return global?{left:0,top:0,right:document.documentElement.clientWidth,bottom:innerHeight,width:document.documentElement.clientWidth,height:innerHeight}:target.getBoundingClientRect();},
    applyCursor(){target.style.cursor=f.enabled&&f.options.hideCursor&&!matchMedia('(prefers-reduced-motion: reduce)').matches&&matchMedia('(any-pointer: fine)').matches?'none':originalCursor;},
    setOptions(next={}){if(f.destroyed)return f;const value=normalizeFollowerOptions(next,f.options);if(global&&value.idleAnimation)throw new Error('FlowFX: idleAnimation needs a scoped target.');f.options=value;f.points.length=0;f.applyCursor();layer?.invalidate();return f;},
    setEnabled(enabled){if(typeof enabled!=='boolean')throw new TypeError('FlowFX: enabled must be boolean.');if(f.destroyed)return f;f.enabled=enabled;f.active=false;f.started=false;f.points.length=0;f.applyCursor();layer?.invalidate();return f;},
    exportPreset(){return {...f.options};},
    destroy(){if(f.destroyed)return;f.destroyed=true;abort.abort();observer.disconnect();target.style.cursor=originalCursor;followers.delete(f);owners.delete(target);if(!followers.size)layer?.destroy();else layer?.invalidate();}
  };
  function move(event){if(event.pointerType==='touch')return;const r=f.bounds();f.targetX=event.clientX-r.left;f.targetY=event.clientY-r.top;f.active=true;layer?.invalidate();}
  target.addEventListener('pointermove',move,{signal:abort.signal,passive:true});target.addEventListener('pointerenter',move,{signal:abort.signal,passive:true});
  target.addEventListener('pointerleave',()=>{f.active=false;f.started=false;f.points.length=0;layer?.invalidate();},{signal:abort.signal});
  target.addEventListener('pointerdown',event=>{if(event.pointerType!=='touch'){move(event);f.pulse=1;}},{signal:abort.signal,passive:true});
  window.addEventListener('blur',()=>{f.active=false;layer?.invalidate();},{signal:abort.signal});
  const observer=new ResizeObserver(()=>layer?.invalidate());observer.observe(target);
  followers.add(f);owners.set(target,f);f.applyCursor();layer.invalidate();return f;
}
export function destroyFollowers(){for(const f of [...followers])f.destroy();}
