import { toView } from './view.mjs';
export default async (c) => {
  const { js, click, wait, text, shot, log, select } = c;
  await toView(c, 'Onboarding Studio', '/portal');
  log('d demo person: ' + await select(3, 'Bob Warwick')); await wait(800);
  log('d button enabled: ' + await js(`(() => { const b = [...document.querySelectorAll('button')].find(b=>b.textContent.trim()==='ServiceNow: request complete'); return b ? !b.disabled : 'MISSING'; })()`));
  const t0 = Date.now();
  log('d press: ' + await click('ServiceNow: request complete')); await wait(400);
  log('d studio feedback: ' + JSON.stringify((await text()).match(/[^\n]*(ServiceNow|request complete)[^\n]*/g)));
  await select(0, 'Joiner');
  let seen = -1, inView = '';
  for (let i = 0; i < 40; i++) {
    await wait(100);
    if ((await js('location.pathname')) !== '/me') continue;
    const r = await js(`(() => { const el = [...document.querySelectorAll('[role=status],[role=alert],div,p,section')].filter(e=>e.offsetParent && /request is complete/i.test(e.textContent)).pop(); if (!el) return null; const b = el.getBoundingClientRect(); return { top: Math.round(b.top), bottom: Math.round(b.bottom), h: innerHeight, scrollY, text: el.textContent.slice(0,200) }; })()`);
    if (r) { seen = Date.now() - t0; inView = JSON.stringify(r); break; }
  }
  log(`d banner visible ${seen} ms after the press (includes the view switch): ${inView}`);
  await shot('d-servicenow-banner');
  await wait(1500);
  const t = await text(); log('d equipment card now: ' + JSON.stringify(t.match(/Equipment request\n[^\n]*\n?[^\n]*/g)));
};
