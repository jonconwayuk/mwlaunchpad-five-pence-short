export default async ({ js, click, wait, text, shot, log }) => {
  log('4e handover: ' + await click('Talk to a person')); await wait(2500);
  const t = await text(); log('4e result: ' + JSON.stringify(t.slice(t.indexOf('lab budget'), t.indexOf('lab budget') + 500)));
  await shot('04-handover');
};
