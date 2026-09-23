import {params,type RewardCoefficients} from '../data/params';
import {collides,type Vehicle} from './vehicle';
import type {Point} from './math';
export const controlPointTerm=(points:Point[],coefficient=params.reward.control)=>coefficient*points.slice(1).reduce((s,p)=>s+Math.abs(p.y),0);
export const isOffroad=(v:Vehicle)=>Math.abs(v.y)+v.width/2>params.scene.roadHalfWidth&&Math.abs(v.x-params.scene.intersectionX)+v.width/2>params.scene.roadHalfWidth;
export const termNames=['align','eff','prog','col','off'] as const;
export type Terms=Record<typeof termNames[number],number>;
export const weight=(k:number,n:number)=>(.5+1.5*k/n)/n;
/** Illustrative term definitions; Eq. 19 aggregation is supplied, definitions/coefficients await PDF. */
export function reward(v:Vehicle,previous:Vehicle,all:Vehicle[],c:RewardCoefficients=params.reward):Terms{
 const collision=all.some(a=>a.id!==v.id&&collides(v,a))||collides(v,params.scene.obstacle);
 const off=isOffroad(v);
 return {align:-Math.abs(v.y)*.1*c.align,eff:v.speed/20*c.eff,prog:(v.x-previous.x)*c.prog,col:collision?c.col:0,off:off?c.off:0};
}
export const sumTerms=(t:Terms)=>Object.values(t).reduce((a,b)=>a+b,0);
export const goalTerm=(n:number,kg:number|undefined,c=params.reward.goal)=>kg===undefined?0:c*(n-kg);
