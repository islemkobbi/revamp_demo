import {params} from '../data/params';
import {clamp,distance,wrap} from './math';
import {integrate,type Vehicle} from './vehicle';
import type {PathPoint} from './bezier';
/** Illustrative gains, pending Appendix A equations 41–45. */
export function track(v:Vehicle,path:PathPoint[],dt:number){
 if(path.length<2)return;let near=0;for(let i=1;i<path.length;i++)if(distance(v,path[i])<distance(v,path[near]))near=i;
 let target=near,arc=0;const g=params.controller;const ld=g.lookaheadBase+g.lookaheadSpeed*v.speed;
 while(target<path.length-1&&arc<ld){arc+=distance(path[target],path[target+1]);target++;}
 const p=path[target],n=path[near],next=path[Math.min(near+1,path.length-1)];const pathHeading=Math.atan2(next.y-n.y,next.x-n.x);
 const alpha=wrap(Math.atan2(p.y-v.y,p.x-v.x)-v.heading);const cte=-(v.x-n.x)*Math.sin(pathHeading)+(v.y-n.y)*Math.cos(pathHeading);
 const steer=Math.atan2(2*params.vehicle.wheelbase*Math.sin(alpha),Math.max(.1,distance(v,p)))+g.headingGain*wrap(pathHeading-v.heading)-Math.atan2(g.crossTrackGain*cte,1+v.speed);
 const error=p.speed-v.speed;v.integral=clamp(v.integral+error*dt,-g.integralLimit,g.integralLimit);const acc=g.kp*error+g.ki*v.integral+g.kd*(error-v.lastError)/dt;v.lastError=error;integrate(v,steer,acc,dt);
}
