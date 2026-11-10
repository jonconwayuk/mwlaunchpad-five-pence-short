export default async ({ js, text }) => {
  const t = await text(); const i = t.indexOf('Blocked Flag'); console.log(t.slice(i, i + 1200));
  console.log(await js(`[...document.querySelectorAll('button,select,input')].filter(b=>b.offsetParent).map(b=>b.tagName[0]+':'+(b.textContent.trim()||b.type||'').slice(0,80)).join(' | ')`));
};
