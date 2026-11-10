export default async ({ js, click, wait, text, shot, log, select }) => {
  log('4b studio: ' + await select(0, 'Onboarding Studio')); for (let i = 0; i < 40 && !(await js(`location.pathname === '/portal' && document.querySelectorAll('select').length > 4`)); i++) await wait(250);
  log('4b demo person: ' + await select(3, 'Bob Warwick')); await wait(300);
  log('4b plus 3 weeks: ' + await click('Plus 3 weeks')); await wait(2500);
  log('4b date: ' + (await text()).match(/Simulated date [^\n]*/)?.[0]);
  log('4b joiner: ' + await select(0, 'Joiner')); await wait(3500);
  const t = await text(); log('4b waiting card: ' + JSON.stringify(t.slice(t.indexOf('Desktop') + 7, t.indexOf('Desktop') + 400)));
  await shot('04-bob-waiting-plus3w');
  log('4c help: ' + await click('Need help?')); await wait(1500);
  const t2 = await text(); console.log(t2.slice(t2.indexOf('Need help') , t2.indexOf('Need help') + 1200));
  console.log(await js(`[...document.querySelectorAll('button,a,input,textarea')].filter(b=>b.offsetParent).map(b=>b.tagName[0]+':'+(b.textContent.trim()||b.placeholder||'').slice(0,40)).join(' | ')`));
  await shot('04-help-open');
};
