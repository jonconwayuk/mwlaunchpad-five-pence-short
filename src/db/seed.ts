// Wipes and reseeds the whole database from SEED-DATA.md. Run with `npm run seed`.
// Deterministic: every date derives from DEMO_T and history comes from a seeded generator.
import { sqlite, db } from './client';
import * as s from './schema';
import { applyPathway, addAdditionToApplied, insertJourney, publishPathway, recordActionProgress, recordOverride, savePathwayDraft } from './queries';
import { buildTemplate, DEMO_T, JOURNEYS, PERSON_A_ADDITIONS, PERSONS, TEMPLATES } from './seedData';
import { resetAdapters } from '../adapters/types';
import { log } from '../lib/log';
import type { ISODate } from '../engine/types';

const addDays = (d: ISODate, n: number): ISODate => {
  const t = new Date(`${d}T00:00:00Z`);
  t.setUTCDate(t.getUTCDate() + n);
  return t.toISOString().slice(0, 10);
};

// mulberry32: small seeded pseudo-random function.
function rng(seed: number) {
  let a = seed;
  return (lo: number, hi: number) => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return lo + Math.floor((((t ^ (t >>> 14)) >>> 0) / 4294967296) * (hi - lo + 1));
  };
}

// 20 past starters per Pathway. Pre-employment checks is pinned so its interquartile range is 21 to 35 days.
function checksDays(r: ReturnType<typeof rng>): number[] {
  const rep = (n: number, f: () => number) => Array.from({ length: n }, f);
  return [...rep(3, () => r(14, 20)), ...rep(4, () => 21), ...rep(6, () => r(22, 34)), ...rep(4, () => 35), ...rep(3, () => r(36, 48))];
}

export function seed(): void {
  resetAdapters();
  sqlite.transaction(() => {
    for (const { name } of sqlite.prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%'").all() as { name: string }[]) {
      sqlite.exec(`DELETE FROM ${name}`);
    }
    sqlite.exec('DELETE FROM sqlite_sequence');

    db.insert(s.demoClock).values({ id: 1, today: DEMO_T }).run();
    for (const p of PERSONS) {
      db.insert(s.persons).values({
        id: p.id, name: p.name, role: p.role, tags: p.tags,
        offerAcceptedDate: p.offerDays === undefined ? null : addDays(DEMO_T, p.offerDays),
        startDate: p.startDays === undefined ? null : addDays(DEMO_T, p.startDays),
        lineManagerId: p.lineManagerId ?? null, buddyId: p.buddyId ?? null, delegateId: p.delegateId ?? null,
      }).run();
    }
    JOURNEYS.forEach(insertJourney);

    TEMPLATES.forEach((tpl, n) => {
      const draft = buildTemplate(tpl);
      db.insert(s.pathways).values({ id: tpl.id, title: tpl.title, tags: tpl.tags, liveVersion: null, draftVersion: 1 }).run();
      savePathwayDraft(tpl.id, draft);
      const version = publishPathway(tpl.id);
      const r = rng(1000 + n);
      const checks = checksDays(r);
      for (let starter = 0; starter < 20; starter++) {
        for (const j of new Set(draft.items.map((i) => i.journeyId))) {
          // Payroll waits on the starter's bank details, which often come late: its Usual Range spans Persona A's 18 days.
          const days = j === 'j-checks' ? checks[starter]! : j === 'j-payroll' ? r(10, 30) : r(2, 14);
          db.insert(s.durationHistory).values({ pathwayId: tpl.id, pathwayVersion: version, journeyId: j, journeyVersion: 1, days }).run();
        }
      }
    });

    // Persona A's Pathway was applied when she accepted her Offer; B and C are applied at T.
    applyPathway('pw-branch', 'person-a', addDays(DEMO_T, -21));
    applyPathway('pw-engineer', 'person-b', DEMO_T);
    applyPathway('pw-executive', 'person-c', DEMO_T);
    PERSON_A_ADDITIONS.items.forEach((i, n) =>
      addAdditionToApplied('person-a', i, n === 0 ? PERSON_A_ADDITIONS.timers : []));

    // Persona A: Contracting done, Pre-employment checks waiting 18 days on its Hidden automation.
    const done = addDays(DEMO_T, -18);
    const doneBy = { doneByPersonId: 'person-a' };
    recordActionProgress('person-a', { itemId: 'i-contracting', actionId: 'j-contracting-a1', state: 'done', doneAt: addDays(DEMO_T, -20), ...doneBy });
    recordActionProgress('person-a', { itemId: 'i-contracting', actionId: 'j-contracting-a2', state: 'done', doneAt: done, ...doneBy });
    recordActionProgress('person-a', { itemId: 'i-checks', actionId: 'j-checks-a1', state: 'done', doneAt: done, ...doneBy });
    recordActionProgress('person-a', { itemId: 'i-checks', actionId: 'j-checks-a2', state: 'pending' });
    // Branch device and Manager ready are done; the optional Uniform was skipped.
    recordActionProgress('person-a', { itemId: 'i-device', actionId: 'j-device-branch-a1', state: 'done', doneAt: addDays(DEMO_T, -16), value: 'Branch tablet', ...doneBy });
    recordActionProgress('person-a', { itemId: 'i-device', actionId: 'j-device-branch-a2', state: 'done', doneAt: addDays(DEMO_T, -12), automationResult: 'passed' });
    recordActionProgress('person-a', { itemId: 'i-manager-ready', actionId: 'j-manager-ready-a1', state: 'done', doneAt: addDays(DEMO_T, -14), doneByPersonId: 'lm-priya' });
    recordActionProgress('person-a', { itemId: 'i-manager-ready', actionId: 'j-manager-ready-a2', state: 'done', doneAt: addDays(DEMO_T, -13), automationResult: 'passed' });
    recordOverride('person-a', { itemId: 'i-uniform', status: 'skipped', reason: 'Uniform not needed yet', byPersonId: 'person-a', at: addDays(DEMO_T, -17) });
  })();
  log.info('seeded');
}

if (process.argv[1]?.endsWith('db/seed.ts')) seed();
