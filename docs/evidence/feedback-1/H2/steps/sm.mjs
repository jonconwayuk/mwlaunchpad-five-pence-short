export default async (c) => {
  const { js, wait, text, shot, log, send, click, select } = c;
  await click('Need help?'); await wait(800); // close the chat again (toggle)
  await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true }); await wait(1500);
  const m = () => js(`JSON.stringify({ sw: document.documentElement.scrollWidth, iw: innerWidth, layout: document.querySelectorAll('select')[2]?.selectedOptions[0]?.text, help: (() => { const b = [...document.querySelectorAll('button,a')].find(b=>b.offsetParent && /Need help/.test(b.textContent)); if (!b) return 'MISSING'; const r=b.getBoundingClientRect(); return Math.round(r.top) + '-' + Math.round(r.bottom); })(), chatOpen: /Simulated: scripted answers/.test(document.body.innerText) })`);
  log('m phone layout at 390: ' + await m());
  await shot('m-390-phone-layout');
  log('m layout: ' + await select(2, 'Desktop')); await wait(2500);
  log('m desktop layout at 390: ' + await m());
  // ServiceNow completes while Bob's view is open: same request the Demo controls button sends, sent from outside the page.
  const t0 = Date.now();
  const r = await fetch('http://localhost:3160/api/simulate', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ personId: 'person-bob', itemId: 'i-equipment', actionId: 'j-equipment-request-a1', result: 'returned' }) });
  log('m simulate: ' + r.status + ' ' + (await r.text()).slice(0, 120));
  let seen = -1, pos = '';
  for (let i = 0; i < 80; i++) { await wait(100); const p = await js(`(() => { const el = document.querySelector('[role=status]'); if (!el || !/request is complete/.test(el.textContent)) return null; const b = el.getBoundingClientRect(); return Math.round(b.top) + '-' + Math.round(b.bottom) + ' of ' + innerHeight + ', scrollY ' + scrollY; })()`); if (p) { seen = Date.now() - t0; pos = p; break; } }
  log(`m banner on the open joiner view ${seen} ms after ServiceNow reported complete, at ${pos}`);
  log('m after banner: ' + await m());
  await shot('m-390-banner');
};
