export default async ({ js, wait, text, shot, log, select }) => {
  log('5l joiner: ' + await select(0, 'Joiner')); await wait(3500);
  let t = await text(); log('5l Bob after dismiss: ' + JSON.stringify(t.match(/Pre-employment checks\n[^\n]*/)?.[0]) + ' ID: ' + JSON.stringify(t.match(/ID creation \(photo\)\n[^\n]*/)?.[0]));
  log('6 buddy: ' + await select(0, 'Buddy')); await wait(3500);
  log('6 url: ' + await js('location.pathname+location.search'));
  t = await text(); const i = t.indexOf('Your starters'); log('6 Leo sees: ' + JSON.stringify(t.slice(i, i + 900)));
  log('6 leaks? ' + JSON.stringify({ needsDecision: /Needs decision/.test(t), failed: /fail/i.test(t), lab: /lab budget/.test(t), reminder: /Send a Reminder/.test(t), addJourney: /Add a journey/.test(t), pulse: /scored/.test(t) }));
  await shot('06-leo-buddy');
};
