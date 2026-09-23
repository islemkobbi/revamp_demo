import {params} from '../data/params';
import {decode,worldPath,type PathPoint} from './bezier';
import {track} from './controller';
import {clamp} from './math';
import {reward,sumTerms,weight,goalTerm,isOffroad,type Terms} from './rewards';
import {vehicle,collides,type Vehicle} from './vehicle';
export type Scenario='avoid'|'collision'|'offroad'|'goal';
export type World={agents:Vehicle[];time:number};
export type RollStep={agents:Vehicle[];terms:Terms;k:number;collision:boolean;offroad:boolean};
export const initialWorld=():World=>({agents:[vehicle(0,0,0),vehicle(1,params.scene.intersectionX,-8,Math.PI/2,5),vehicle(2,7,-4,0,6)],time:0});
export function policy(v:Vehicle,scenario:Scenario='avoid',noise=false):number[]{
 const a=[...params.presets.straight];
 if(v.id===0){const target=scenario==='offroad'?11:scenario==='collision'?0:scenario==='goal'?0:-3.5;
 const s=2+v.speed/4;a[2]=clamp((target-v.y)/(s),-1,1);a[7]=clamp((target-v.y)/(2*s),-1,1);a[4]=a[2]*.5;a[9]=0;
 if(v.x>24){a[2]=clamp(-v.y/s,-1,1);a[7]=clamp(-v.y/(2*s),-1,1);}
 }
 if(noise)for(let i=0;i<a.length;i++)a[i]=clamp(a[i]+(Math.random()-.5)*.2,-1,1);
 return a;
}
export const plansFor=(world:World,scenario:Scenario,noise=false)=>world.agents.map(v=>worldPath(decode(policy(v,scenario,noise),v.speed).points,v,v.heading));
/** All controls are computed from the same pre-step state. Every agent advances once. */
export function advance(world:World,plans:PathPoint[][],dt:number){world.agents.forEach((v,i)=>track(v,plans[i],dt));world.time+=dt;}
export function rollout(world:World,plans:PathPoint[][],n:number,dt:number,stop:boolean){
 const copy=structuredClone(world),steps:RollStep[]=[];let kg:number|undefined;
 for(let k=1;k<=n;k++){const prev=structuredClone(copy.agents[0]);advance(copy,plans,dt);const ego=copy.agents[0];const terms=reward(ego,prev,copy.agents);const collision=copy.agents.some(v=>v.id!==ego.id&&collides(ego,v))||collides(ego,params.scene.obstacle);const offroad=isOffroad(ego);
 if(kg===undefined&&ego.x>=params.scene.goalX)kg=k;
 steps.push({agents:structuredClone(copy.agents),terms,k,collision,offroad});if(stop&&(collision||offroad))break;}
 return {steps,copy,kg,weighted:steps.reduce((s,r)=>s+weight(r.k,n)*sumTerms(r.terms),0)+goalTerm(n,kg)};
}
