import {params} from '../data/params';
import {gaussian} from './math';
import {vehicle,type Vehicle} from './vehicle';
export function corrupt(partners:Vehicle[],xi:number,random=Math.random){const p=params.corruption,missed:Vehicle[]=[],observed:Vehicle[]=[];
 for(const v of partners){if(random()<Math.min(1,xi*p.miss))missed.push({...v});else observed.push({...v,x:v.x+gaussian(random)*xi*p.positionSigma,y:v.y+gaussian(random)*xi*p.positionSigma,heading:v.heading+gaussian(random)*xi*p.headingSigma,speed:Math.max(0,v.speed+gaussian(random)*xi*p.speedSigma)});}
 let phantom:Vehicle|undefined;if(random()<Math.min(1,xi*p.phantom)){const d=Math.sqrt(p.dmin**2+random()*(p.dmax**2-p.dmin**2)),angle=random()*Math.PI*2;phantom=vehicle(-1,d*Math.cos(angle),d*Math.sin(angle),random()*Math.PI*2,random()*p.maxSpeed);}return {missed,observed,phantom};}
