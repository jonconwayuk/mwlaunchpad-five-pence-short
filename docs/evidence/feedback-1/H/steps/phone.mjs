export default async ({ go, wait, select, shot, log, js }) => {
  await go('/portal'); await wait(1500);
  log('phone layout: ' + await select(2, 'Phone')); await wait(1500);
  await go('/persona/A'); await wait(500); await go('/me'); await wait(3500);
  log('phone frame width: ' + await js(`document.querySelector('.w-\\\\[390px\\\\]')?.getBoundingClientRect().width ?? 'no frame'`));
  await shot('09-phone-layout-joiner');
};
