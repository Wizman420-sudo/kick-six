(function(root){'use strict';
function samples(kind,rate=48000){const duration={tap:.12,chord:.25,hold:.21,flick:.15}[kind]||.12;const a=new Float32Array(Math.ceil(rate*duration));let seed=kind==='chord'?65431:kind==='hold'?9173:kind==='flick'?5117:2173,previous=0,peak=0;
for(let i=0;i<a.length;i++){const t=i/rate;seed=(Math.imul(seed,1664525)+1013904223)>>>0;const noise=seed/2147483648-1,high=noise-previous;previous=noise;let y;
if(kind==='chord'){const phase=2*Math.PI*(44*t+106*(1-Math.exp(-35*t))/35);y=.76*Math.sin(phase)*Math.exp(-17*t)+.27*noise*Math.exp(-40*t)+.23*high*Math.exp(-170*t)+.095*(Math.sin(2*Math.PI*478*t)+Math.sin(2*Math.PI*711*t)+Math.sin(2*Math.PI*1103*t))*Math.exp(-35*t);}
else if(kind==='hold'){y=.3*Math.sin(2*Math.PI*(510*t+650*t*t))*Math.exp(-19*t)+.2*Math.sin(2*Math.PI*1020*t)*Math.exp(-25*t)+.23*high*Math.exp(-120*t)+.26*Math.sin(2*Math.PI*110*t)*Math.exp(-28*t);}
else if(kind==='flick'){y=.22*noise*Math.exp(-t*24)*Math.min(1,t*180)+.23*Math.sin(2*Math.PI*(850*t+4700*t*t))*Math.exp(-t*26)+.23*high*Math.exp(-t*135)+.18*Math.sin(2*Math.PI*180*t)*Math.exp(-t*40);}
else{y=.32*Math.sin(2*Math.PI*145*t)*Math.exp(-34*t)+.29*high*Math.exp(-145*t)+.17*(Math.sin(2*Math.PI*1600*t)+.35*Math.sin(2*Math.PI*2400*t))*Math.exp(-100*t)+.07*Math.sin(2*Math.PI*3700*t)*Math.exp(-80*t);}
y=Math.tanh(y*2.4);y*=Math.min(1,t*1800)*Math.min(1,(duration-t)*600);a[i]=y;peak=Math.max(peak,Math.abs(y));}
const norm=.74/(peak||1);for(let i=0;i<a.length;i++)a[i]*=norm;return a;}
root.HitSound={samples};
})(window);
