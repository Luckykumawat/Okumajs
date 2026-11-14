export const followerStyles=Object.freeze({
  aura:{name:'Mint aura',color:'#77edbb',accent:'#e6ffad'},
  orbit:{name:'Violet orbit',color:'#b29aff',accent:'#f5ceff'},
  comet:{name:'Solar comet',color:'#ff8363',accent:'#ffe4a1'},
  ribbon:{name:'Electric ribbon',color:'#63dfff',accent:'#c2adff'},
  magnetic:{name:'Amber magnet',color:'#ffc45e',accent:'#fff1c4'},
  fireflies:{name:'Lime fireflies',color:'#c2f85c',accent:'#fbffba'},
  pixel:{name:'Pixel candy',color:'#fb79d2',accent:'#92ddff'},
  ink:{name:'Midnight ink',color:'#1e3554',accent:'#718bb5'},
  compass:{name:'Cobalt compass',color:'#668bff',accent:'#c8d5ff'},
  text:{name:'Rose typography',color:'#ff9caf',accent:'#ffe0e7'}
});
export function normalizeFollowerOptions(input={},base={}){
  const style=input.style??base.style??'aura';
  if(!Object.hasOwn(followerStyles,style))throw new RangeError('FlowFX: unknown follower style.');
  const palette=followerStyles[style];
  const result={style,color:input.color??(input.style?palette.color:base.color)??palette.color,accent:input.accent??(input.style?palette.accent:base.accent)??palette.accent,size:input.size??base.size??32,speed:input.speed??base.speed??12,trail:input.trail??base.trail??22,text:input.text??base.text??'FLOW WITH ME · ',idleAnimation:input.idleAnimation??base.idleAnimation??false,hideCursor:input.hideCursor??base.hideCursor??false};
  for(const key of ['color','accent']){
    if(typeof result[key]!=='string'||!/^#(?:[\da-f]{3}|[\da-f]{6})$/i.test(result[key]))throw new TypeError(`FlowFX: ${key} must be a 3 or 6 digit hex color.`);
    if(result[key].length===4)result[key]='#'+[...result[key].slice(1)].map(c=>c+c).join('');
  }
  for(const [key,min,max] of [['size',12,100],['speed',1,30],['trail',6,40]]){
    if(typeof result[key]!=='number'||!Number.isFinite(result[key]))throw new TypeError(`FlowFX: follower ${key} must be finite.`);
    result[key]=Math.max(min,Math.min(max,result[key]));
  }
  result.trail=Math.round(result.trail);
  if(typeof result.text!=='string')throw new TypeError('FlowFX: follower text must be a string.');
  result.text=result.text.slice(0,40);
  for(const key of ['idleAnimation','hideCursor'])if(typeof result[key]!=='boolean')throw new TypeError(`FlowFX: ${key} must be boolean.`);
  return result;
}
