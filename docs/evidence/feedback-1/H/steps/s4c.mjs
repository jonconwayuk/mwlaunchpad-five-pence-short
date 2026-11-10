export default async ({ js, click, wait, text, shot, log, type }) => {
  log('4c ask: ' + await click('When will my laptop arrive?')); await wait(2500);
  let t = await text(); log('4c answer: ' + JSON.stringify(t.slice(t.indexOf('Simulated: scripted'), t.indexOf('Simulated: scripted') + 700)));
  log('4d type: ' + await type('input[placeholder="Ask a question"]', 'Can I talk to someone about my lab budget?')); await wait(200);
  log('4d ask: ' + await click('Ask')); await wait(2500);
  t = await text(); log('4d answer: ' + JSON.stringify(t.slice(t.indexOf('lab budget'), t.indexOf('lab budget') + 700)));
  console.log(await js(`[...document.querySelectorAll('button,a,input,textarea')].filter(b=>b.offsetParent).map(b=>b.tagName[0]+':'+(b.textContent.trim()||b.placeholder||'').slice(0,50)).join(' | ')`));
  await shot('04-chat');
};
