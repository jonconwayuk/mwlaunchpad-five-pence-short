export default async ({ js, text, log }) => {
  const t = await text(); const i = t.indexOf('Talk to a person') >= 0 ? t.indexOf('lab budget?') : 0;
  log('4e chat: ' + JSON.stringify(t.slice(t.indexOf('Need help'), t.indexOf('Your question'))));
  log('4e last part: ' + JSON.stringify(t.slice(t.indexOf('Teams') - 300, t.indexOf('Teams') + 400)));
};
