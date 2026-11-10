export default async ({ go, wait, click, js, log }) => {
  await go('/team?viewer=lm-chris'); await wait(3000);
  await click('Sam Okafor'); await wait(500);
  log('fix2 open form: ' + await click('Add a journey')); await wait(800);
  log('fix2 buttons: ' + await js(`[...document.querySelectorAll('button')].filter(b=>b.offsetParent).map(b=>b.textContent.trim()).filter(t=>/Confirm|Add journey/.test(t)).join(' | ')`));
};
