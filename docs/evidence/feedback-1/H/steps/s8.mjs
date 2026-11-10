export default async ({ js, wait, text, shot, log, click, go }) => {
  log('8 reset: ' + await click('Reset demo')); await wait(3000);
  await go('/portal'); await wait(1000);
  let t = await text();
  log('8 date: ' + t.match(/Simulated date [^\n]*/)?.[0] + ' | pathways: ' + JSON.stringify(t.match(/Infrastructure engineer E\tVersion[^\n]*/)?.[0]));
  await go('/portal/people/person-bob'); await wait(1500); t = await text();
  log('8 Bob: ' + JSON.stringify({ noPathway: /No Pathway applied yet/.test(t), noDelegate: /Nobody can act/.test(t) }));
  await go('/portal/journeys'); await wait(1000); t = await text();
  log('8 library: ' + t.match(/\d+ of \d+ Journeys/)?.[0] + ' new Journey present: ' + /Service desk tools access/.test(t));
  await go('/team?viewer=lm-hannah'); await wait(2500); t = await text();
  log('8 Hannah: ' + JSON.stringify({ helpAsk: /lab budget/.test(t), added: /Added by/.test(t), needs: /Needs decision/.test(t) }));
  await shot('08-after-reset');
};
