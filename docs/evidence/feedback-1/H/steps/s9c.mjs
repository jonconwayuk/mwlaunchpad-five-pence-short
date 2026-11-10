export default async ({ js, wait, text, shot, log, click, go }) => {
  const inCard = (label) => js(`(() => { const h = [...document.querySelectorAll('*')].find(e => e.children.length === 0 && e.textContent.trim() === 'A quick check-in'); let box = h?.parentElement; while (box && !box.querySelector('button')) box = box.parentElement; const b = box && [...box.querySelectorAll('button')].find(b => b.textContent.trim() === ${JSON.stringify(label)}); if (!b) return 'NOT FOUND'; b.click(); return 'clicked'; })()`);
  log('S9.7 check-in: ' + await inCard('Got it')); await wait(2500);
  const p = await text(); const i = p.indexOf('Pulse check'); log('S9.7 Pulse: ' + JSON.stringify(p.slice(i, i + 500)));
  console.log(await js(`[...document.querySelectorAll('main button, main input')].filter(b=>b.offsetParent).map(b=>b.tagName[0]+':'+(b.textContent.trim()||b.type+'/'+b.value+'/'+b.name).slice(0,40)).join(' | ')`));
  await shot('s9-B-pulse');
};
