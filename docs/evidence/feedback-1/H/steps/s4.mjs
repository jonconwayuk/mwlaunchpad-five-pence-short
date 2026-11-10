export default async ({ js, click, wait, text, shot, log, select }) => {
  log('4a switch: ' + await select(0, 'Joiner')); await wait(3500);
  log('4a url: ' + await js('location.pathname'));
  const t = await text(); console.log(t.slice(t.indexOf('Desktop') + 7, t.indexOf('Desktop') + 2500));
  await shot('04-bob-pack');
  console.log(await js(`[...document.querySelectorAll('button,a,input,textarea')].filter(b=>b.offsetParent).map(b=>b.tagName[0]+':'+(b.textContent.trim()||b.placeholder||'').slice(0,40)).join(' | ')`));
};
