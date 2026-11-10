// Live poll check: Bob's view stays open; Hannah's Addition is posted from the same tab (as her Confirm does); time until Bob's open page shows it without reload.
export default async ({ js, wait, text, log }) => {
  log('5e on: ' + await js('location.pathname'));
  log('5e present before: ' + /Start delay engagement/.test(await text())); const t0 = Date.now();
  log('5e post: ' + await js(`fetch('/api/additions', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ personId: 'person-bob', journeyId: 'j-start-delay', unlock: { kind: 'now' }, mandatory: false, byPersonId: 'lm-hannah' }) }).then(r => r.status)`));
  let seen = -1;
  for (let i = 0; i < 40; i++) { await wait(100); if (/Start delay engagement/.test(await text())) { seen = Date.now() - t0; break; } }
  log(`5e live (no reload): appeared on Bob's open view ${seen} ms after the Addition`);
};
