import test from 'node:test';
import assert from 'node:assert/strict';
import {decode,worldPath} from '../src/lib/bezier';
import {params} from '../src/data/params';
import {initialWorld,plansFor,rollout,advance} from '../src/lib/simulation';
import {vehicle,collides} from '../src/lib/vehicle';
import {weight,goalTerm} from '../src/lib/rewards';
import {corrupt} from '../src/lib/corruption';
import {seeded} from '../src/lib/math';
import {syntheticRollout,validateRollout} from '../src/lib/rollout';
import {directResults,resolutionResults,robustness,wosacResults} from '../src/data/results';

test('decoding preserves endpoints, samples, speed interpolation, and world transforms',()=>{
 const d=decode(params.presets.left,8);assert.equal(d.points.length,50);assert.deepEqual({x:d.points[0].x,y:d.points[0].y},d.ends[0]);const last=d.points.at(-1)!;assert.equal(last.x,d.ends[2].x);assert.equal(last.y,d.ends[2].y);assert.equal(last.speed,d.speeds[2]);
 const w=worldPath(d.points,{x:10,y:20},Math.PI/2);assert.equal(w[0].x,10);assert.equal(w[0].y,20);assert.ok(Math.abs(w.at(-1)!.x-(10-last.y))<1e-8);
 assert.throws(()=>decode([0],8));assert.throws(()=>decode(Array(11).fill(NaN),8));
});
test('temporary rollout never mutates retained agents or PID memory',()=>{
 const world=initialWorld(),original=structuredClone(world),plans=plansFor(world,'avoid');const result=rollout(world,plans,20,.1,false);assert.deepEqual(world,original);assert.equal(result.steps.length,20);assert.ok(Math.abs(result.copy.time-2)<1e-8);assert.ok(result.copy.agents.every((a,i)=>a.x!==original.agents[i].x||a.y!==original.agents[i].y));
 result.copy.agents[0].integral=999;assert.equal(world.agents[0].integral,0);advance(world,plans,.1);assert.equal(world.time,.1);
});
test('collision early-stop affects temporary rollout only',()=>{
 const world=initialWorld();world.agents[0].x=params.scene.obstacle.x;const before=structuredClone(world);const plans=plansFor(world,'collision');const r=rollout(world,plans,20,.1,true);assert.equal(r.steps.length,1);assert.equal(r.steps[0].collision,true);assert.deepEqual(world,before);advance(world,plans,.1);assert.equal(world.time,.1);
});
test('oriented collision checks and weights handle boundary cases',()=>{
 assert.equal(collides(vehicle(0,0,0),vehicle(1,2,0)),true);assert.equal(collides(vehicle(0,0,0),vehicle(1,6,0)),false);assert.equal(collides(vehicle(0,0,0,Math.PI/2),vehicle(1,0,3)),true);
 assert.equal(weight(1,1),2);assert.equal(weight(20,20),.1);assert.ok(weight(1,20)<weight(20,20));assert.equal(goalTerm(20,10,5),50);assert.equal(goalTerm(20,undefined,5),0);
});
test('zero observation corruption is identity; phantom respects the annulus',()=>{
 const truth=[vehicle(1,10,3)];const clean=corrupt(truth,0,seeded(1));assert.deepEqual(clean.observed,truth);assert.equal(clean.missed.length,0);assert.equal(clean.phantom,undefined);
 let found=false;for(let i=0;i<2000;i++){const sample=corrupt(truth,1.5,seeded(i));if(sample.phantom){found=true;const p=sample.phantom,d=Math.hypot(p.x,p.y);assert.ok(d>=5&&d<=50);assert.ok(p.speed>=0&&p.speed<=15);assert.equal(p.width,1.8);assert.equal(p.length,4.5);break;}}assert.ok(found);
});
test('rollout validation accepts generated files and rejects corrupt or unsynchronized data',()=>{
 for(const s of ['curved','intersection','overtaking'])for(const m of ['direct1','direct20','revamp'] as const){assert.doesNotThrow(()=>validateRollout(syntheticRollout(s,m)));}
 const r=syntheticRollout('curved','revamp');r.frames[1].t=0;assert.throws(()=>validateRollout(r));
 const nan=syntheticRollout('curved','revamp');nan.frames[0].agents[0].x=NaN;assert.throws(()=>validateRollout(nan));
 const duplicate=syntheticRollout('curved','revamp');duplicate.frames[0].agents.push(duplicate.frames[0].agents[0]);assert.throws(()=>validateRollout(duplicate));
 const short=syntheticRollout('curved','revamp');short.frames[0].agents[0].plan!.pop();assert.throws(()=>validateRollout(short));assert.throws(()=>validateRollout({}));
});
test('reported data keeps baseline caveats and all SD cells intact',()=>{
 assert.equal(directResults[0].metrics.success!.mean,93.87);assert.equal(directResults[2].metrics.success!.mean,92.45);assert.equal(wosacResults[3].external,true);assert.equal(resolutionResults[0].metrics.dnf!.sd,14.95);for(const matrix of Object.values(robustness)){assert.equal(matrix.length,3);matrix.flat().forEach(v=>assert.equal(typeof v.sd,'number'));}
});
