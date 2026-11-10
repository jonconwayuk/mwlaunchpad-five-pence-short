export default async ({ js, wait, text, shot, log, click }) => {
  const sect = async () => { const t = await text(); const i = t.indexOf('Journeys by business area'); return t.slice(i, i + 330).replace(/\n+/g, ' / '); };
  log('7b role: ' + await click('Role', 'main button')); await wait(800); log('7b by role: ' + await sect());
  log('7c grade: ' + await click('Grade', 'main button')); await wait(800); log('7c by grade: ' + await sect());
  await shot('07-by-grade');
  log('7d drill: ' + await click('Pre-employment checks', 'main button')); await wait(1500);
  const t = await text(); const i = t.search(/Pre-employment checks[\s\S]{0,40}(spread|starters|every)/); log('7d drill-down: ' + JSON.stringify(t.slice(i, i + 700)));
  await shot('07-drilldown');
  log('7e stage filter: ' + await click('Pre-employment', 'main button')); await wait(1000);
  const t2 = await text(); log('7e: ' + JSON.stringify(t2.match(/How long onboarding[^\n]*/)?.[0]));
};
