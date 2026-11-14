// Each card has its own motion, silhouette, transition and tuned shader settings.
const preset=(style,hoverMotion,hoverEdge,transition,config)=>Object.freeze({style,hoverMotion,hoverEdge,transition,gooey:transition==='liquid',config:Object.freeze(config)});
export const imagePresets=Object.freeze({
  'liquid-silk':preset(1,'tilt','wave','liquid',{intensity:.85,speed:.75,frequency:4,zoom:.35,edgeStrength:1.1,chromatic:.3,damping:7}),
  'vortex-distortion':preset(2,'swirl','orbit','radial',{intensity:1.15,speed:.85,frequency:7,zoom:.2,edgeStrength:1.15,chromatic:.8,damping:6}),
  'elastic-terrain':preset(3,'fold','diamond','ribbon',{intensity:1.35,speed:1.1,frequency:5,zoom:.15,edgeStrength:.9,chromatic:.35,damping:5}),
  'wind-sculpture':preset(4,'lift','curtain','slide',{intensity:1.2,speed:1.3,frequency:3,zoom:0,edgeStrength:1.25,chromatic:.2,damping:8}),
  'radial-ripple':preset(5,'ripple','blob','zoom',{intensity:1.05,speed:.65,frequency:6,zoom:.6,edgeStrength:.9,chromatic:1.1,damping:9}),
  'perlin-drift':preset(6,'stretch','scallop','diagonal',{intensity:1.1,speed:.5,frequency:8,zoom:.25,edgeStrength:1.1,chromatic:.55,damping:5}),
  'cyber-mosaic':preset(7,'glitch','cut','pixel',{intensity:1.2,speed:1.2,frequency:8,zoom:.1,edgeStrength:1.1,chromatic:1.35,damping:12}),
  'tidal-edges':preset(5,'stretch','wave','radial',{intensity:.7,speed:1.1,frequency:3,zoom:.2,edgeStrength:1.8,chromatic:.4,damping:6}),
  'living-silhouette':preset(6,'swirl','blob','liquid',{intensity:.8,speed:.6,frequency:4,zoom:.5,edgeStrength:1.5,chromatic:.3,damping:5}),
  'scalloped-frame':preset(2,'tilt','scallop','diagonal',{intensity:.65,speed:1.5,frequency:9,zoom:.1,edgeStrength:1.6,chromatic:.7,damping:10})
});
