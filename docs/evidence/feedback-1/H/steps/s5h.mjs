export default async ({ js, click, wait, text, log }) => {
  const fill = (v) => js(`(() => { const el = [...document.querySelectorAll('input')].filter(i => i.offsetParent && !i.closest('[role=group]') && i.getAttribute('aria-label') !== 'Simulated date' && i.type !== 'date').pop(); if (!el) return 'NO FIELD'; Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(el, ${JSON.stringify(v)}); el.dispatchEvent(new Event('input', { bubbles: true })); return 'typed into ' + (el.getAttribute('aria-label') || el.placeholder || el.name || el.outerHTML.slice(0, 80)); })()`);
  for (const [name, v] of [['contract', 'Bob Warwick'], ['payroll or checks', 'Synthetic document ref 0001'], ['next', 'Synthetic document ref 0002']]) {
    log(`5h ${name}: ` + await fill(v)); await wait(200);
    log(`5h ${name} submit: ` + await click('Submit')); await wait(2500);
    const t = await text(); log(`5h after ${name}: ` + JSON.stringify(t.match(/Next: [^\n]*/)?.[0]) + ' checks: ' + JSON.stringify(t.match(/Pre-employment checks\n[^\n]*/)?.[0]));
  }
};
