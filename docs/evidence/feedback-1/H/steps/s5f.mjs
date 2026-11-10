export default async ({ js, click, wait, text, shot, log, select }) => {
  log('5f manager: ' + await select(0, 'Manager')); await wait(3500);
  log('5f pick: ' + await click('Have a look at the company car scheme')); await wait(300);
  log('5f send: ' + await click('Send a Reminder now')); await wait(1500);
  let t = await text(); log('5f confirm text: ' + JSON.stringify(t.match(/[^\n]*(Sent|sent)[^\n]*/)?.[0] ?? 'none'));
  log('5f joiner: ' + await select(0, 'Joiner')); await wait(3500);
  t = await text(); log('5f Bob sees reminder: ' + /company car scheme/.test(t));
  await shot('05-reminder-on-bob');
  const btns = await js(`[...document.querySelectorAll('button,input,textarea,select')].filter(b=>b.offsetParent).map(b=>b.tagName[0]+':'+(b.textContent.trim()||b.type||'').slice(0,50)).join(' | ')`);
  console.log(btns);
};
