(function(root){'use strict';
const lines={
start:['先站稳，看看这扇门能撑几下。','门关得挺紧，等会儿可别后悔。','姐姐来验验，这门到底有多结实。','看着挺硬气，踹一下就知道了。','别急，好戏才刚开始。','门锁准备好了？姐姐也准备好了。'],
normal:['这个门也太脆了。','装得挺结实，原来全靠嘴硬。','门锁挺认真，可惜门板不争气。','这声儿倒挺响，就是不太扛踹。','别急着散架，姐姐才刚热身。','我还没用劲，你怎么就弯了？','门板看着挺厚，脾气倒挺软。','这么快就露馅，质量不太行啊。','刚才还挺硬气，现在怎么晃了？','门框还站着，门板先认输了。','你负责关紧，我负责踹开。','铰链都比这门板有骨气。','姐姐一抬脚，你就开始发抖。','这也叫结实？我差点就信了。','声音这么大，原来是在给自己壮胆。','别光会响，倒是撑久一点呀。','看着像道门，怎么像纸壳一样？','刚打个招呼，你就快撑不住了。'],
high:['看你能坚持多久。','没有物体能在姐姐的脚下坚持。','节奏才起来，这门就要投降了？','连着几脚，就把底气踹没了。','门板嘴硬，裂缝可不会说谎。','一脚比一脚响，一脚比一脚软。','姐姐还没尽兴，你先撑不住了。','刚才不是很结实吗？接着撑呀。','站得住就继续，下一脚可要来了。','门锁还在努力，门板已经放弃了。','这点硬度，挡不住姐姐的节奏。','越踹越顺手，你倒是争点气。','别装了，我都听见你裂开的声音了。','再来几下，看谁先认输。'],
miss:['哎，刚才那一下没跟上。','门还没倒，节奏先丢了？','门这么脆，可别把拍子打丢了。','差一点点，再接稳一些。','刚才挺顺的，怎么突然手软了？','别走神，下一脚可不等你。','慢了一拍？姐姐可还没尽兴。','断了就重新来，门又不会跑。','这一下慢了，下一拍可别漏。','稳住，门板都没你这么着急。'],
stray:['看清拍点，别光顾着看姐姐。','普通拍点单按，重拍才一起哦。','别抢跑，等它落到圆环上。','手快也要准，跟住这一拍。'],
finish:['这一扇，到此为止。','门锁还在，门的面子可没了。','说好的结实呢？怎么先散架了。','就这点硬度，还想拦住姐姐？','下一扇，希望它能撑久一点。','一扇门而已，轻轻松松。','踹得这么顺，下一扇也别躲。','门板服了，你的手速也跟上了。']};
function create(random=Math.random){const bags={},recent=[];let last=-100,missLast=-100,lastMilestone=0,missStreak=0,afterMiss=false;
function pick(kind){let bag=bags[kind];if(!bag?.length){bag=[...lines[kind]];for(let i=bag.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[bag[i],bag[j]]=[bag[j],bag[i]];}bags[kind]=bag;}let ix=bag.findIndex(x=>!recent.includes(x));if(ix<0)ix=0;const line=bag.splice(ix,1)[0];recent.push(line);if(recent.length>8)recent.shift();return line;}
return{reset(){last=-100;missLast=-100;lastMilestone=0;missStreak=0;afterMiss=false;return{face:1,line:pick('start')};},event(e,combo,time){if(e.kind==='miss'){if(time-missLast<2)return null;missLast=time;last=time;missStreak++;afterMiss=true;return{face:combo>=20?7:missStreak>1?10:9,line:pick('miss')};}if(e.kind==='empty'){if(time-last<4)return null;last=time;return{face:8,line:pick('stray')};}if(!['perfect','great','good'].includes(e.kind))return null;missStreak=0;const milestone=Math.floor(combo/25);const special=milestone>lastMilestone;if(time-last<(afterMiss&&combo>=3?1.2:special?1.8:e.note?.type==='chord'?3.5:5.5))return null;afterMiss=false;last=time;lastMilestone=milestone;const faces=combo>=75?[6,11]:combo>=30?[5,6,4]:combo>=10?[2,3,8]:[1,2,4];return{face:faces[Math.floor(random()*faces.length)],line:pick(combo>=25?'high':'normal')};},finish(full){return{face:full?11:4,line:pick('finish')};}};}
root.ReactionDirector={create,lines};
})(window);
