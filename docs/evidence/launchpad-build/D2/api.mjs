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

// Every seeded draft posts back unchanged.
for (const pw of ['pw-branch', 'pw-engineer', 'pw-executive']) {
  const d = (await j(`/api/pathways/${pw}`)).data; const r = await j(`/api/pathways/${pw}`, 'PUT', d);
  ok(r.status === 200, `PUT the stored ${pw} draft back unchanged: ${r.status} ${r.error ?? ''}`);
}
const nover = await j('/api/pathways/pw-branch', 'PUT', { ...back, items: back.items.map((i, n) => (n === 0 ? { ...i, journeyVersion: 999 } : i)) });
ok(nover.status === 400, `PUT with a Journey version that does not exist is refused: ${nover.status} "${nover.error}"`);
const noAnchorItem = await j('/api/pathways/pw-branch', 'PUT', { ...back, timers: [...back.timers, { id: 't-bad', label: 'Bad', anchor: { kind: 'item-done' }, offsetDays: 3 }] });
ok(noAnchorItem.status === 400, `PUT a Timer item-done without itemId is refused: ${noAnchorItem.status} "${noAnchorItem.error}"`);
const backwards = await j('/api/pathways/pw-branch', 'PUT', { ...back, timers: [...back.timers, { id: 't-bad', label: 'Bad', anchor: { kind: 'offer-accepted' }, offsetDays: -3 }] });
ok(backwards.status === 400, `PUT a negative offset on a non start-date Timer is refused: ${backwards.status} "${backwards.error}"`);
const inContainer = back.containers[0].itemIds[0];
const loose = await j('/api/pathways/pw-branch', 'PUT', { ...back, items: back.items.map((i) => (i.id === inContainer ? { ...i, containerId: undefined } : i)) });
ok(loose.status === 400, `PUT with a Container holding an item that does not name it is refused: ${loose.status} "${loose.error}"`);
// A new Dependency that closes a loop is the one named, even when it sorts before the stored one.
const chain = back.items.find((i) => i.dependsOn.some((d) => d.kind === 'item'));
const on = chain.dependsOn.find((d) => d.kind === 'item').itemId;
const newLoop = await j('/api/pathways/pw-branch', 'PUT', { ...back, items: back.items.map((i) => (i.id === on ? { ...i, dependsOn: [...i.dependsOn, { kind: 'item', itemId: chain.id }] } : i)) });
const tOf = (id) => journeys.find((x) => x.id === back.items.find((i) => i.id === id).journeyId).title;
const wantMsg = `${tOf(chain.id)} already waits for ${tOf(on)}, so ${tOf(on)} cannot wait for ${tOf(chain.id)}.`;
ok(newLoop.status === 400 && newLoop.error === wantMsg, `the loop message names the new Dependency (${tOf(on)} waits for ${tOf(chain.id)}): "${newLoop.error}"`);

// E1 security review: loops through a Container or a Timer are refused too, so /api/state never meets one.
const member = back.containers[0].itemIds[0];
const viaC = await j('/api/pathways/pw-branch', 'PUT', { ...back, items: back.items.map((i) => (i.id === member ? { ...i, dependsOn: [{ kind: 'container', containerId: back.containers[0].id }] } : i)) });
ok(viaC.status === 400, `PUT a Journey that waits for its own Container is refused: ${viaC.status} "${viaC.error}"`);
const viaT = await j('/api/pathways/pw-branch', 'PUT', { ...back, timers: [...back.timers, { id: 't-self', label: 'Self', anchor: { kind: 'item-done', itemId: member }, offsetDays: 1 }],
  items: back.items.map((i) => (i.id === member ? { ...i, dependsOn: [{ kind: 'timer', timerId: 't-self' }] } : i)) });
ok(viaT.status === 400, `PUT a Journey that waits for a Timer anchored on itself is refused: ${viaT.status} "${viaT.error}"`);

const pub = await j('/api/pathways/pw-branch/publish', 'POST');
ok(pub.data?.version === 2, `publish returns version ${pub.data?.version}`);

const ap = await j('/api/apply', 'POST', { pathwayId: 'pw-branch', personId: 'person-b' });
ok(ap.status === 200, 'apply pw-branch to person-b');
const bTitles = await titles('person-b');
ok(bTitles.includes('Engineering community intro'), 'newly applied person-b gets the published Journey');
const aAfter = await titles('person-a');
ok((await j('/api/state?personId=person-b&as=hr')).status === 200, 'person-b state still loads after publish and apply');
ok(aBefore.length > 0 && JSON.stringify(aAfter) === JSON.stringify(aBefore) && !aAfter.includes('Engineering community intro'), 'person-a existing Applied Pathway is unchanged (ADR-0002)');
