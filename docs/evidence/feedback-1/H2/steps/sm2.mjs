export default async ({ js, wait, shot, log, send, select }) => {
  await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
  log('m2 layout: ' + await select(2, 'Phone')); await wait(2500);
  log('m2 phone layout at 390: ' + await js(`JSON.stringify({ sw: document.documentElement.scrollWidth, iw: innerWidth, banner: (() => { const el = document.querySelector('[role=status]'); if (!el) return 'MISSING'; const b = el.getBoundingClientRect(); return Math.round(b.top)+'-'+Math.round(b.bottom); })(), help: (() => { const b = [...document.querySelectorAll('button,a')].find(b=>b.offsetParent && /Need help/.test(b.textContent)); if (!b) return 'MISSING'; const r=b.getBoundingClientRect(); return Math.round(r.top) + '-' + Math.round(r.bottom); })() })`));
  await shot('m-390-phone-layout');
  await send('Emulation.clearDeviceMetricsOverride'); await wait(1000);
};
