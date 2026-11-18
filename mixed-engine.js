(function(root){'use strict';
function create(l){return{history:[],notes:l.notes.map(n=>({...n,status:0,done:false,arms:[null,null]})),held:[false,false],holds:[null,null],window:l.hitWindow,sync:l.syncWindow,score:0,combo:0,best:0,perfect:0,great:0,good:0,miss:0,stray:0,resolved:0,weight:0,ended:false};}
function quality(d){return Math.abs(d)<=.075?'perfect':Math.abs(d)<=.14?'great':'good';}
function award(s,n,kind,delta){if(n.done)return null;n.done=true;n.status=2;n.arms=[null,null];if(s.holds[n.lane]===n)s.holds[n.lane]=null;s.history.push([n.id,kind]);s.resolved++;s[kind]++;s.combo++;s.best=Math.max(s.best,s.combo);const weight=kind==='perfect'?1:kind==='great'?.8:.5;s.weight+=weight;const points=Math.round((n.type==='chord'?2000:n.type==='hold'?1400:800)*weight*(1+Math.min(.8,Math.floor(s.combo/20)*.1)));s.score+=points;return{kind,note:n,points,delta};}
function miss(s,n){if(n.done)return null;n.done=true;n.status=2;n.arms=[null,null];if(s.holds[n.lane]===n)s.holds[n.lane]=null;s.history.push([n.id,'miss']);s.miss++;s.resolved++;s.combo=0;return{kind:'miss',note:n};}
function tick(s,t){if(s.ended)return[];const out=[];for(const n of s.notes){if(n.done)continue;if(n.status===1){if(!s.held[n.lane]&&t>(n.graceUntil||0))out.push(miss(s,n));else if(t>=n.end&&s.held[n.lane])out.push(award(s,n,n.headKind,n.headDelta));}else if(t>n.time+s.window)out.push(miss(s,n));else if(n.type==='chord')for(let i=0;i<2;i++)if(n.arms[i]!==null&&t-n.arms[i]>s.sync)n.arms[i]=null;}return out.filter(Boolean);}
function nearest(s,lane,t,accept){let n=null,d=Infinity;for(const v of s.notes){if(v.status||v.done||(v.type!=='chord'&&v.lane!==lane)||!accept(v))continue;const e=Math.abs(t-v.time);if(e<d){d=e;n=v;}}return d<=s.window?n:null;}
function down(s,lane,t,free=false){if(s.ended||s.held[lane])return null;s.held[lane]=true;if(s.holds[lane])return{kind:'holding',note:s.holds[lane]};const n=nearest(s,lane,t,n=>n.type!=='flick');if(!n){if(free||nearest(s,lane,t,n=>n.type==='flick'))return null;s.history.push([0,'empty']);s.stray++;s.combo=0;return{kind:'empty'};}
if(n.type==='chord'){n.arms[lane]=t;const a=n.arms[0],b=n.arms[1];if(a===null||b===null||!s.held[0]||!s.held[1]||Math.abs(a-b)>s.sync+1e-8)return{kind:'armed',lane,note:n};const error=Math.max(Math.abs(a-n.time),Math.abs(b-n.time));return award(s,n,quality(error),(a+b)/2-n.time);}
const delta=t-n.time;if(n.type==='hold'){n.status=1;n.headKind=quality(delta);n.headDelta=delta;n.graceUntil=0;s.holds[lane]=n;return{kind:'holding',note:n};}return award(s,n,quality(delta),delta);}
function up(s,lane,t){s.held[lane]=false;for(const n of s.notes)if(!n.done)n.arms[lane]=null;const h=s.holds[lane];if(!h||s.ended)return null;return t>=h.end-.09?award(s,h,h.headKind,h.headDelta):miss(s,h);}
function flick(s,lane,t){if(s.ended)return null;const n=nearest(s,lane,t,n=>n.type==='flick');return n?award(s,n,quality(t-n.time),t-n.time):null;}
function suspend(s){s.held=[false,false];for(const n of s.notes)n.arms=[null,null];for(const h of s.holds)if(h)h.graceUntil=Infinity;}
function resume(s,t){for(const h of s.holds)if(h)h.graceUntil=t+.7;}
function finish(s){if(s.ended)return;for(const n of s.notes)if(!n.done)miss(s,n);s.ended=true;s.holds=[null,null];suspend(s);}
function accuracy(s){return s.resolved?Math.max(0,100*s.weight/(s.resolved+s.stray*.12)):0;}
function grade(s){const a=accuracy(s);return a>=95?'S':a>=85?'A':a>=70?'B':a>=50?'C':'D';}
root.ImpactEngine={create,tick,down,up,flick,suspend,resume,finish,accuracy,grade};
})(window);
