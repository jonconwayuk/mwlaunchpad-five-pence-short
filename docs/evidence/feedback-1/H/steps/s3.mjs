export default async ({ go, js, type, click, wait, text, shot, log, select }) => {
  await go('/portal/people'); await wait(800);
  log('3a find: ' + await type('input', 'Bob')); await wait(500);
  log('3a list: ' + JSON.stringify(await js(`[...document.querySelectorAll('main a')].filter(a=>a.offsetParent).map(a=>a.textContent.slice(0,14))`)));
  log('3a open: ' + await click('Bob Warwick', 'main a')); await wait(2500);
  log('3b apply: ' + await click('Apply pathway')); await wait(2500);
  log('3b applied: ' + ((await text()).match(/Applied Pathway\n+[^\n]*\n?[^\n]*/)?.[0].replace(/\n+/g, ' / ')));
  log('3c delegate: ' + await click('Add a delegate')); await wait(800);
  console.log((await text()).match(/Delegate[\s\S]{0,400}/)?.[0]);
  console.log(await js(`[...document.querySelectorAll('select,button')].filter(b=>b.offsetParent).slice(-8).map(b=>b.tagName+':'+b.textContent.slice(0,60)).join(' | ')`));
};
