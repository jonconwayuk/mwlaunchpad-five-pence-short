export default async ({ js, text, log, wait }) => {
  await js(`[...document.querySelectorAll('main button')].find(b=>b.textContent.startsWith('Pre-employment checks')).click()`); await wait(1500);
  const t = await text(); log('7c drill: ' + JSON.stringify(t.match(/[^\n]*Pre-employment checks[^\n]*\n[^\n]*\n?[^\n]*usually[^\n]*/i)?.[0] ?? t.match(/[^\n]*21 to 35[^\n]*/)?.[0]));
  log('7c all usually: ' + JSON.stringify(t.match(/usually \d+ to \d+ days/gi)));
};
