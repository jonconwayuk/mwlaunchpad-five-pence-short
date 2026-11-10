export default async ({ go, text, wait, js }) => {
  const p = process.env.P; if (p) await go(p);
  await wait(Number(process.env.W ?? 0));
  console.log((await text()).slice(0, Number(process.env.N ?? 3000)));
  if (process.env.B) console.log('BUTTONS:', await js(`[...document.querySelectorAll('button,select,a,input,textarea')].filter(b=>b.offsetParent!==null).map(b=>b.tagName[0]+':'+(b.textContent.trim()||b.getAttribute('aria-label')||b.name||b.placeholder||'').slice(0,40)).join(' | ')`));
};
