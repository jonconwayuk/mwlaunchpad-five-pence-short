import { buildEngineInput } from '../../../../src/db/queries';

const i = buildEngineInput('person-a');
const checks = i.history.filter((h) => h.journeyId === 'j-checks').map((h) => h.days).sort((a, b) => a - b);
const q = (p: number) => { const x = (checks.length - 1) * p, f = Math.floor(x); return checks[f]! + (checks[Math.min(f + 1, checks.length - 1)]! - checks[f]!) * (x - f); };
console.log(JSON.stringify({ usualRangeChecks: [q(0.25), q(0.75)], samples: checks.length }));
console.log(JSON.stringify({ ...i, journeys: Object.keys(i.journeys), history: `${i.history.length} samples`,
  pathway: { ...i.pathway, items: i.pathway.items.map((x) => x.id) } }, null, 1));
