export default async ({ go, js, type, click, wait, text, shot, log, select }) => {
  console.log((await text()).match(/Apply a Pathway[\s\S]{0,500}/)?.[0]);
  await go('/portal/people'); await wait(800);
  log('3a find: ' + await type('input[placeholder*="Bob"]', 'Bob')); await wait(600);
  log('3a list: ' + JSON.stringify(await js(`[...document.querySelectorAll('main a')].filter(a=>a.offsetParent).map(a=>a.textContent.slice(0,40))`)));
  await shot('03-find-bob');
};
