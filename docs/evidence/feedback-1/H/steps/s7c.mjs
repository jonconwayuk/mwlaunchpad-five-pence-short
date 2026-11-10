export default async ({ js, wait, text, shot, log, click }) => {
  log('7d drill: ' + await click('Pre-employment checks', 'main button')); await wait(1500);
  const t = await text(); const i = t.lastIndexOf('Pre-employment checks'); log('7d drill-down: ' + JSON.stringify(t.slice(i - 200, i + 600)));
  console.log(await js(`document.querySelector('[role=dialog], [aria-live], details[open]')?.innerText?.slice(0,500) ?? 'no dialog'`));
  await shot('07-drilldown');
};
