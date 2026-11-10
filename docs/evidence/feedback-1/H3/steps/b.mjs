export default async ({ wait, text, shot, js, click, log, type }) => {
  log('open Bob ' + await js(`(() => { const es=[...document.querySelectorAll('button')].filter(e=>e.offsetParent && e.textContent.includes('Bob Warwick')); const e=es[es.length-1]; if(!e) return 'NF'; e.click(); return 'ok '+es.length; })()`));
  await wait(1500);
  const t = await text(); console.log(t.slice(t.indexOf('Reset demo')).slice(0,2500));
  await shot('b1-bob-page');
  console.log(await js(`[...document.querySelectorAll('input,select')].filter(b=>b.offsetParent).map(b=>b.tagName+':'+(b.getAttribute('aria-label')||b.name||b.placeholder||'')+'='+b.value).join(' | ')`));
};
