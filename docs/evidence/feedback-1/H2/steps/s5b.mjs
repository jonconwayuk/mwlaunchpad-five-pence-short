import { toView } from './view.mjs';
export default async (c) => {
  const { js, click, wait, text, shot, log, select } = c;
  log('5b add: ' + await click('Add a journey')); await wait(800);
  log('5c journey: ' + await select('Journey', 'Modern Workplace team access package'));
  log('5c unlock: ' + await select('Unlock', 'After Cleared to start')); await wait(300);
  log('5c buttons: ' + await js(`[...document.querySelectorAll('form button,[role=dialog] button')].filter(b=>b.offsetParent).map(b=>b.textContent.trim()).join('|')`));
  const t0 = Date.now();
  log('5c confirm: ' + await js(`(() => { const b = [...document.querySelectorAll('button')].find(b => b.offsetParent && b.textContent.trim() === 'Add journey'); if (!b) return 'NOT FOUND'; b.click(); return 'clicked'; })()`)); await wait(1200);
  await shot('05-added');
  await select(0, 'Joiner');
  let seen = -1;
  for (let i = 0; i < 60; i++) { await wait(250); if ((await js('location.pathname')) === '/me' && /Modern Workplace team access package/.test(await text())) { seen = Date.now() - t0; break; } }
  log(`5d appeared on Bob's view ${seen} ms after Add journey (includes the view switch)`);
  const t = await text(); const i = t.indexOf('Modern Workplace team access package'); log('5d label: ' + JSON.stringify(t.slice(i, i + 120)));
  await shot('05-bob-sees-addition');
  await toView(c, 'Manager', '/team');
  log('5f pick: ' + await click('Have a look at the company car scheme')); await wait(300);
  log('5f send: ' + await click('Send a Reminder now')); await wait(1500);
  log('5f confirm text: ' + JSON.stringify((await text()).match(/[^\n]*Reminder sent[^\n]*/)?.[0] ?? 'none'));
  await toView(c, 'Joiner', '/me');
  log('5f Bob sees reminder: ' + /company car scheme/.test(await text()));
  await shot('05-reminder-on-bob');
};
