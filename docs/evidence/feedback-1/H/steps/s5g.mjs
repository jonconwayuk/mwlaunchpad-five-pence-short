export default async ({ js, click, wait, text, shot, log }) => {
  // Click the Got it that sits in the Contracting card (the one under "Read your offer").
  log('5g read offer: ' + await js(`(() => { const h = [...document.querySelectorAll('*')].find(e => e.children.length === 0 && e.textContent.trim() === 'Read your offer' && e.closest('li,section,article,div')?.querySelector('button')); const b = h?.closest('li,section,article,div').querySelector('button'); if (!b) return 'NOT FOUND'; b.click(); return 'clicked ' + b.textContent; })()`)); await wait(2500);
  const t = await text(); const i = t.indexOf('Contracting'); console.log(JSON.stringify(t.slice(i - 300, i + 400)));
  console.log(await js(`[...document.querySelectorAll('button,input,textarea,select')].filter(b=>b.offsetParent).map(b=>b.tagName[0]+':'+(b.textContent.trim()||b.type||'').slice(0,50)).join(' | ')`));
};
