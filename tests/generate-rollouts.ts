import {writeFile,mkdir} from 'node:fs/promises';
import {syntheticRollout,validateRollout} from '../src/lib/rollout';
await mkdir('public/rollouts',{recursive:true});
for(const scenario of ['curved','intersection','overtaking'])for(const method of ['direct1','direct20','revamp'] as const){const data=validateRollout(syntheticRollout(scenario,method));await writeFile(`public/rollouts/${scenario}-${method}.json`,JSON.stringify(data));}
console.log('Generated nine validated, explicitly synthetic rollout assets.');
