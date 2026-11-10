export default async ({ js, wait, text, log, shot }) => {
  const submit = (id, v) => js(`(() => { const el = document.getElementById(${JSON.stringify(id)}); if (!el) return 'NO FIELD ' + [...document.querySelectorAll('input[id^=provide]')].map(i=>i.id); Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(el, ${JSON.stringify(v)}); el.dispatchEvent(new Event('input', { bubbles: true })); const b = (el.form ?? el.closest('div,li')).querySelector('button'); b.click(); return 'submitted ' + b.textContent; })()`);
  log('5i checks: ' + await submit('provide-i-checks', 'Synthetic passport ref 0001; proof of address ref 0002')); await wait(2500);
  const t = await text(); log('5i after: ' + JSON.stringify(t.match(/Pre-employment checks\n[^\n]*/)?.[0]));
  await shot('05-bob-documents-submitted');
};
