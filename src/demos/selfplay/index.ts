import {params} from '../../data/params';
import {vehicle} from '../../lib/vehicle';
import {Scene} from '../../ui/canvas';
import {$,transport,hint} from '../../ui/controls';
export function mount(root:HTMLElement){
 root.innerHTML=`<div class="demo-header"><h3 class="demo-title">Shared-policy self-play showcase</h3><span class="tag">4 synthetic replays</span></div><div class="demo-body"><div class="selfplay-grid"></div><div class="playback"></div><p class="notice">Abstract placeholder layouts, not CARLA-derived recordings. The paper setup uses shared-policy self-play: agents pursue individual goals and respawn. Replace these scenes with real CARLA-derived rollouts to demonstrate the learned behavior.</p></div><div class="demo-footer">Self-play showcase · Synthetic traffic loops illustrate agent-level goals and respawning. Playback starts only when requested and pauses automatically offscreen.</div>`;
 const names=['01 · Four-way junction','02 · Parallel traffic','03 · Cross-traffic','04 · Staggered arrivals'];let time=0;const count=matchMedia('(max-width:720px)').matches?params.playback.mobileAgents:params.playback.showcaseAgents;
 const scenes=names.map(name=>{const p=document.createElement('div');p.className='canvas-wrap';const s=new Scene(p,{xmin:-30,xmax:30,ymin:-18,ymax:18},name+' synthetic self-play');const label=document.createElement('div');label.className='canvas-note';label.innerHTML=`<span>${name}</span><span>PLACEHOLDER</span>`;p.append(label);$(root,'.selfplay-grid').append(p);return s;});
 function draw(){scenes.forEach((s,i)=>{s.clear();s.road();if(i!==1){s.path([{x:0,y:-30},{x:0,y:30}],'#dfe3dc',14*s.scale);s.path([{x:0,y:-30},{x:0,y:30}],'#f7f9f1',2,true);}s.dot({x:27,y:-3},'GOAL','#8fa381',3);
 for(let j=0;j<count;j++){const phase=((time*(3+j%3)+j*60/count+i*7)%60)-30;const vertical=i!==1&&j%3===0;const reverse=j%2===0;const x=vertical?(reverse?-3:3):(reverse?-phase:phase),y=vertical?(reverse?-phase:phase):(reverse?3:-3);const heading=vertical?(reverse?-Math.PI/2:Math.PI/2):(reverse?Math.PI:0);const v=vehicle(j,x,y,heading,3+j%3);s.vehicle(v,j===0?'ego':'other');}
 s.label(`${count} AGENTS · SYNTHETIC`);});}
 transport($(root,'.playback'),dt=>{time+=dt;draw();},()=>{time=0;draw();},()=>{time+=params.dt;draw();});hint($(root,'.demo-body'),'Follow the green agent. At a scene boundary, agents respawn with a new run toward their individual goal.');draw();
}
