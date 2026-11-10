export default async ({ js, wait, text, shot, log, select, click }) => {
  log('7 studio: ' + await select(0, 'Onboarding Studio')); for (let i = 0; i < 40 && !(await js(`location.pathname === '/portal' && document.querySelectorAll('select').length > 4`)); i++) await wait(250);
  log('7 insights: ' + await click('Insights', 'nav a, a')); await wait(3500);
  const t = await text(); const i = t.indexOf('Reset demo'); console.log(t.slice(i + 10, i + 2500));
  console.log(await js(`[...document.querySelectorAll('main button, main select, main a')].filter(b=>b.offsetParent).map(b=>b.tagName[0]+':'+(b.textContent.trim()).slice(0,50)).join(' | ')`));
  await shot('07-insights');
};
