export default async ({ go, wait, text, shot, click, js, log }) => {
  await go('/portal'); await click('People','a'); await wait(2000);
  log('A people: ' + (await text()).split('Demo controls')[0].slice(0,0));
  const t = await text(); console.log(t.slice(t.indexOf('Reset demo')));
  await shot('a1-people');
  log('click ' + await click('Add new starter from Workday')); await wait(1500);
  const t2 = await text(); console.log(t2.slice(t2.indexOf('Reset demo')));
  await shot('a2-workday-list');
};
