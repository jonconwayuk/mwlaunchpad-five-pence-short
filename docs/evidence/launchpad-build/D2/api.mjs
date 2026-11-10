// API proof for D2. Usage: node api.mjs [base]  (default http://localhost:3072, against a freshly seeded db)
const base = process.argv[2] ?? 'http://localhost:3072';
const j = async (path, method = 'GET', body) => {
  const r = await fetch(base + path, { method, headers: { 'content-type': 'application/json' }, body: body && JSON.stringify(body) });
  return { status: r.status, ...(await r.json()) };
};
const ok = (cond, msg) => { console.log(`${cond ? 'PASS' : 'FAIL'} ${msg}`); if (!cond) process.exitCode = 1; };
const titles = async (p) => (await j(`/api/state?personId=${p}&as=hr`)).data?.engineState?.items?.map((i) => i.title).sort() ?? [];

// Decision 22: every seeded Journey posts back unchanged.
const journeys = (await j('/api/journeys')).data;
const rejected = [];
for (const { version, ...def } of journeys) { const r = await j('/api/journeys', 'POST', { ...def, isNew: false }); if (r.status !== 200) rejected.push(`${def.id}: ${r.error}`); }
ok(rejected.length === 0, `re-POST ${journeys.length} seeded Journeys, ${rejected.length} rejected ${rejected.join(' | ')}`);

const draft = (await j('/api/pathways/pw-branch')).data;
const aBefore = await titles('person-a');
// Move a card, add a Journey (Engineering community intro) with a Dependency on Contracting.
const moved = { ...draft, items: [...draft.items.map((i) => (i.id === 'i-uniform' ? { ...i, x: 280, y: 900 } : i)),
  { id: 'i-eng-intro-d2', journeyId: 'j-eng-community', journeyVersion: journeys.find((x) => x.id === 'j-eng-community').version,
    mandatory: true, dependsOn: [{ kind: 'item', itemId: 'i-contracting' }], lane: 'onboarding', x: 516, y: 300 }] };
ok((await j('/api/pathways/pw-branch', 'PUT', moved)).status === 200, 'PUT a moved card and an added Journey with a Dependency');
const back = (await j('/api/pathways/pw-branch')).data;
const u = back.items.find((i) => i.id === 'i-uniform'); const e = back.items.find((i) => i.id === 'i-eng-intro-d2');
ok(u.x === 280 && u.y === 900 && e?.x === 516 && e?.dependsOn[0]?.itemId === 'i-contracting', 'reload GET keeps positions and the Dependency');

// Loop: Contracting waits for Payroll, which already waits for Contracting.
const loop = { ...back, items: back.items.map((i) => (i.id === 'i-contracting' ? { ...i, dependsOn: [{ kind: 'item', itemId: 'i-payroll' }] } : i)) };
const lr = await j('/api/pathways/pw-branch', 'PUT', loop);
ok(lr.status === 400, `PUT with a Dependency loop is refused: ${lr.status} "${lr.error}"`);
const bad = await j('/api/pathways/pw-branch', 'PUT', { ...back, items: [{ ...back.items[0], dependsOn: [{ kind: 'item', itemId: 'nope' }] }] });
ok(bad.status === 400, `PUT with a dangling Dependency is refused: ${bad.status} "${bad.error}"`);
ok((await j('/api/pathways/nope', 'PUT', back)).status === 404, 'PUT to an unknown Pathway is 404');

const pub = await j('/api/pathways/pw-branch/publish', 'POST');
ok(pub.data?.version === 2, `publish returns version ${pub.data?.version}`);

const ap = await j('/api/apply', 'POST', { pathwayId: 'pw-branch', personId: 'person-b' });
ok(ap.status === 200, 'apply pw-branch to person-b');
const bTitles = await titles('person-b');
ok(bTitles.includes('Engineering community intro'), 'newly applied person-b gets the published Journey');
const aAfter = await titles('person-a');
ok(aBefore.length > 0 && JSON.stringify(aAfter) === JSON.stringify(aBefore) && !aAfter.includes('Engineering community intro'), 'person-a existing Applied Pathway is unchanged (ADR-0002)');
