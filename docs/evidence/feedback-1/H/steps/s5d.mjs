export default async ({ js, click, wait, text, shot, log, select }) => {
  log('5c journey: ' + await select('Journey', 'Modern Workplace team access package'));
  log('5c unlock: ' + await select('Unlock', 'After Cleared to start')); await wait(300);
  const t0 = Date.now();
  log('5c confirm: ' + await click('Confirm')); await wait(1200);
  log('5c manager sees: ' + /Added|added/.test(await text()));
  await shot('05-added');
  log('5d joiner: ' + await select(0, 'Joiner'));
  let seen = -1;
  for (let i = 0; i < 40; i++) { await wait(250); if (/Modern Workplace team access package/.test(await text())) { seen = Date.now() - t0; break; } }
  log(`5d appeared on Bob's view ${seen} ms after Confirm (includes the view switch)`);
  const t = await text(); const i = t.indexOf('Modern Workplace team access package'); log('5d label: ' + JSON.stringify(t.slice(i, i + 120)));
  await shot('05-bob-sees-addition');
};
