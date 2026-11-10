export default async ({ go, js, click, wait, text, shot, log, select }) => {
  log('3a open: ' + await click('Bob Warwick', 'main a')); await wait(2500);
  const t = await text(); console.log(t.slice(t.indexOf('Bob Warwick\n'), t.indexOf('Bob Warwick\n') + 900));
};
