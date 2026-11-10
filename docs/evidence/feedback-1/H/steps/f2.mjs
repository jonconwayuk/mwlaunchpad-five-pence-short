export default async ({ js, wait, log, go, select }) => {
  await go('/portal/pathways/pw-infra-e'); await wait(4000);
  const lib = () => js(`[...document.querySelectorAll('li[draggable]')].map(l=>l.children[0]?.textContent.replace('Add','')).join(', ')`);
  log('recheck stage: ' + await select(10, 'Onboarding')); await wait(400); log('recheck onboarding: ' + await lib());
  log('recheck grade: ' + await select(12, 'Grade E')); await wait(400); log('recheck onboarding+E: ' + await lib());
};
