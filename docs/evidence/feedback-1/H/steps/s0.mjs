export default async ({ click, wait, text, log }) => {
  log('step0 reset: ' + await click('Reset demo')); await wait(2500);
  log('step0 after: ' + (await text()).match(/Applied \d+ times?/g)?.join(','));
};
