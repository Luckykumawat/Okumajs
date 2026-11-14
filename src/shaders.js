export const vertexShader = /* glsl */`
  varying vec2 vUv;
  varying float vDepth;
  uniform float uTime, uStyle, uIntensity, uActivity, uImpulse;
  uniform vec2 uPointer;
  uniform float uScroll, uScrollMode, uHoverMotion;
  void main() {
    vUv = uv;
    vec3 p = position;
    float energy = uIntensity * (0.16 + uActivity * 0.65 + uImpulse * 0.6);
    float edge = sin(uv.x * 3.14159) * sin(uv.y * 3.14159);
    if (uStyle > 2.5 && uStyle < 3.5) {
      p.z += sin(uv.x * 8.0 + uTime * 1.7) * cos(uv.y * 6.0 - uTime) * energy * 0.22 * edge;
      p.xy += vec2(sin(uv.y * 8.0 + uTime), cos(uv.x * 6.0 + uTime)) * energy * 0.025 * edge;
    }
    if (uStyle > 3.5 && uStyle < 4.5) {
      float flag = pow(uv.x, 1.5);
      p.z += sin(uv.x * 9.0 - uTime * 2.5 + uv.y * 3.0) * flag * energy * 0.25;
      p.y += sin(uv.x * 7.0 - uTime * 2.5) * flag * energy * 0.035;
    }
    p.z += sin(distance(uv, uPointer) * 24.0 - uTime * 5.0) * edge * uImpulse * uIntensity * 0.12;
    if (uScrollMode > 0.5 && uScrollMode < 1.5) {
      float phase = uScroll * 2.0 - 1.0;
      p.z += (0.5 - abs(phase)) * 0.22;
      p.x += p.y * phase * 0.13;
      p.y *= 0.86 + 0.14 * sin(uScroll * 3.14159);
    }
    if (uScrollMode > 1.5 && uScrollMode < 2.5) {
      float twist = sin(uv.y * 5.0 + uScroll * 6.28318) * sin(uScroll * 3.14159);
      p.x += twist * 0.105;
      p.z += cos(uv.y * 5.0 + uScroll * 6.28318) * sin(uScroll * 3.14159) * 0.22;
      p.y *= 0.91;
    }
    float hover=uActivity;
    if(uHoverMotion>0.5 && uHoverMotion<1.5) {
      p.z+=(p.x*(uPointer.x-.5)-p.y*(uPointer.y-.5))*hover*.65;
      p.xy*=1.0-hover*.04;
    } else if(uHoverMotion<2.5 && uHoverMotion>1.5) {
      float angle=hover*.11*sin(length(p.xy)*7.0-uTime);
      p.xy=mat2(cos(angle),-sin(angle),sin(angle),cos(angle))*p.xy;
    } else if(uHoverMotion<3.5 && uHoverMotion>2.5) {
      p.z+=abs(p.x)*hover*.5;
      p.x*=1.0-hover*.12;
    } else if(uHoverMotion<4.5 && uHoverMotion>3.5) {
      p.z+=hover*(uv.y-.5)*.45;
      p.y+=hover*.025;
      p.x*=1.0-hover*.07;
    } else if(uHoverMotion<5.5 && uHoverMotion>4.5) {
      p.z+=sin(distance(uv,uPointer)*22.0-uTime*3.0)*hover*.07*edge;
    } else if(uHoverMotion<6.5 && uHoverMotion>5.5) {
      p.x*=1.0+sin(uv.y*6.28318+uTime)*hover*.1;
      p.y*=1.0-hover*.06;
    } else if(uHoverMotion>6.5) {
      p.x+=sin(floor(uv.y*12.0)*3.5+floor(uTime*8.0))*hover*.035;
    }
    vDepth = p.z;
    // A small perspective projection makes the subdivided mesh's depth visible.
    p.xy *= 1.0 + p.z * 0.4;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`;
export const fragmentShader = /* glsl */`
  precision highp float;
  varying vec2 vUv;
  varying float vDepth;
  uniform sampler2D uTextureA, uTextureB;
  uniform vec2 uPointer, uCoverA, uCoverB, uResolution;
  uniform float uTime, uStyle, uIntensity, uFrequency, uActivity, uImpulse;
  uniform float uProgress, uGooey, uZoom, uChromatic;
  uniform float uScroll, uScrollMode, uEdgeMode, uEdgeStrength, uMotion, uTransition;
  vec3 hash3(vec3 p) {
    p = vec3(dot(p,vec3(127.1,311.7,74.7)),dot(p,vec3(269.5,183.3,246.1)),dot(p,vec3(113.5,271.9,124.6)));
    return -1.0 + 2.0 * fract(sin(p) * 43758.5453);
  }
  // Gradient noise, interpolated between the eight corners of a 3D lattice.
  float perlin(vec3 p) {
    vec3 i=floor(p), f=fract(p), w=f*f*f*(f*(f*6.0-15.0)+10.0);
    return mix(mix(mix(dot(hash3(i),f),dot(hash3(i+vec3(1,0,0)),f-vec3(1,0,0)),w.x),
      mix(dot(hash3(i+vec3(0,1,0)),f-vec3(0,1,0)),dot(hash3(i+vec3(1,1,0)),f-vec3(1,1,0)),w.x),w.y),
      mix(mix(dot(hash3(i+vec3(0,0,1)),f-vec3(0,0,1)),dot(hash3(i+vec3(1,0,1)),f-vec3(1,0,1)),w.x),
      mix(dot(hash3(i+vec3(0,1,1)),f-vec3(0,1,1)),dot(hash3(i+vec3(1,1,1)),f-vec3(1,1,1)),w.x),w.y),w.z);
  }
  vec2 cover(vec2 uv, vec2 scale) { return clamp((uv-0.5)*scale+0.5,0.002,0.998); }
  void main() {
    vec2 uv=vUv;
    float t=uTime, activity=0.12+uActivity*0.88;
    float strength=uIntensity*activity;
    float freq=uFrequency;
    vec2 delta=uv-uPointer;
    delta.x*=uResolution.x/uResolution.y;
    float radius=length(delta);
    float field=exp(-radius*radius*9.0);
    vec2 offset=vec2(0.0);
    if (uStyle < 1.5) {
      offset=vec2(sin(uv.y*freq*3.0+t*1.8),cos(uv.x*freq*2.4+t*1.3))*0.025*strength;
      offset+=normalize(delta+0.001)*sin(radius*22.0-t*3.0)*field*0.045*strength;
    } else if (uStyle < 2.5) {
      float angle=atan(delta.y,delta.x)+sin(radius*freq*4.0-t*2.0)*strength;
      vec2 swirl=vec2(cos(angle),sin(angle))*radius;
      offset=(swirl-delta)*field*0.65*strength;
      offset+=vec2(sin(uv.y*15.0+t),cos(uv.x*13.0-t))*0.012*strength;
    } else if (uStyle < 4.5) {
      offset=vec2(vDepth*0.12,sin(uv.x*8.0-t)*vDepth*0.1);
    } else if (uStyle < 5.5) {
      float wave=sin(radius*freq*7.0-t*2.3);
      offset=normalize(delta+0.001)*wave*exp(-radius*2.5)*0.045*strength;
    } else if (uStyle < 6.5) {
      offset=vec2(perlin(vec3(uv*freq,t*0.3)),perlin(vec3(uv*freq+13.4,t*0.3)))*0.15*strength;
    } else {
      vec2 cell=floor(uv*freq*3.0);
      float n=perlin(vec3(cell*0.35,floor(t*5.0)*0.2));
      offset=vec2(n,cos(n*10.0)*0.3)*0.12*strength;
    }
    offset+=normalize(delta+0.001)*sin(radius*38.0-t*6.0)*exp(-radius*3.0)*uImpulse*0.055*uIntensity;
    uv=(uv-0.5)/(1.0+uZoom*uActivity*0.22)+0.5;
    float scrollMask=1.0;
    if(uScrollMode>0.5 && uScrollMode<1.5) {
      uv=(uv-0.5)/(1.0+sin(uScroll*3.14159)*0.32)+0.5;
      uv.y+=(uScroll-0.5)*0.17;
    } else if(uScrollMode>1.5 && uScrollMode<2.5) {
      uv.x+=sin(uv.y*8.0+uScroll*6.28318)*sin(uScroll*3.14159)*0.045;
    } else if(uScrollMode>2.5 && uScrollMode<3.5) {
      float slat=floor(vUv.x*12.0);
      float reveal=clamp(uScroll*1.5-fract(slat*0.618)*0.5,0.0,1.0);
      float strip=abs(fract(vUv.x*12.0)-0.5)*2.0;
      scrollMask=1.0-smoothstep(reveal-0.025,reveal+0.025,strip);
      uv.y+=(1.0-reveal)*0.28*sin(slat*1.7);
    } else if(uScrollMode>3.5) {
      vec2 center=vUv-0.5;
      float r=length(center);
      uv=0.5+center/(1.0+uScroll*0.8)+center*r*r*sin(uScroll*3.14159)*0.9;
      float aperture=mix(0.12,0.73,smoothstep(0.0,0.85,uScroll));
      scrollMask=1.0-smoothstep(aperture-0.012,aperture+0.012,r);
    }
    float transition=sin(uProgress*3.14159265)*uMotion;
    float noise=perlin(vec3(vUv*3.5,t*0.25));
    vec2 flow=vec2(noise,sin(vUv.y*7.0+t))*transition*(0.07+uGooey*0.2);
    float blend=uProgress;
    if(uGooey>0.5) {
      float threshold=vUv.x*0.65+0.175+noise*0.23;
      blend=smoothstep(threshold-0.16,threshold+0.16,uProgress*1.32-0.16);
      if(uProgress<0.001) blend=0.0;
      if(uProgress>0.999) blend=1.0;
    }
    vec2 uvA=uv+offset+flow*uProgress;
    vec2 uvB=uv+offset-flow*(1.0-uProgress);
    if(uMotion>0.5 && uTransition>0.5) {
      float phase=uProgress;
      if(uTransition<1.5){
        float r=length(vUv-uPointer)/1.42;
        blend=smoothstep(r-.07,r+.07,phase*1.2-.1);
        uvA+=normalize(delta+.001)*transition*.1;
      }else if(uTransition<2.5){
        float edge=vUv.x+.13*sin(vUv.y*10.0+phase*6.0);
        blend=smoothstep(edge-.08,edge+.08,phase*1.4-.2);
        uvA.x+=sin(vUv.y*10.0)*transition*.12;uvB.x-=sin(vUv.y*10.0)*transition*.12;
      }else if(uTransition<3.5){
        uvA.x+=phase;uvB.x-=1.0-phase;
        blend=smoothstep(1.0-phase-.015,1.0-phase+.015,vUv.x);
      }else if(uTransition<4.5){
        uvA=(uvA-.5)/(1.0+phase*.9)+.5;
        uvB=(uvB-.5)/(1.9-phase*.9)+.5;
        blend=smoothstep(.15,.85,phase);
      }else if(uTransition<5.5){
        float diagonal=(vUv.x+vUv.y)*.5;
        blend=smoothstep(diagonal-.06,diagonal+.06,phase*1.2-.1);
        uvA.y+=transition*.12;uvB.y-=transition*.12;
      }else{
        vec2 cell=floor(vUv*18.0);
        float order=fract(sin(dot(cell,vec2(12.9898,78.233)))*43758.5453);
        blend=smoothstep(order-.04,order+.04,phase*1.1-.05);
        float pixels=max(10.0,180.0-transition*165.0);
        uvA=mix(uvA,floor(uvA*pixels)/pixels,transition);
        uvB=mix(uvB,floor(uvB*pixels)/pixels,transition);
      }
      if(phase<.001)blend=0.0;
      if(phase>.999)blend=1.0;
    }
    vec2 a=cover(uvA,uCoverA);
    vec2 b=cover(uvB,uCoverB);
    float chroma=uChromatic*(length(offset)+transition*0.01)*0.4;
    vec4 ca=texture2D(uTextureA,a), cb=texture2D(uTextureB,b);
    ca.r=texture2D(uTextureA,clamp(a+vec2(chroma,0),0.002,0.998)).r;
    cb.b=texture2D(uTextureB,clamp(b-vec2(chroma,0),0.002,0.998)).b;
    vec4 color=mix(ca,cb,blend);
    color.rgb*=1.0+vDepth*0.65;
    if(uStyle>6.5) {
      vec2 grid=fract(vUv*freq*3.0);
      float line=1.0-smoothstep(0.015,0.055,min(min(grid.x,grid.y),min(1.0-grid.x,1.0-grid.y)));
      color.rgb+=vec3(0.1,0.8,0.68)*line*strength*0.35;
    }
    // Animate the actual alpha silhouette, not just the pixels inside a rectangle.
    float edgeMask=1.0;
    float amount=uActivity*uEdgeStrength;
    if(uEdgeMode>0.5 && uEdgeMode<1.5) {
      vec2 inset=amount*(vec2(0.035)+0.03*sin(vec2(vUv.y,vUv.x)*22.0+t*2.1));
      vec2 distanceToEdge=min(vUv,1.0-vUv)-inset;
      edgeMask=smoothstep(0.0,0.006,min(distanceToEdge.x,distanceToEdge.y));
    } else if(uEdgeMode>1.5 && uEdgeMode<2.5) {
      vec2 p=(vUv-0.5)*2.0;
      float angle=atan(p.y,p.x);
      float exponent=mix(18.0,2.8,clamp(amount,0.0,1.0));
      float shape=pow(pow(abs(p.x),exponent)+pow(abs(p.y),exponent),1.0/exponent);
      float boundary=1.0-amount*(0.09+0.045*sin(angle*5.0+t*1.5));
      edgeMask=smoothstep(-0.015,0.0,boundary-shape);
      edgeMask=mix(1.0,edgeMask,clamp(amount*5.0,0.0,1.0));
    } else if(uEdgeMode>2.5 && uEdgeMode<3.5) {
      vec2 scallop=amount*(vec2(0.025)+0.065*abs(sin(vec2(vUv.y,vUv.x)*18.84956+t)));
      vec2 d=min(vUv,1.0-vUv)-scallop;
      edgeMask=smoothstep(0.0,0.006,min(d.x,d.y));
    }
    if(uEdgeMode>3.5 && uEdgeMode<4.5){
      vec2 p=abs(vUv-.5)*2.0;
      float diamond=p.x+p.y;
      edgeMask=1.0-smoothstep(2.0-amount*.85-.01,2.0-amount*.85+.01,diamond);
    }else if(uEdgeMode>4.5 && uEdgeMode<5.5){
      float side=amount*(.04+.04*sin(vUv.y*9.0+t*1.3));
      edgeMask=smoothstep(side,side+.008,vUv.x)*smoothstep(side,side+.008,1.0-vUv.x);
      edgeMask*=smoothstep(amount*(.02+.035*sin(vUv.x*8.0-t)),amount*(.02+.035*sin(vUv.x*8.0-t))+.008,1.0-vUv.y);
    }else if(uEdgeMode>5.5 && uEdgeMode<6.5){
      float cut=amount*(.025+.055*fract(sin(floor(vUv.y*10.0)*13.0+floor(t*5.0))*437.5));
      edgeMask=smoothstep(cut,cut+.003,min(vUv.x,1.0-vUv.x));
      edgeMask*=smoothstep(amount*.04,amount*.04+.003,min(vUv.y,1.0-vUv.y));
    }else if(uEdgeMode>6.5){
      vec2 p=(vUv-.5)*2.0;
      float exponent=mix(20.0,3.5,clamp(amount,0.0,1.0));
      float shape=pow(pow(abs(p.x),exponent)+pow(abs(p.y),exponent),1.0/exponent);
      float boundary=1.0-amount*(.055+.04*sin(atan(p.y,p.x)*3.0-t));
      edgeMask=mix(1.0,smoothstep(-.015,0.0,boundary-shape),clamp(amount*5.0,0.0,1.0));
    }
    color.a*=edgeMask*scrollMask;
    gl_FragColor=color;
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;
