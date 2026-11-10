import { toView } from './view.mjs';
export default async (c) => {
  await toView(c, 'Onboarding Studio', '/portal');
  c.log('z reset: ' + await c.click('Reset demo')); await c.wait(3000);
  const s = await (await fetch('http://localhost:3160/api/state?personId=person-bob')).json();
  c.log('z Bob after reset: ' + JSON.stringify(s).slice(0, 90));
};
