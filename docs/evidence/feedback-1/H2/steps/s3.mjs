import { rc } from './rc.mjs';
export default async (c) => {
  const { js, type, click, wait, text, shot, log } = c;
  log('3 people: ' + await rc(c, 'People', 'a'));
  for (let i = 0; i < 40 && (await js('location.pathname')) !== '/portal/people'; i++) await wait(250);
  await wait(2000);
  log('3a find: ' + await type('input[placeholder*="Bob"]', 'Bob')); await wait(800);
  await shot('03-find-bob');
  log('3a open: ' + await rc(c, 'Bob Warwick', 'main a'));
  for (let i = 0; i < 40 && (await js('location.pathname')) === '/portal/people'; i++) await wait(250);
  await wait(3000);
  log('3b suggested: ' + JSON.stringify((await text()).match(/[^\n]*\(suggested\)[^\n]*/)?.[0]) + ' selected: ' + await js(`[...document.querySelectorAll('main select')].map(s=>s.options[s.selectedIndex]?.text).join('|')`));
  log('3b apply: ' + await click('Apply pathway')); await wait(3000);
  log('3b heading: ' + JSON.stringify((await text()).match(/[^\n]*version 1\.\d\.\d[^\n]*/)?.[0]));
};
