export default async ({ js, text, log }) => {
  log('7b buttons: ' + await js(`[...document.querySelectorAll('main button')].filter(b=>b.offsetParent).map(b=>b.textContent.trim().slice(0,50)).join(' | ')`));
  const t = await text(); log('7b around: ' + JSON.stringify(t.slice(t.search(/usually 45/i) - 300, t.search(/usually 45/i) + 100)));
};
