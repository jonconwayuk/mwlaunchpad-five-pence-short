export default async ({ wait, text, shot, js, log }) => {
  const r = await js(`(() => { const b=[...document.querySelectorAll('button')].filter(b=>b.textContent.trim()==='Add' && b.offsetParent)[0]; window.__t0=performance.now(); b.click(); return 'ok'; })()`);
  let ms = -1;
  for (let i=0;i<60;i++){ await wait(100); const found = await js(`[...document.querySelectorAll('a,button,li')].some(e=>e.offsetParent && e.textContent.includes('Maya Rahman') && /No Pathway|Not started/.test(e.textContent))`); if (found===true){ ms = Math.round(await js('performance.now()-window.__t0')); break; } }
  log('A Maya appears after ms: ' + ms);
  await shot('a3-maya-added');
  const t = await text(); console.log(t.slice(t.indexOf('Reset demo')));
};
