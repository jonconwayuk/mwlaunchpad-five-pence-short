export default async ({ js, click, wait, text, shot, log, select }) => {
  const t0 = await text(); log('5j Bob before: ' + JSON.stringify(t0.match(/Pre-employment checks\n[^\n]*\n[^\n]*/)?.[0]));
  log('5j studio: ' + await select(0, 'Onboarding Studio')); for (let i = 0; i < 40 && !(await js(`location.pathname === '/portal' && document.querySelectorAll('select').length > 4`)); i++) await wait(250);
  log('5j waiting: ' + await select(4, 'Bob Warwick: Pre-employment checks')); await wait(300);
  log('5j fail: ' + await click('Simulate failed')); await wait(2500);
  log('5j joiner: ' + await select(0, 'Joiner')); await wait(3500);
  const tb = await text(); log('5j Bob after fail (should be unchanged): ' + JSON.stringify(tb.match(/Pre-employment checks\n[^\n]*\n[^\n]*/)?.[0]) + ' recruiter? ' + /recruiter/.test(tb));
  await shot('05-bob-after-fail');
  log('5j manager: ' + await select(0, 'Manager')); await wait(3500);
  const t = await text(); const i = t.indexOf('To-do'); log('5j Hannah: ' + JSON.stringify(t.slice(i, i + 500)));
  console.log(await js(`[...document.querySelectorAll('button,textarea,input')].filter(b=>b.offsetParent).map(b=>b.tagName[0]+':'+(b.textContent.trim()||b.placeholder||b.type||'').slice(0,50)).join(' | ')`));
  await shot('05-hannah-needs-decision');
};
