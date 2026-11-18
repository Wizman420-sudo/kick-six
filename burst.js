(function(root){'use strict';
const VERSION='finale-rank-v9';
function create(level){return (level.bursts||[]).map(g=>({...g,taps:[],last:[-Infinity,-Infinity],settled:false,points:0}));}
function active(gates,t){return gates.find(g=>!g.settled&&t>=g.start&&t<g.end);}
function multiplier(n){return Math.min(3,1+Math.floor(n/8)*.25);}
function bonus(n){return Math.round(n*250*multiplier(n))+(n>=24?1000:0);}
function tap(gates,t,lane){const g=active(gates,t);if(!g||![0,1].includes(lane)||!Number.isFinite(t))return null;
const last=g.taps.at(-1);if(t-g.last[lane]<.085-1e-7||(last&&t-last[0]<.035-1e-7)||g.taps.length>=70)return null;
g.taps.push([Math.round(t*1e6)/1e6,lane]);g.last[lane]=t;return g;}
function settle(gates,t){const out=[];for(const g of gates)if(!g.settled&&t>=g.end){g.settled=true;g.points=bonus(g.taps.length);out.push(g);}return out;}
function verify(level,entries){if(!Array.isArray(entries)||entries.length!==(level.bursts||[]).length)throw Error('蓄力数据不完整');const gates=create(level);
for(let i=0;i<gates.length;i++){const entriesForGate=entries[i];if(!Array.isArray(entriesForGate)||entriesForGate.length>70)throw Error('蓄力次数异常');for(const e of entriesForGate){if(!Array.isArray(e)||e.length!==2||!tap(gates,e[0],e[1]))throw Error('蓄力节奏异常');}}
return settle(gates,Infinity).reduce((s,g)=>s+g.points,0);}
const api={VERSION,create,active,tap,settle,bonus,multiplier,verify};if(typeof module!=='undefined')module.exports=api;else root.DoorBurst=api;
})(typeof window==='undefined'?globalThis:window);
