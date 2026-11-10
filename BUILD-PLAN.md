# BUILD-PLAN.md: MW Launchpad

How we phase the build of the design in `Design.MD`. Terms are defined in `GLOSSARY.md`. Scope omissions are in Design.MD D15.

## Status

**Draft, to be reviewed by the team.** The phasing below was moved unchanged from Design.MD. The open proposals at the end have not been agreed yet.

## Time box

Build freeze is 13:00 on Day 2 (10 Nov). Suggested split tonight: one person builds the Pathway engine and tests, another builds the canvas against seed data; they meet at the engine's interface.

## P0, Day 1 evening (no demo without these)

1. Pathway engine and Vitest tests: Dependencies, Containers, Timers, Additions, Journey Status and Outcomes, against the Demo clock.
2. Seed data: three personas with Line Managers and Buddies, the library Journeys, and three Pathway templates ("Branch colleague", "Software engineer", "Executive"). Full table still to be agreed (Design.MD D12).
3. Pathway builder canvas: library panel, drag on, connect Dependencies with loops refused, side panel for Mandatory, Container grouping, Stage lanes, Pathway tags, Publish.
4. Journey builder UI (Design.MD D3 rule 5): a simple laptop form in the Admin Portal to create or edit a Journey (header, Stage, tags, Outcome, "while you wait" message) with a drag-to-reorder Action list, then publish it to the library. The seeded Journeys still ship as data, so the demo never depends on building one live.
5. Pathway library with tag filters; apply a Pathway to a Person; Starter Preview on a phone with Stage groups, statuses and the waiting card.
6. Demo controls: clock, Simulate result, Reset.
7. Deploy once, to find phone problems early.

## P1, Day 2 morning, before the 10:15 checkpoint

- Manager and Buddy view: To-do list, ticking Tasks, "Needs decision".
- Hard Stop end to end; Timer and Hard Stop blocks on the canvas.
- Live updates over server-sent events.
- Chains 1 and 2; Pulse check with a Line Manager Task on a low score (chain 3).

## P2, 10:15–12:30, only if ahead

- Observability page: Stage counts and durations, Journey Durations, Usual Range, skip rate, Pulse by version, Additions.
- Delegate (Persona C).
- Scripted assistant.
- "Add a Journey" (Additions) by HR and Line Manager.

## Open proposals (not agreed)

0. **The headline demo move (Design.MD D2) ends with a Line Manager adding a Journey live, but "Add a Journey" is in P2.** Move a minimal version (Line Manager adds a Journey with "Unlock: Now") into P1, or the headline move can't be shown.

1. **P0 is likely too big for one evening.** Use 3-second polling for live updates in P0 (already the agreed fallback) and move server-sent events to P2. In P0 the canvas should at least *display* seeded Timer and Hard Stop blocks read-only, even if editing them is P1.
2. **Observability is part of the USP (D1) but sits in P2, and Persona A "leads" with a Hard Stop, which is P1.** Either move a minimal observability panel (Journey Durations and Usual Range) into P1, or drop observability from the D1 headline.
3. **Simplify P2 details:**
   - Delegate Reminders always go to both the starter and the Delegate, with no setting (D12a rule 6).
   - The Line Manager's library filter uses Journey tags only, because Journeys are not tagged with an org unit ("area" in D4a).
   - Hard Stop Extend defaults to +7 days.
   - HR's To-do list (Tasks owned by HR) is shown in the Admin Portal.
