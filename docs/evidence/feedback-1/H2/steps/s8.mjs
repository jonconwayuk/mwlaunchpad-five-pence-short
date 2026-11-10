import { rc } from './rc.mjs';
const nav = async (c, label, path) => { await rc(c, label, 'a'); for (let i = 0; i < 40 && (await c.js('location.pathname')) !== path; i++) await c.wait(250); await c.wait(2500); };
export default async (c) => {
  const { js, wait, text, shot, log, click, select } = c;
  await c.go('/portal/pathways'); await wait(3000); // reload after the dev server restart, same tab
  log('8 view: ' + await js('location.pathname') + ' person ' + await js(`document.querySelectorAll('select')[1].selectedOptions[0].text`));
  log('8 reset: ' + await click('Reset demo')); await wait(3500);
  let t = await text();
  log('8 date: ' + t.match(/Simulated date [^\n]*/)?.[0] + ' | infra E: ' + JSON.stringify(t.match(/Infrastructure engineer E[^\n]*\n?[^\n]*/)?.[0]));
  await nav(c, 'Journeys', '/portal/journeys'); t = await text();
  log('8 library: ' + t.match(/\d+ of \d+ Journeys/)?.[0] + ' step 1 Journey present: ' + /Service desk tools access/.test(t));
  await nav(c, 'People', '/portal/people');
  await c.type('input[placeholder*="Bob"]', 'Bob'); await wait(600);
  await rc(c, 'Bob Warwick', 'main a'); for (let i = 0; i < 40 && (await js('location.pathname')) === '/portal/people'; i++) await wait(250); await wait(2500);
  t = await text(); log('8 Bob: ' + JSON.stringify({ noPathway: /No Pathway applied yet/.test(t), noDelegate: /Nobody can act/.test(t) }));
  await shot('08-after-reset');
};
