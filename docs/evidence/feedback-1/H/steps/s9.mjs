// BUILD-PLAN section 9, items 2 to 8, for personas A and B, in the same single tab (item 1, the canvas, is the Bob walk's step 2).
export default async ({ js, wait, text, shot, log, click, go, select }) => {
  const has = async (re) => re.test(await text());
  await go('/portal'); await click('Reset demo'); await wait(3000);
  log('S9.2 filter: ' + await select(5, 'Branch')); await wait(800);
  log('S9.2 filtered list: ' + JSON.stringify((await text()).match(/(Branch colleague|Software engineer|Executive|Infrastructure engineer E)\tVersion/g)));
  for (const [pid, pw] of [['person-a', 'Branch colleague'], ['person-b', 'Software engineer']]) {
    await go(`/portal/people/${pid}`); await wait(1500);
    log(`S9.2 ${pid} pick: ` + await select('Pathway', pw)); log(`S9.2 ${pid} apply: ` + await click('Apply pathway')); await wait(2500);
    log(`S9.2 ${pid} applied: ` + JSON.stringify((await text()).match(/Applied Pathway: [^\n]*/)?.[0]));
  }
  await go('/portal'); await wait(1000);
  log('S9.3 A: ' + await select(1, 'Alex Morgan')); await wait(500); await select(0, 'Joiner'); await wait(3500);
  const a = await text(); log('S9.3 A pack: ' + JSON.stringify({ device: /Branch device/.test(a), uniform: /Uniform/.test(a) }));
  log('S9.5 A wait: ' + JSON.stringify(a.match(/Day \d+ of your wait/)?.[0]) + ' ' + JSON.stringify(a.match(/Usually [^\n]*/)?.[0]));
  await shot('s9-A');
  await select(1, 'Sam Okafor'); await wait(3500);
  const b = await text(); log('S9.3 B pack: ' + JSON.stringify({ device: /Developer device/.test(b), community: /Engineering community intro/.test(b) }));
  await select(0, 'Manager'); await wait(3500);
  log('S9.4 viewer: ' + await js('location.search'));
  await click('Add a journey'); await wait(600);
  log('S9.4 journey: ' + await select('Journey', 'Payments squad access package'));
  log('S9.4 unlock: ' + await select('Unlock', 'After Cleared to start'));
  const t0 = Date.now(); log('S9.4 confirm: ' + await click('Confirm')); await wait(800);
  await select(0, 'Joiner');
  let seen = -1; for (let i = 0; i < 40; i++) { await wait(200); if (/Added by Chris Lee/.test(await text())) { seen = Date.now() - t0; break; } }
  log(`S9.4 B sees "Added by Chris Lee" after ${seen} ms`);
  await shot('s9-B-added');
  await select(0, 'Onboarding Studio'); await wait(3000);
  log('S9.6 waiting: ' + await select(4, 'Alex Morgan: Pre-employment checks')); log('S9.6 fail: ' + await click('Simulate failed')); await wait(2500);
  await go('/portal/people/person-a'); await wait(1500); log('S9.6 HR Needs decision: ' + await has(/Needs decision/));
  await go('/team?viewer=lm-priya'); await wait(2500); log('S9.6 LM Needs decision: ' + await has(/Needs decision/));
  await go('/me'); await select(1, 'Alex Morgan'); await wait(3500); const a2 = await text();
  log('S9.6 A unchanged: ' + JSON.stringify({ wait: a2.match(/Day \d+ of your wait/)?.[0], recruiter: /recruiter/.test(a2), failed: /fail/i.test(a2) }));
  await go('/portal'); await wait(1500);
  log('S9.7 person: ' + await select(3, 'Sam Okafor')); log('S9.7 day14: ' + await click('Day 14')); await wait(3000);
  await go('/me'); await select(1, 'Sam Okafor'); await wait(3500);
  const p = await text(); log('S9.7 B Pulse check shown: ' + /Pulse check/.test(p) + ' radios: ' + await js(`document.querySelectorAll('input[type=radio]').length`));
  log('S9.7 answer 2s: ' + await js(`(() => { const groups = {}; for (const r of document.querySelectorAll('input[type=radio]')) (groups[r.name] ??= []).push(r); const g = Object.values(groups); for (const rs of g) (rs.find(r => r.value === '2') ?? rs[1]).click(); return g.length + ' questions'; })()`)); await wait(300);
  log('S9.7 send: ' + await click('Send') ); await wait(2500);
  await go('/team?viewer=lm-chris'); await wait(2500); const c = await text();
  log('S9.7 Chris Task: ' + JSON.stringify(c.match(/[^\n]*scored 2[^\n]*/)?.[0] ?? 'none'));
  await shot('s9-chris-pulse');
  await go('/portal'); await click('Reset demo'); await wait(3000); await go('/portal'); await wait(1000);
  log('S9.8 reset: ' + JSON.stringify((await text()).match(/Simulated date [^\n]*/)?.[0]));
};
