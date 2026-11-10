export default async ({ js, click, wait, text, shot, log, select }) => {
  log('5b add: ' + await click('Add a journey')); await wait(800);
  const t = await text(); console.log(t.slice(t.indexOf('Add a journey'), t.indexOf('Add a journey') + 900));
  console.log(await js(`[...document.querySelectorAll('form button, form select, form input, [role=dialog] button')].filter(b=>b.offsetParent).map(b=>b.tagName[0]+':'+(b.textContent.trim()||b.type||'').slice(0,80)).join(' | ')`));
};
