import {params} from '../../data/params';
import {$,range,select,check,transport,hint,button} from '../../ui/controls';
import {Scene} from '../../ui/canvas';
import {initialWorld,policy,advance,rollout,type Scenario} from '../../lib/simulation';
import {decode,worldPath,type PathPoint} from '../../lib/bezier';
import {sumTerms,reward,weight,goalTerm,controlPointTerm,type Terms} from '../../lib/rewards';
export function mount(root:HTMLElement){
 root.innerHTML=`<div class="demo-header"><h3 class="demo-title">Reversible lookahead lab</h3><span class="tag">Interactive · scripted policy</span></div><div class="demo-body"><div class="controls config"></div><div class="split"><div><div class="canvas-wrap"></div><div class="controls toggles"></div><div class="stats"><div class="stat"><span>Retained simulation time</span><strong class="real-time">0.0 s</strong></div><div class="stat"><span>Temporary rollout</span><strong class="ghost-time">0 / 20</strong></div><div class="stat"><span>Training reward · illustrative</span><strong class="total">—</strong></div></div><p class="step-description" aria-live="polite"></p><div class="playback"></div></div><aside class="aside"><h4>ALGORITHM 1 · ONE POLICY STEP</h4><ol class="step-list"></ol><div class="reward-breakdown"></div><div class="weights" aria-label="Lookahead weights increase with the substep index"></div><p>cₖ = (0.5 + 1.5 k / Nss) / Nss</p></aside></div><div class="notice">Collision/off-road events can stop the temporary rollout. They never terminate the retained episode here. Controller gains and reward terms are illustrative pending the source PDF.</div></div><div class="demo-footer">Algorithm 1 · Sections III–IV. Ghost vehicles advance jointly in a deep copy. REVAMP discards that future and retains one 0.1 s step. No trained policy runs in this browser.</div>`;
 const config=$(root,'.config'),scene=new Scene($(root,'.canvas-wrap'));let n=20,dt=.1,stop=true,noise=false,scenario:Scenario='avoid',direct=false,speed=1;
 let world=initialWorld(),step=0,ghostIndex=0,acc=0,plans:PathPoint[][]=[],actions:number[][]=[],temp:ReturnType<typeof rollout>|undefined,realTerms:Terms|undefined,lookValue=0,realValue=0,control=0;
 const stepNames=['Observe','Sample action','Decode trajectories','Deep copy state','Joint lookahead','Aggregate reward','Discard copy','Advance real state','Combine rewards'];
 const explanations=['Read the shared scene at the current retained state.','A scripted policy samples an 11-dimensional action for each agent.','Decode every action into a world-space Bézier path and target speeds.','Deep-copy all agents, controller memory, and the simulation clock.','Advance all agents together; interactions are evaluated within the copied world.','Aggregate the weighted future rewards, control-point term, and goal bonus.','Discard the copied future. Retained agents are still at their original positions.','Advance the original agents by exactly one 0.1 s step.','Combine the retained-step reward with the aggregated lookahead reward.'];
 function reset(){world=initialWorld();if(scenario==='goal'){world.agents[0].x=30;world.agents[0].y=-3;}step=0;ghostIndex=0;acc=0;plans=[];temp=undefined;realTerms=undefined;realValue=lookValue=control=0;render();}
 const ns=range(config,'Nss',1,20,1,n,v=>{n=v;reset();});const dti=range(config,"Lookahead Δt′ (s)",.05,.3,.05,dt,v=>{dt=v;reset();});
 select(config,'Mode',[['revamp','REVAMP'],['direct','Direct Nss = 20 · retain all']],v=>{direct=v==='direct';if(direct){n=20;dt=.1;ns.value='20';dti.value='.1';ns.previousElementSibling!.querySelector('output')!.textContent='20';dti.previousElementSibling!.querySelector('output')!.textContent='0.1';}ns.disabled=direct;dti.disabled=direct;reset();});
 select(config,'Scenario',[['avoid','Obstacle avoidance'],['collision','Collision course'],['offroad','Road departure'],['goal','Goal approach']],v=>{scenario=v as Scenario;reset();});
 check($(root,'.toggles'),'Stop temporary rollout on collision / off-road',true,v=>{stop=v;reset();});check($(root,'.toggles'),'Add action noise',false,v=>{noise=v;reset();});
 const list=$(root,'.step-list');stepNames.forEach((name,i)=>{const li=document.createElement('li');const b=button('',()=>{player.pause();reset();let guard=0;while(step<i&&guard++<60)next();render();});b.innerHTML=`<span>${String(i+1).padStart(2,'0')}</span>${name}`;li.append(b);list.append(li);});
 function next(){
 if(step===8){step=0;plans=[];temp=undefined;ghostIndex=0;realTerms=undefined;realValue=lookValue=control=0;if(world.agents[0].x>40)world=initialWorld();render();return;}
 if(step===4&&temp&&ghostIndex<temp.steps.length){ghostIndex++;render();return;}
 step++;
 if(step===1)actions=world.agents.map(v=>policy(v,scenario,noise));
 if(step===2)plans=world.agents.map((v,i)=>worldPath(decode(actions[i],v.speed).points,v,v.heading));
 if(step===3){temp=rollout(world,plans,n,dt,stop&&!direct);ghostIndex=0;}
 if(step===4)ghostIndex=1;
 if(step===5&&temp){control=controlPointTerm(decode(actions[0],world.agents[0].speed).ends);lookValue=temp.weighted+control;}
 if(step===7&&temp){const previous=structuredClone(world.agents[0]);if(direct){world=structuredClone(temp.copy);}else advance(world,plans,params.dt);realTerms=reward(world.agents[0],previous,world.agents);realValue=sumTerms(realTerms);}
 render();
 }
 function render(){scene.clear();scene.road();scene.intersection(params.scene.intersectionX);scene.vehicle(params.scene.obstacle,'obstacle');scene.dot({x:params.scene.goalX,y:-3},'GOAL','#819b70',4);
 if(step>=2)plans.forEach((p,i)=>scene.path(p,i===0?'#176754':'#899a8e',1.8,true));
 if(temp&&step>=4&&step<=6){const fade=step===6?.12:1;const current=temp.steps[Math.max(0,ghostIndex-1)];temp.steps.slice(0,ghostIndex).filter((_,i)=>i%4===0).forEach(s=>s.agents.forEach(v=>scene.vehicle(v,'ghost',.25*fade)));current?.agents.forEach(v=>scene.vehicle(v,'ghost',fade));}
 world.agents.forEach(v=>scene.vehicle(v,v.id===0?'ego':'other'));scene.label('SCRIPTED SCENE / NOT A POLICY ROLLOUT');
 if(temp&&step>=4){const event=temp.steps[Math.max(0,ghostIndex-1)];if(event?.collision||event?.offroad)scene.label(`${event.collision?'COLLISION':'OFF-ROAD'} · ${stop&&!direct?'TEMPORARY ROLLOUT STOPPED':'ROLLOUT CONTINUES'}`,22,320);}
 list.querySelectorAll('button').forEach((b,i)=>{if(i===step)b.setAttribute('aria-current','step');else b.removeAttribute('aria-current');});
 $(root,'.step-description').textContent=`${step+1}. ${direct&&step===6?'Direct keeps the copied future instead of rewinding.':direct&&step===7?'Direct retains all 20 simulated substeps: 2.0 s elapsed.':explanations[step]}`;
 $(root,'.real-time').textContent=`${world.time.toFixed(1)} s`;$(root,'.ghost-time').textContent=`${ghostIndex} / ${n}`;$(root,'.total').textContent=step===8?(direct?realValue:realValue+lookValue).toFixed(3):'—';
 const last=temp?.steps[Math.max(0,ghostIndex-1)];$(root,'.reward-breakdown').innerHTML=`<h4 style="margin-top:18px">LIVE REWARD · SYNTHETIC</h4>${(['align','eff','prog','col','off'] as const).map(k=>`<div class="reward-line"><span>${k} · real / look</span><strong>${(realTerms?.[k]??0).toFixed(2)} / ${(last?.terms[k]??0).toFixed(2)}</strong></div>`).join('')}<div class="reward-line"><span>Control-point / goal</span><strong>${control.toFixed(2)} / ${goalTerm(n,temp?.kg).toFixed(2)}</strong></div><div class="reward-line"><span>r_real / r_look</span><strong>${realValue.toFixed(2)} / ${lookValue.toFixed(2)}</strong></div>`;
 $(root,'.weights').innerHTML=Array.from({length:n},(_,i)=>`<i style="height:${weight(i+1,n)/weight(n,n)*100}%" title="k=${i+1}; c=${weight(i+1,n).toFixed(4)}"></i>`).join('');
 }
 const player=transport($(root,'.playback'),delta=>{acc+=delta*speed;const interval=step===4?.1:params.playback.stepSeconds;if(acc>=interval){acc=0;next();}},reset,next);
 select(player.bar,'Speed',[['1','1×'],['2','2×'],['.5','0.5×']],v=>speed=+v);hint($(root,'.demo-body'),'Watch the retained clock: the ghost future moves, but the real state waits until step 8.');render();
}
