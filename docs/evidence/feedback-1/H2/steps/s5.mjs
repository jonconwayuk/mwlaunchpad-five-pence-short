import { toView } from './view.mjs';
export default async (c) => {
  const { js, click, wait, text, shot, log, select, type } = c;
  await toView(c, 'Manager', '/team'); log('5a url: ' + await js('location.pathname+location.search'));
  const t = await text();
  log('5a progress: ' + JSON.stringify(t.match(/Bob Warwick[^\n]*\n?[^\n]*/)?.[0]));
  log('5a teams task: ' + JSON.stringify(t.slice(t.indexOf('From a Teams chat') - 200, t.indexOf('From a Teams chat') + 300)));
  log('5a simulated label: ' + JSON.stringify(t.match(/Simulated[^\n]*/g)));
  await shot('05-hannah-teams-task');
};
