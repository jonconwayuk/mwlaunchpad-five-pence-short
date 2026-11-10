export default async ({ js, click, wait, text, shot, log, select }) => {
  log('3c delegate: ' + await click('Add a delegate')); await wait(600);
  log('3c pick: ' + await select('Delegate', 'Lena Brooks')); await wait(300);
  log('3c save: ' + await click('Save delegate')); await wait(2000);
  log('3c shown: ' + JSON.stringify((await text()).match(/Delegate\n+[^\n]*\n?[^\n]*/)?.[0]));
  await shot('03-bob-applied-delegate');
};
