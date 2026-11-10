export default async ({ js, wait, text, shot, log, click, go, select }) => {
  await go('/portal'); await click('Reset demo'); await wait(3000);
  await go('/portal/people/person-b'); await wait(1500); await select('Pathway', 'Software engineer'); await click('Apply pathway'); await wait(2500);
  await go('/me'); await wait(1000); await select(1, 'Sam Okafor'); await wait(3000);
  await select(0, 'Manager'); await wait(3500);
  await click('Add a journey'); await wait(600);
  log('S9.4 journey: ' + await select('Journey', 'Payments squad access package'));
  log('S9.4 unlock: ' + await select('Unlock', 'After Cleared to start'));
  const t0 = Date.now();
  log('S9.4 confirm (the Add a journey form one): ' + await js(`(() => { const s = [...document.querySelectorAll('select')].find(s => s.closest('label')?.textContent.startsWith('Unlock')); let box = s.parentElement; while (!box.querySelector('button')) box = box.parentElement; const b = [...box.querySelectorAll('button')].find(b => b.textContent.trim() === 'Confirm'); b.click(); return 'clicked'; })()`)); await wait(800);
  await select(0, 'Joiner');
  let seen = -1; for (let i = 0; i < 40; i++) { await wait(200); if (/Added by Chris Lee/.test(await text())) { seen = Date.now() - t0; break; } }
  log(`S9.4 B sees "Added by Chris Lee" after ${seen} ms (includes the view switch)`);
  await shot('s9-B-added');
  await go('/portal'); await wait(1500);
  log('S9.7 person: ' + await select(3, 'Sam Okafor')); log('S9.7 day14: ' + await click('Day 14')); await wait(3000);
  await go('/me'); await wait(3500);
  const p = await text(); const i = p.indexOf('Pulse check'); console.log(JSON.stringify(p.slice(i, i + 600)));
  console.log(await js(`[...document.querySelectorAll('main button, main input')].filter(b=>b.offsetParent).map(b=>b.tagName[0]+':'+(b.textContent.trim()||b.type+'/'+b.value).slice(0,40)).join(' | ')`));
};
