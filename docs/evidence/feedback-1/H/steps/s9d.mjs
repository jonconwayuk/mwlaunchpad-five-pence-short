export default async ({ js, wait, text, shot, log, go, click }) => {
  for (let q = 0; q < 4; q++) {
    const r = await js(`(() => { const b = [...document.querySelectorAll('main button')].find(b => b.offsetParent && b.textContent.trim() === '2'); if (!b) return 'none'; b.click(); return 'clicked 2'; })()`);
    log(`S9.7 answer ${q + 1}: ` + r); if (r === 'none') break; await wait(2000);
  }
  await go('/team?viewer=lm-chris'); await wait(3000); const c = await text();
  log('S9.7 Chris Task: ' + JSON.stringify(c.match(/[^\n]*scored[^\n]*/)?.[0] ?? 'none'));
  await shot('s9-chris-pulse');
  await go('/portal'); await click('Reset demo'); await wait(3000); await go('/portal'); await wait(1000);
  log('S9.8 reset: ' + JSON.stringify((await text()).match(/Simulated date [^\n]*/)?.[0]));
};
