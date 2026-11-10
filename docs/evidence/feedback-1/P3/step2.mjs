import { appendFileSync } from 'node:fs';
export default async (c) => {
  const out = (l) => { appendFileSync(new URL('results.txt', import.meta.url), l + '\n'); console.log(l); };
  await c.go('/portal/people/person-bob'); await c.wait(2500);
  out('grade E filter only: ' + await c.click('Clear filters') );
  await c.wait(500);
  out('after Clear filters, titles: ' + await c.js(`[...document.querySelectorAll('li p.font-semibold')].map(e=>e.innerText).join(' || ')`));
  await c.shot('5-cleared');
  await c.select('Grade', 'E'); await c.wait(400);
  out('grade E only, titles: ' + await c.js(`[...document.querySelectorAll('li p.font-semibold')].map(e=>e.innerText).join(' || ')`));
  await c.shot('6-grade-E');
};
