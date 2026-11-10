import { rc } from './rc.mjs';
import { toView } from './view.mjs';
export default async (c) => {
  const { js, wait, text, shot, log } = c;
  await toView(c, 'Onboarding Studio', '/portal');
  log('7 insights: ' + await rc(c, 'Insights', 'a'));
  for (let i = 0; i < 40 && (await js('location.pathname')) !== '/portal/insights'; i++) await wait(250);
  await wait(3000);
  const t = await text();
  log('7 checks: ' + JSON.stringify({ starters80: /80 past starters/.test(t), longest: t.match(/[^\n]*take longest[^\n]*/)?.[0] }));
  log('7 drill: ' + await rc(c, 'Pre-employment checks', 'main button')); await wait(1500);
  log('7 drill text: ' + JSON.stringify((await text()).match(/[^\n]*usually \d+ to \d+ days[^\n]*/i)?.[0]));
  await shot('07-insights');
};
