SCRIPT+README FINAL (11:17): `docs/demo/script.md`, `README.md`, plus the step 1 fixture `docs/demo/j-h-demo.json` that the script copies into `journeys/`.

# Wave H fixes

One fix per entry, each with a Vitest test seen red before the fix and red again with the fix reverted (an off-by-one mutation).

## Fix 1: People shows the Applied Pathway's semantic version, not the integer

- **Found in:** Bob walk step 3. After step 2 publishes "New content", the Pathway header says "Live version 1.1.0" but Bob's People page said "Infrastructure engineer E v2" (feedback item 3: versioning is semantic).
- **Files:** `src/db/queries.ts` (new `getPathwayVersionSemver(id, version)`, additive), `src/db/queries.test.ts`, `app/portal/people/[id]/page.tsx`.
- **Test:** `src/db/queries.test.ts` > getPathwayVersionSemver > "names the pinned version semantically, when HR applies a Pathway after a New content publish, so People shows 1.1.0 not v2". Red before: `getPathwayVersionSemver is not a function`. Revert-red: `expected '1.0.0' to be '1.1.0'`.
- **Checked in the browser:** `fix1 People: Applied Pathway: Infrastructure engineer E version 1.1.0` (screenshot `fix1-people-semver.png`).
- **Suggested commit message:** Show the Applied Pathway's semantic version on People

## Fix 2: The manager's Add a journey button says "Add journey", not "Confirm"

- **Found in:** section 9 item 4 during the walk. Chris Lee's view shows Sam's seeded Needs decision **Confirm** above the Add a journey form's **Confirm**. Clicking the first one confirms a Hard Stop instead of adding the Journey. The old script had to say "the Confirm at the bottom of that form".
- **Files:** `src/ui/components/team/AddJourney.tsx` (button copy only), `src/ui/components/team/addJourney.test.tsx` (new).
- **Test:** `src/ui/components/team/addJourney.test.tsx` > AddJourney > 'names its button "Add journey", when a Needs decision Confirm is on the same screen, so a presenter cannot press the wrong one'. It was red before the fix (no "Add journey" button), and red again with the fix stashed.
- **Checked in the browser:** on `/team?viewer=lm-chris` the buttons read `Confirm | Add journey`, with Confirm the Needs decision's and Add journey the form's.
- **Suggested commit message:** Name the manager's Add a journey button Add journey
- **Note:** `docs/evidence/feedback-1/G7/drive.mjs` clicks 'Confirm'. That's old evidence and isn't re-run, so it was left alone.
