export const styles = Object.freeze({ liquid:1, distortion:2, wobble:3, wind:4, ripple:5, perlin:6, cyber:7 });
export const defaults = Object.freeze({ intensity:0.8, speed:1, frequency:5, zoom:0.45, chromatic:0.7, damping:7, edgeStrength:1 });
const limits = { intensity:[0,2], speed:[0,3], frequency:[1,15], zoom:[0,2], chromatic:[0,2], damping:[1,20], edgeStrength:[0,2] };
export function normalizeConfig(input={}, base=defaults) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new TypeError('FlowFX: config must be an object.');
  const result={...base};
  for (const [key,[min,max]] of Object.entries(limits)) {
    if (input[key] !== undefined) {
      if(typeof input[key] !== 'number' || !Number.isFinite(input[key])) throw new TypeError(`FlowFX: ${key} must be a finite number.`);
      result[key]=Math.min(max,Math.max(min,input[key]));
    }
  }
  return result;
}
export function resolveStyle(style=1) {
  const value=typeof style==='string' ? styles[style] : style;
  if(!Number.isInteger(value) || value<1 || value>7) throw new RangeError('FlowFX: style must be 1–7 or a known style name.');
  return value;
}
export function normalizeProgress(value) {
  if(!Number.isFinite(value)) throw new TypeError('FlowFX: progress must be finite.');
  return Math.min(1,Math.max(0,value));
}
export const scrollEffects=Object.freeze({none:0,depth:1,ribbon:2,shutter:3,lens:4});
export const hoverEdges=Object.freeze({none:0,wave:1,blob:2,scallop:3,diamond:4,curtain:5,cut:6,orbit:7});
export function resolveMode(value, modes, label) {
  if(value===undefined||value===false)return 0;
  if(typeof value!=='string'||!Object.hasOwn(modes,value))throw new RangeError(`FlowFX: unknown ${label}.`);
  return modes[value];
}

export const hoverMotions=Object.freeze({none:0,tilt:1,swirl:2,fold:3,lift:4,ripple:5,stretch:6,glitch:7});
export const transitions=Object.freeze({liquid:0,radial:1,ribbon:2,slide:3,zoom:4,diagonal:5,pixel:6});
