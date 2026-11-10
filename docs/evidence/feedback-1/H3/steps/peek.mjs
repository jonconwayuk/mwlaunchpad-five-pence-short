export default async ({ go, wait, text, shot, click, js }) => {
  await go('/portal?view=people'); await wait(4000);
  console.log(await js('location.href'));
  console.log((await text()).slice(0,1500));
  console.log(await js(`[...document.querySelectorAll('button,a,select')].filter(b=>b.offsetParent).map(b=>b.tagName+':'+b.textContent.trim().slice(0,30)).join(' | ')`));
};
