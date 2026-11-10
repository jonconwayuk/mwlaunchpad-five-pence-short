export default async ({ js, click, wait, text, shot, log, select }) => {
  log('5a switch: ' + await select(0, 'Manager')); await wait(3500);
  log('5a url: ' + await js('location.pathname+location.search'));
  const t = await text(); console.log(t.slice(t.indexOf('Desktop') + 7, t.indexOf('Desktop') + 2500));
  await shot('05-hannah');
  console.log(await js(`[...document.querySelectorAll('button,a,input,textarea,select')].filter(b=>b.offsetParent).map(b=>b.tagName[0]+':'+(b.textContent.trim()||b.placeholder||'').slice(0,50)).join(' | ')`));
};
