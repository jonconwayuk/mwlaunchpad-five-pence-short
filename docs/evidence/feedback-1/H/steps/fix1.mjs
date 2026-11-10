export default async ({ wait, text, log, go, click, shot }) => {
  await go('/portal'); await click('Reset demo'); await wait(3000);
  await go('/portal/pathways/pw-infra-e'); await wait(4000);
  await click('Publish'); await wait(500); await click('New content'); await wait(3000);
  log('fix1 header: ' + (await text()).match(/Live version [^\n]*/)?.[0]);
  await go('/portal/people/person-bob'); await wait(1500); await click('Apply pathway'); await wait(2500);
  log('fix1 People: ' + (await text()).match(/Applied Pathway: [^\n]*/)?.[0]);
  await shot('fix1-people-semver');
  await go('/portal'); await click('Reset demo'); await wait(3000);
};
