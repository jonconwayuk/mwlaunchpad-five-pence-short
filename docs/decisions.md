# Compliance record and decision log

This file tracks acceptance against the spec (`Design.MD`) and carries the decision log, as the phase workflow requires (`docs/workflow/phase-workflow.md`).

Open items waiting on the owner carry the pending marker. The grep command in the `CLAUDE.md` orientation table gives the authoritative list (this paragraph deliberately doesn't spell the token, so it never counts as an item). **Open count: 1.** This is the only place the count is kept. When an item resolves, rewrite its marker to the resolved form, "was" followed by the token.

## Acceptance against the spec

One row per `BUILD-PLAN.md` task (waves A to E), updated as each phase lands. The items are built to the spec in `Design.MD`. Status is one of: Not started, In progress, Accepted (with evidence path), or Deviation (with decision number).

| Build plan item | Status | Evidence or decision |
| --- | --- | --- |
| A1 Scaffold, tokens, engine contract, fixtures | Accepted | `docs/evidence/launchpad-build/A1/`, decisions 14 and 15 |
| B1 Pathway engine and Vitest tests | Accepted | `docs/evidence/launchpad-build/B1/`, decision 16 |
| B2 Database, seed data and mocked adapters | Accepted | `docs/evidence/launchpad-build/B2/`, decisions 17 and 19 |
| B3 Starter Preview | Accepted (390px by headless Chrome, not on a device) | `docs/evidence/launchpad-build/B3/`, decision 18 |
| B4 Pathway builder canvas | Accepted | `docs/evidence/launchpad-build/B4/`, decision 21 |
| C1 Real state API with role filtering | Accepted | `docs/evidence/launchpad-build/C1/`, decision 22 |
| C2 People, apply a Pathway, Demo controls | Accepted | `docs/evidence/launchpad-build/C2/`, decision 22 |
| C3 Manager and Buddy view, Additions, Needs decision | Accepted | `docs/evidence/launchpad-build/C3/` |
| C4 Journey builder and the libraries | Accepted, one gap passed to D2 | `docs/evidence/launchpad-build/C4/`, decision 22 |
| D1 Chains and the Hard Stop end to end | Accepted (390px headless, not on a device) | `docs/evidence/launchpad-build/D1/`, decisions 26, 27, 30 |
| D2 Canvas persistence | Accepted | `docs/evidence/launchpad-build/D2/` |
| E1 Freeze preparation | Accepted (real-phone walk still to do by hand) | `docs/evidence/launchpad-build/E1/`, `integration/walk-2.md`, `final-fix/`, decisions 24, 28 |
| Live updates over server-sent events | Deviation | B1 (polling every 3 s), decision 9 |
| Deploy once | Deviation | B13 (local network only), decision 9 |
| Observability page | Deviation | B3 (stretch only), decision 9 |

## Decision log

Numbered once, in order, never renumbered or deleted. A reversed decision gets a new entry that points back at the old one. Each entry says what was decided, why, and what evidence backs it.

### 1. Design.MD version 1.0 is the spec

- **Decided:** `Design.MD` as agreed on 9 Nov 2026 is the binding spec, version 1.0. Its D-numbered sections are what plans, briefs and decisions cite.
- **Why:** The phase workflow needs one spec with numbered sections that changes only by logged amendment.
- **Evidence:** Merge commit e6affb7 (Journey builder moved into P0) is the last agreed change before adoption.

### 2. Adopt the phase workflow, with everything stored in the repo

- **Decided:** All substantive work follows the phase workflow. A copy of the skill is kept at `docs/workflow/phase-workflow.md`. Every artefact the workflow produces (plans, evidence, the delegation ledger, decisions, feedback sheets and history, generated content, the presentation) lives in this repo, not in scratch folders or anywhere outside it.
- **Why:** Owner's instruction, 9 Nov 2026. Keeping everything in the repo means the whole team and every agent session see the same record.
- **Evidence:** This entry; `CLAUDE.md` "How we work: the phase workflow".

### 3. Enforcement hooks are not yet wired - `OWNER-PENDING`

- **Decided (provisionally):** Until the hooks exist, the push guard and delegation ledger are followed by hand. No `git push` or `gh pr merge` without a recorded owner say, and every subagent spawn is appended manually to `docs/evidence/delegation-ledger.log`.
- **Why:** The workflow expects hooks from `~/Github/skills/phase-workflow/hooks/`, but that folder is not on this machine; only the skill's instructions are available.
- **Question for the owner:** How should the hooks be provided?
  - (a) Copy the published hooks into `tools/phase-workflow/hooks/` in this repo and wire them in `.claude/settings.json`. **Recommended.** This keeps them in the repo, like everything else.
  - (b) Install them at `~/Github/skills/phase-workflow/hooks/` on each team member's machine.
  - (c) Run the hackathon without hooks and rely on the manual rule above.
- **Note:** `.gitignore` currently ignores all of `.claude/`. Option (a) needs `.claude/settings.json` un-ignored so the wiring is committed.

### 4. Work is planned and run sequentially

- **Decided:** Plans list tasks in one ordered sequence and run them one at a time (implement, review, gate, then the next). There are no parallel waves or parallel worktrees. This is a deliberate deviation from the workflow's "Run what can run" and its wave schedule. Every other workflow rule stands, including a fresh implementer and an independent reviewer per task.
- **Why:** Owner's instruction, 9 Nov 2026. Running one task at a time means each one is checked against the goal in `CLAUDE.md` and goes through the phase-workflow, engineering and ponytail skills before the next starts.
- **Evidence:** This entry; `CLAUDE.md` "How we work: the phase workflow".

### 5. Always use the engineering and ponytail skills - was `OWNER-PENDING`

- **Decided:** Every task uses the owner's installed engineering and ponytail skills alongside phase-workflow (`CLAUDE.md` "Always use the installed skills").
- **Why:** Owner's instruction, 9 Nov 2026.
- **Open:** These skills were not visible in the session that wrote this entry, so their exact names are not yet recorded in `CLAUDE.md`. **Question for the owner:** What are the exact skill names (as shown in the skills list, for example `plugin:skill`)?
  - (a) The owner lists them, and they are added to the `CLAUDE.md` skills table. **Recommended.**
  - (b) Leave the table generic, and each session discovers them from the installed list.
- **Resolved (9 Nov 2026):** Option (a). The owner approved recording the names as they appear in the installed skills list: `engineering-skills:*`, `ponytail:*`, `mattpocock-skills:*` and `taste-skill:design-taste-frontend`. They are now in the `CLAUDE.md` skills table.

### 6. Push `adopt-phase-workflow` and open a PR

- **Decided:** Push the `adopt-phase-workflow` branch and open a pull request against `main`. Merging it needs a separate owner say.
- **Why:** Owner's instruction, 9 Nov 2026. The push rule (decision 3) is followed by hand until the hooks are wired.
- **Evidence:** This entry; the pull request for the branch.

### 7. Push `main` with commit 1dd1081

- **Decided:** Push local `main`, which is one commit ahead of `origin/main` (1dd1081, the owner's CLAUDE.md update).
- **Why:** Owner's instruction, 9 Nov 2026. The push rule (decision 3) is followed by hand until the hooks are wired.
- **Evidence:** This entry; `origin/main` at 1dd1081.

### 8. Design.MD version 1.1 records the team's third pass

- **Decided:** The team's third pass on the spec (commit ba12e57, merged into this branch in a67c4c7) is recorded as amendment 1.1 in the `Design.MD` amendment log. `CLAUDE.md` and the acceptance table above now follow it: build order from `BUILD-PLAN.md`, Container instead of Milestone, no Conditions (ADR-0004 replaced), Additions, and `SEED-DATA.md` as the seed data.
- **Why:** The third pass landed on `main` without an amendment entry, and the onboarding written against version 1.0 contradicted the new glossary. Bringing the branch up to date was the owner's instruction, 10 Nov 2026.
- **Evidence:** Merge commit a67c4c7; `grep -n "Milestone\|Condition" CLAUDE.md` returns only the line telling agents not to use them.
- **Note:** `BUILD-PLAN.md` is still a draft and its open proposals are not agreed. When the team agrees them, update the acceptance table in the same change.

### 9. BUILD-PLAN.md is agreed and executable

- **Decided:** `BUILD-PLAN.md` as of commit 1c782c8 is agreed and executable, and its decisions B1 to B17 stand. It is the plan for the current phase (`docs/plans/2026-11-10-launchpad-build.md`).
- **Why:** Owner's instruction, given in the build prompt on 10 Nov 2026.
- **Evidence:** This entry; `BUILD-PLAN.md` "Status".

### 10. Tasks inside a wave run in parallel (supersedes decision 4 for this phase)

- **Decided:** For the Launchpad build phase, the tasks inside a wave run in parallel, one fresh implementer each. Exclusive file ownership (`BUILD-PLAN.md` section 6) is what makes this safe. Waves still run in order. Decision 4 still applies to later phases unless the owner says otherwise.
- **Why:** Owner's instruction, 10 Nov 2026. The critical path only fits before the freeze if the tasks in a wave run at once.
- **Evidence:** This entry; `BUILD-PLAN.md` sections 1 and 6.

### 11. Work on main, with a push authorised at each green wave gate

- **Decided:** Work happens on `main` (B14). The owner pre-authorises `git push origin main` at the end of every wave whose gate is green. Each push cites this entry. No other push or merge is authorised.
- **Why:** Owner's instruction, 10 Nov 2026. This satisfies the manual push rule in decision 3 for this phase.
- **Evidence:** This entry; the push log in each wave's evidence.

### 12. The gate is npm run check, plus npm run build at each wave gate

- **Decided:** The task gate is `npm run check` (`tsc --noEmit && eslint . && vitest run`). Each wave gate also runs `npm run build`. This replaces the `npm test` and `npm run lint` wording in `CLAUDE.md`.
- **Why:** Owner's instruction, 10 Nov 2026. It matches `BUILD-PLAN.md` section 2.
- **Evidence:** This entry; `docs/plans/2026-11-10-launchpad-build.md`.

### 13. Two listed skills are not installed

- **Decided:** We carry on without `anthropic-skills:phase-workflow` and `frontend-design`, neither of which is in this session's installed skills list. The workflow is followed from its repo copy, `docs/workflow/phase-workflow.md`. Frontend tasks use `taste-skill:design-taste-frontend` and `engineering-skills:senior-frontend` instead. All the other listed sets are installed: `engineering-skills:*`, `ponytail:*`, `mattpocock-skills:*`, `taste-skill:design-taste-frontend` and the built-in `security-review`.
- **Why:** The owner told us to record a missing skill and carry on, not stop.
- **Evidence:** The installed skills list in the build session, 10 Nov 2026 09:02.

### 14. The three engine signatures live in their implementation files, not in types.ts

- **Decided:** `src/engine/types.ts` is section 4.2 verbatim, apart from the three bodiless `export function` declarations at the end. Those fail `tsc` because an overload has no implementation, so they live in `computeState.ts`, `availability.ts` and `loops.ts`, as the comment in section 4.2 already says.
- **Why:** The brief's verbatim text does not compile. Taking this fallback keeps the contract and the gate green.
- **Evidence:** `docs/evidence/launchpad-build/A1/`.

### 15. The A1 review runs alongside wave B

- **Decided:** A1's gate (`npm run check` and `npm run build`) was green at 09:05, so wave A was committed and pushed then. Its independent reviewer runs at the same time as the wave B implementers. Any finding becomes a scoped fix in wave B's gate.
- **Why:** The 127-minute critical path, started at 09:03, already ends after the 10:58 stop. Holding wave B back for a review of transcribed scaffold code would cost about ten minutes on that path.
- **Evidence:** This entry; the delegation ledger.

### 16. Engine fallbacks taken in B1

- **Decided:** The B1 implementer resolved these ambiguities in the engine's rules (`BUILD-PLAN.md` section 4.2) with the fallbacks below.
  - A Notification Action is sent as soon as it is reached and never holds a Journey up.
  - An Action without an owner belongs to the starter. A Hidden automation gives `in-progress` with the Blocked Flag.
  - A `returned` automation sends the item back to the starter's last Action before it, as `action-required`.
  - Skipped counts as met for an item Dependency and an item-done Anchor (D7.2). A Container counts only `done` items, and a Failed Outcome counts as done.
  - A confirmed Hard Stop cancels only targets that are not already done. Overrides apply first, and the latest one wins.
  - Confirm or Dismiss settles a Hard Stop for good. Each Extend adds its days (default 7) to the deadline Timer.
  - An item with no Dependencies is available from Offer accepted, because the apply date is not an engine input. This is marked `shortcut:` in the code.
  - The Usual Range is the interpolated interquartile range, rounded. A wait past the top of the range is overdue.
  - Day 0 is the day before the Start date. The person is a joiner before Day 1, a starter from Day 1 to Day 29, and onboarded from Day 30.
  - Contracting is done when every Pre-contract item is done.
  - A Reminder is skipped if the item it is about is done, skipped or cancelled by the time it fires.
  - `nextUp` is the first `action-required` item in Pathway order.
  - The D7.5 Day 30 Line Manager Tasks are not built, because they are outside rules 1 to 9.
- **Why:** Each brief names the fallback to take when something is ambiguous. This entry records the fallbacks taken.
- **Evidence:** `docs/evidence/launchpad-build/B1/`. The literal Done-when grep `react|next|drizzle` matches the contract field `nextUp`, so the import-level grep in `grep.txt` is the one that counts.

### 17. Seed and data fallbacks taken in B2

- **Decided:**
  - Every Pathway's history uses Pathway version 1. The v3/v4 split is not seeded.
  - Day N is a Start-date Timer with an offset of N-1.
  - The On-failed Hard Stop stops the whole Pathway. The On-deadline Hard Stop stops Meet your buddy, and also the executive welcome on the Executive Pathway.
  - `applyPathway` replaces the person's existing Applied Pathway and clears its progress.
  - Persona A's Additions are made by `hr-partner`.
  - The seed does not reproduce the fixture's Skipped and Cancelled demo items.
  - Drafts are stored one row per element.
  - Mocked adapter results are held in memory and reset on restart.
  - The fixed ids are `person-a`, `person-b` and `person-c`, the Pathways are `pw-branch`, `pw-engineer` and `pw-executive`, and items are named `i-*`.
  - `recordActionProgress` and `recordOverride` take `personId` first.
- **Why:** These are the fallbacks the B2 brief allowed.
- **Evidence:** `docs/evidence/launchpad-build/B2/`.

### 18. Starter Preview fallbacks taken in B3

- **Decided:**
  - "Not for me" posts `{ itemId, actionId: 'skip', actorPersonId }` to `POST /api/actions`, and C1 records it as Skipped.
  - The waiting card shows for an `in-progress` item that has a Usual Range or a Blocked Flag. After C1, the server strips the Blocked Flag for starters.
  - The Provide receipt is held only on the page (marked `shortcut:` in the code). The submitted content is never kept.
  - The status words for the four states section 5.3 leaves open are "Not yet", "In progress", "Over to you" and "Done".
- **Why:** These are the fallbacks the B3 brief allowed.
- **Evidence:** `docs/evidence/launchpad-build/B3/`.

### 19. Persona B starts with a Needs decision already raised - was `OWNER-PENDING` (resolved in 36)

- **Finding (spec against seed data, not reconciled):** Persona B starts at T+5 (`SEED-DATA.md` section 2). The On-deadline Timer `t-deadline` fires at Start date minus 5, which is T itself. So straight after Reset demo the engine raises the `hs-deadline` Needs decision on Persona B, stopping Meet your buddy, and B's Payroll Reminder has already fired. This follows `Design.MD` D2f and B5 correctly. It just isn't a scripted demo moment.
- **Fallback until the owner rules:** Leave the spec and the seed as they are, per `CLAUDE.md`. The demo script avoids opening Persona B's Needs decision.
- **Question for the owner:** (a) Move Persona B's Start date later in `SEED-DATA.md`, for example to T+12. **Recommended.** (b) Keep it and script around it. (c) Change the deadline offset.
- **Evidence:** B2 independent review, 09:14.

### 20. Additive changes to the API and engine contract for wave C

- **Decided:** `BUILD-PLAN.md` sections 4.2 and 4.3 gain these additive fields. Nothing existing is renamed or removed.
  - `EngineInput.appliedOn?: ISODate`. An item with no Dependencies is available from the later of the apply date and Offer accepted. Without it, a Pathway applied live is overdue at once (B1 review).
  - `POST /api/actions` takes an optional `personId`, the starter whose Applied Pathway it is. The default is `actorPersonId`, so the Starter Preview's existing posts work. `actionId: 'skip'` records Skipped (decision 18).
  - `POST /api/simulate` and `POST /api/hard-stops/:id/decision` take `personId`, because Hard Stop and item ids are per Pathway, not per person.
  - `src/lib/apiHandler.ts` exports `apiHandler(fn)` and `ApiError(message, status)`. The `as` filter lives in `src/lib/roleFilter.ts`, which C1 owns, so mutation routes return the same filtered shape.
  - The Demo clock is persisted through `getDemoClock` and `setDemoClock`. For wave C, ownership of `src/lib/clock.ts` passes from A1 to C2.
  - A phone picks its persona by opening `/persona/<A|B|C>`, which sets the `persona` cookie and redirects to `/me`. C2 owns `app/persona/**`. `/team` has its own viewer switcher for Line Managers and Buddies, which C3 owns.
- **Why:** The contract as written cannot tell the starter from the actor, or one person's Hard Stop from another's. Phones on separate devices each need their own persona. These are the smallest additions that close those gaps.
- **Evidence:** B1 and B3 reviews; the wave C briefs.

### 21. Canvas fallbacks taken in B4

- **Decided:**
  - The canvas library is static in wave B. Its Journey tags are inferred from each owner team, because `SEED-DATA.md` section 3 gives none. This is marked `shortcut:`, and wave D2 loads the library from the database.
  - The initial snapshot rebuilds the "after Contracting" Dependencies, adds the On-failed Hard Stop and the Payroll Reminder Timer, and uses the default Pathway tags Branch, Retail and Colleague.
  - A Container's outline follows its items, so the Container cannot be dragged on its own. Timer and Hard Stop positions are held in canvas state only, because `PathwaySnapshot` has no x and y for them.
  - Each library card has an "Add" button, so a Journey can be added from the keyboard.
  - The Delete key is off. A Pathway Item is removed only through "Remove from pathway".
  - `taste-skill` was not loaded by the B4 implementer. It is loaded by the B4 fix loop.
- **Why:** These are the fallbacks the B4 brief allowed.
- **Evidence:** `docs/evidence/launchpad-build/B4/`. The B4 review re-ran the headless Chrome drive at 1280 and 1440 wide, and every Done-when line passed. The library drag is a synthetic DragEvent in that drive, not a real mouse drag.

### 22. Wave C fallbacks, and one gap left after C4's fix loop

- **Decided (C1):**
  - `/api/state` accepts any person id that has an Applied Pathway. `simulatedDate` comes from the persisted Demo clock.
  - A Hidden automation can be completed only through Demo controls (403).
  - `starterOnly` is enforced, and the actor must exist.
  - `actingFor` carries the starter's name.
  - A Provide's content is never stored.
  - Notifications are filtered by their recipient.
- **Decided (C2):**
  - Demo controls are read on the server in the portal layout, and each control calls `router.refresh()`.
  - Simulate accepts only the item's current Hidden automation.
  - The Apply a pathway filters are checkboxes, one for each of the person's tags. A Pathway with no value for a tag passes that filter (ADR-0004: tags browse and filter, never match).
  - Phones pick their persona only through `/persona/<id>`.
- **Decided (C3):**
  - An Addition can be added or removed only by the starter's Line Manager or by HR.
  - `/team?viewer=` switches the viewer, with `lm-chris` as the default.
  - Notes and the Line Manager override share `POST /api/team`. The override has no UI button, as the STOP allowed.
  - An Addition's item id is `add-<journeyId>`, so the same Journey can't be added to one starter twice.
  - `extendDays` is limited to 1 to 60. The Hard Stop decision route records no actor, because the contract has no field for one.
- **Decided (C4):**
  - The Journey library shows a dash for "Applied N times" and for the skip rate. There is no per-Journey count query, and the STOP allowed this.
  - A new Journey's id is the slug of its title. Posting `isNew` refuses a duplicate with 409.
- **Gap, given to D2:** C4's strict schema allows `owner` only on Task and Notification Actions. Seeded Actions carry `owner` on other types too, and the engine reads it on every type (decision 16). So editing 10 of the 18 seeded Journeys is rejected with 400. This was found by the orchestrator, who posted every seeded Journey back through the route. C4's single fix loop is used, so D2 takes ownership of `app/api/journeys/route.ts` for this one fix: an optional `owner` on every Action type.
- **Evidence:** `docs/evidence/launchpad-build/C1/` to `C4/`.

### 23. Waves D and E run in parallel with the end of wave C, with a compatibility review at the end

- **Decided:** This partly supersedes decision 10's "waves still run in order". From 09:28, wave D (D1, D2) and the first half of E1 (README, `npm audit`, the grep sweeps) start while the C3 review is still running. Exclusive file ownership still applies. Every task still gets a fresh implementer, an independent reviewer and at most one fix loop. After all the waves, one compatibility review runs across the whole build, its bugs are fixed, and then the final E1 half runs (security review and the full demo walkthrough). A push still needs a green `npm run check` and `npm run build` (decisions 11 and 12).
- **Why:** Owner's instruction, 10 Nov 2026 09:27: "pivot to building waves in parallel and review for compatibility at the end of all waves and fix any bugs, but do not compromise what you are already doing."
- **Evidence:** This entry; the delegation ledger.

### 24. One npm audit exception: the postcss bundled inside Next

- **Decided:** We accept the single high-severity `npm audit` finding until after the hackathon. It is `postcss` <= 8.5.22, bundled inside `next` (`node_modules/next/node_modules/postcss`). There are no critical findings. The only moderate findings are in the dev-only `@typescript-eslint` chain.
- **Why:** That postcss runs only at build time, over our own CSS, so the demo never feeds it untrusted input. The only fix is `next@16.4.6`, a major upgrade the stack constraint (Next.js 15) rules out an hour before the freeze.
- **Evidence:** `docs/evidence/launchpad-build/E1/audit-prod.txt` and `audit-all.txt`.

### 25. A live team demo instance, and the compatibility review moved earlier

- **Decided:** From 09:37 a demo instance serves the last gated commit on the local network (B13). It runs from a clean worktree at `/tmp/demo`, outside the repo working tree, with its own database. Its command is `next start -H 0.0.0.0 -p 3000`. It is rebuilt only from commits that passed a gate, so agents' in-progress edits never reach it. The end-of-waves compatibility review (decision 23) now starts against waves A to C at once, on a second private instance. Its findings go into the wave D and E fix loops, and it writes the team's demo script at `docs/demo/script.md`. The final compatibility pass after wave D still runs.
- **Why:** Owner's instruction, 10 Nov 2026 09:36: improve the process so the team can run a first demo as soon as possible, without compromising the build plan.
- **Evidence:** This entry; the delegation ledger; `docs/demo/script.md`.

### 26. Two engine fallbacks in decision 16 are reversed to follow Design.MD

- **Decided:** This points back at decision 16, which is not edited.
  - A `returned` Hidden automation now means finished, with no pass or fail (`Design.MD` D3). Before, it sent the item back to the starter. That earlier fallback left the "Send welcome pack" and "Badge request" automations unfinishable, so chains 1 and 2 could never fire.
  - A Failed Outcome no longer meets a Dependency or completes a Container (`Design.MD` D2f.4). It still counts as done for Journey Duration.
  - A Failed item keeps its "while you wait" message, so the Starter Preview does not change while the Needs decision is pending.
  - `/me` shows only "Your recruiter will be in touch." once a Hard Stop is confirmed. This is marked `shortcut:` in `src/ui/components/starter/format.ts`: after a Dismiss, the Failed item still shows as a wait.
- **Why:** D1 ran the three chains and the Hard Stop end to end, and each of these blocked one of them. The spec decides; the earlier fallbacks were guesses.
- **Evidence:** `docs/evidence/launchpad-build/D1/`, plus tests in `src/engine/__tests__/engine.test.ts` and `src/ui/components/starter/format.test.ts`.

### 27. "Recruiter" in the stopped copy contradicts the glossary - was `OWNER-PENDING` (resolved in 36)

- **Finding (spec against glossary, not reconciled):** `Design.MD` D2f.4 says that after a confirmed Hard Stop the starter sees that "their recruiter will be in touch". `GLOSSARY.md` lists "recruiter" under Avoid as a name for the HR Partner.
- **Fallback until the team rules:** Keep the `Design.MD` wording, "Your recruiter will be in touch."
- **Question for the owner:** (a) Keep "recruiter" and remove it from the Avoid list. **Recommended,** because to a starter the recruiter is the person who will actually call them. (b) Change the copy to "Your HR Partner will be in touch."
- **Evidence:** D1 report, 09:45.

### 28. The build fetches fonts from Google, so a venue network can break it

- **Finding:** At 09:43 `npm run build` failed inside `next/font/google`: the loader got an unexpected response while fetching IBM Plex. A retry a minute later passed. `next/font/google` self-hosts the fonts at runtime, but it downloads them at build time, so a build on venue wifi can fail.
- **Decided:** The final E1 pass switches to `next/font/local`, with the IBM Plex Sans and Serif woff2 files committed under `src/ui/fonts/`. IBM Plex is under the SIL Open Font License, which allows this. Until then the team builds before going on stage, never at the venue.
- **Evidence:** `docs/evidence/launchpad-build/wave-gates/` (the failing gate run, then the passing retry).

### 29. Findings from the first cross-face demo walk

- **Re-applying a Pathway wiped the person's story.** Re-applying "Branch colleague" to Persona A, which section 9 beat 2 does, cleared her seeded progress and Additions. That broke beats 5 and 6. **Decided:** Re-applying keeps the progress, decisions and Additions that still exist in the new snapshot, and re-applying the same Pathway keeps the original `appliedOn`. This reverses the "clears progress" part of decision 17. It is in a scoped integration fix.
- **"Stopped" stays.** Cancelled Journeys show "Stopped" on the Starter Preview, because `BUILD-PLAN.md` section 5.3 sets that word. No change.
- **Up to about 3 seconds for an Addition to appear.** The server answers in 0.03 s, but the phone polls every 3000 ms (B1). That is the plan's own number, so no change. Server-sent events remain the production path.
- **The canvas is 1460px wide on `pw-engineer` at 1280.** Passed to the D2 fix loop.
- **Persona B's Needs decision at reset distracts during beat 4.** This is decision 19, still waiting on the owner. The demo script tells the presenter to leave it untouched.
- **Evidence:** `docs/evidence/launchpad-build/integration/walk-1.md`; `docs/demo/script.md`.

### 30. D1 fix choices to check in the compatibility pass

- **Decided:**
  - `roleFilter` finds a pending failure through its Needs decision reason, using the shared `failedReason()` in `src/engine/hardStops.ts`. `NeedsDecision` has no trigger-item field.
  - The starter and the Delegate no longer receive an automation `currentAction`. The glossary says a Hidden automation is never shown to the starter.
  - `StarterPreview` reads the server's `stopped` flag through a cast, because `useLiveState`'s type does not declare it.
- **Why:** These are the smallest changes that keep the engine contract. Matching on a reason string is fragile: the compatibility pass checks it, and the clean fix is a `triggerItemId` on `NeedsDecision`, an additive change to `src/engine/types.ts`.
- **Evidence:** `docs/evidence/launchpad-build/D1/fix-curl.txt`; 75 Vitest tests.

### 31. Mentor feedback 1 is accepted and runs alongside the original build

- **Decided:**
  - The sixteen items in `docs/feedback/2026-11-10-feedback-1.md` are owner instruction, as workstream 2. The original build carries on, unchanged, as workstream 1. One orchestrator runs both, under one combined file-ownership table, in `docs/plans/2026-11-10-feedback-1.md`.
  - The freeze moves to 13:00. Building stops at 12:30, and everything stops at 12:58.
  - Where the two workstreams disagree, the feedback wins for anything a user sees. The original contracts win for anything under the surface: engine types, API shapes and routes.
  - The restore point is the tag `pre-feedback-1` on 1674464, the last commit on the shared gate. The team's demo instance stays on that tag until the owner says otherwise.
- **Why:** Owner's instruction, 10 Nov 2026 at about 10:15.
- **Evidence:** This entry; the feedback file; the plan.

### 32. The demo centres on Bob Warwick

- **Decided:** Every headline moment is shown through Bob Warwick, a Modern Workplace infrastructure engineer at grade E, on the "Infrastructure engineer E" Pathway. The existing personas stay seeded as supporting data and must keep working. The demo script is rewritten around Bob.
- **Why:** Owner's instruction (feedback items 5 and 7).

### 33. Pushes of main at each green shared gate

- **Decided:** `git push origin main` is pre-authorised at every green shared gate, for both workstreams. The shared gate is `npm run check` and `npm run build` in a clean worktree of HEAD, plus Reset demo and `BUILD-PLAN.md` section 9. A red gate blocks pushes from both workstreams. This extends decision 11. Pushing tags is not authorised, so `pre-feedback-1` stays local.
- **Why:** Owner's instruction, 10 Nov 2026.

### 34. Design.MD is amended to version 1.2

- **Decided:** Version 1.2 records these changes:
  - Onboarding Studio replaces Admin Portal in everything the user sees. The route stays `/portal`.
  - Grades run from A to G.
  - Journeys and connectors are config as code, as files in a repo folder. A new ADR records this.
  - The Agent library is added.
  - A scripted chat with a simulated Teams handover moves out of the D15 omissions, and so do the observability pages.
  - There is still no real LLM, no real Teams and no real system-of-record integration. Those are scripted or mocked, and labelled as simulated.
- **Why:** Owner's instruction, 10 Nov 2026. Feedback items 4, 6, 8 to 12 and 16.

### 35. "Send a Reminder now" names feedback item 14

- **Decided:** The manual prompt in feedback item 14 is "Send a Reminder now". It reuses the glossary term Reminder, so no new term is needed, and it avoids "trigger", which the glossary lists under Avoid.
- **Why:** The owner suggested this name in the feedback brief.

### 36. Resolving decisions 19 and 27 without the owner

- **Decided (19 - was `OWNER-PENDING`):** Persona B's Needs decision at reset stays as it is. The demo now centres on Bob (decision 32), so Persona B is supporting data and never on stage. The seed is unchanged.
- **Decided (27 - was `OWNER-PENDING`):** Keep "Your recruiter will be in touch". The Design.MD 1.2 amendment (decision 34) removes "recruiter" from the glossary's Avoid list for starter-facing copy, which was the recommended option.
- **Why:** The owner asked for every parked item that can be closed without them to be closed. Decision 3 (the hooks) still needs the owner.

### 37. Reading of the truncated end of the feedback brief

- **Decided:** The owner's brief ends mid-sentence at "Rewrite the", after the wave H list. We read it as "Rewrite the demo script (`docs/demo/script.md`) and the README around Bob", and wave H does that.
- **Why:** The brief's fallback rule: when something is ambiguous, take the reading closest to the stated aims (aim 1: "the demo script is rewritten around Bob") and record it.
- **Confirmed 10:23:** The owner sent the missing text. Wave H rewrites the team demo script around the eight Bob steps and updates the README. The README's "What is simulated" section says plainly that the repo connection points at folders in this repo, and that connectors, agents, the chat and the Teams handover are simulated. After each gate, both workstreams are reported side by side. At 12:30 building stops, every commit that is not green is reverted, and the Bob walk runs twice.

### 38. A pending Hard Stop is matched by its trigger item (supersedes the matching part of decision 30)

- **Decided:** `NeedsDecision` gains an optional `triggerItemId`. This is additive, and no existing field changes meaning. `roleFilter` masks a pending failure using that field, and falls back to the reason text only when the field is missing. The audit residue is correct as it stands. When the Pathway changes, a kept Failed Outcome raises `hs-failed` again, because Hard Stop decisions are dropped (`Design.MD` D2f.3), so someone has to confirm again.
- **Why:** Workstream 1 had this left open from decision 30. With the old match, a Journey that failed and was then Dismissed could mask the wrong item.
- **Evidence:** `docs/evidence/launchpad-build/w1-a/`; 96 Vitest tests.

### 39. Stretch 1 and G1 share one review

- **Decided:** Stretch 1, authoring Timers and Hard Stops on the canvas, is committed on its own, so it can be reverted alone. It is merged into G1 (decision 31) and done by the same agent, and G1's independent reviewer reviews both together. One known limit: the Hard Stop picker lists every Journey on the Pathway, not only those whose Hidden automation sets the Outcome. The PUT route still refuses an invalid save.
- **Why:** One reviewer reads the whole canvas change once. The stretch commit stays separate, so it can be reverted.
- **Evidence:** `docs/evidence/launchpad-build/stretch-1/` (25 of 25 drive checks); 102 Vitest tests.

### 40. Wave G starts while F1's review runs

- **Decided:**
  - The wave F shared gate was green at 10:31 on e21e951: 111 tests, a clean build, section 9 by API, and Reset identical to the seed. Main is pushed under decision 33, and wave G starts.
  - F1's independent reviewer runs alongside wave G. Any finding goes into a scoped F1 fix in `src/db/**`, which is frozen for wave G tasks (plan, ownership table).
  - F1's two NEEDS notes are assigned:
    - The optional `connector` and `operation` fields on `ActionDef` go to G2, which owns `src/engine/types.ts` for that one additive change.
    - Grades A to G in the canvas lists go to G1, and in the Journey builder lists to G2.
  - The semver bump values are `patch`, `minor` and `major`, through `publishPathwaySemver`. `publishPathway` still returns the integer.
- **Why:** The same reasoning as decision 15. Seven tracks shouldn't wait about ten minutes for a review whose fixes land in files they don't own.
- **Evidence:** `docs/evidence/feedback-1/wave-F-gate.txt`.

### 41. Compressed schedule for a team look at about 11:00, on a second instance

- **Decided:**
  - Every wave G implementer and the F1 fix hand back by 10:50, with the demo path first and green. Whatever is left becomes a follow-up fix, with the reason recorded.
  - The six wave G reviews run together straight after. Demo-path bugs block; polish is a follow-up.
  - The gated build goes on a **second** demo instance, `http://<laptop-ip>:3001`, from its own worktree (`/tmp/demo2`) and its own database. Port 3000 stays on `pre-feedback-1`, as the owner instructed (decision 31), so the team can compare the two.
  - Fix loops and wave H carry on while the team looks. Every later green gate refreshes port 3001.
- **Why:** Owner's instruction, 10:37: "optimise to complete ASAP, 1 is worst case, ideally we want to check the next demo in the next 20 mins".

### 42. Wave G review results and two parked NEEDS notes

- **Decided:**
  - All seven wave G tasks are reviewed. G2, G3, G5 (after its fix), G6 and G7 pass. G4 failed on its All Stages totals, and that is fixed. G1 passes, with one demo gap, filters that narrow nothing, and its fix is running. The non-blocking findings are fixed together in a6d479a.
  - **Parked, low value before the freeze:**
    - G3's NEEDS: store who sent a Reminder (`byPersonId`), which needs a new column in `src/db`. The route checks the field but does not store it.
    - G4's `shortcut:`: history rows have no starter key, so Insights groups past starters by row order. That is correct for the seed; the fix is an additive `starterKey` on `insightsData()`.
  - Both are listed in the README's known gaps.
- **Why:** Neither one changes anything the demo shows. Each needs a schema change in `src/db` after the wave G gate, which is a risk for no visible gain.
- **Evidence:** the wave G reviewer reports; `docs/evidence/feedback-1/`.

### 43. Team demo instance moved to the final build

- **Decided:** the team's demo instance on port 3000 now serves `main` at fc05924 (the final gate), freshly seeded, replacing the `pre-feedback-1` build. Port 3001 serves the same build.
- **Why:** the owner said "switch to port 3000" at 11:17 on 10 Nov, which is the "until I say" in the feedback brief.
- **Evidence:** `docs/evidence/feedback-1/final-gate.txt`. The `pre-feedback-1` tag is unchanged, so the old build can still be restored.

### 44. Feedback 1 additions 17 to 19 accepted; Design.MD 1.3

- **Decided:**
  - The owner's three additions are accepted as owner instruction. They're recorded verbatim as items 17 to 19 in `docs/feedback/2026-11-10-feedback-1.md`.
  - They run as three concurrent tasks, A17, B18 and C19, on separate files (plan: "Additions 17 to 19"). Then H2 walks the new steps and updates the script.
  - No task was in flight at 11:30, so nothing waits on a commit.
  - Design.MD goes to 1.3: D13 item 8 adds the two Demo controls, and D11 states the help chat's reach and the Teams handover wording. `GLOSSARY.md` needs no change: there are no new terms, "Integrations" is a section heading, and "trigger" stays on the Avoid list. No ADR changes.
- **Why:** owner instruction. The split lets all three run at once without two owners on any file. Item 17 reuses the existing Notification Action and Simulate path, so the engine gets no new mechanism.
- **Evidence:** `docs/evidence/feedback-1/{A17,B18,C19,H2}/`.

### 45. Cheapest capable model per task (owner instruction, about 11:40)

- **Decided:**
  - Every spawn passes `model` explicitly. Implementers, fix loops, context-reading agents, and demo-script or README updates use sonnet.
  - Reviewers use opus only where the task takes untrusted input, changes engine or server rules, or touches the spec. Otherwise they use sonnet.
  - Step up to opus only when a sonnet implementer has failed its one fix loop, or the task needs an engine rule change. The ledger line says so.
  - Prompts carry the brief, the Global Constraints and the owned files only, and tell agents not to re-read files they just wrote or summarise their own diffs.
  - For the named tasks:
    - P1 (grades): sonnet implementer, sonnet reviewer.
    - P2 (Workday): sonnet implementer, opus reviewer (a new route taking input).
    - P3 (search): sonnet implementer, sonnet reviewer.
    - P4 (edit an Applied Pathway): sonnet implementer, opus reviewer (server rules, ADR-0002).
  - This departs from the workflow's "review is always opus" rule, for low-risk tasks only.
- **Why:** owner's instruction, to control cost on low-risk tasks.
- **Applies to:**
  - Every task not yet spawned, in both workstreams.
  - Not to H2, which was already running on opus when this arrived. It isn't restarted, because nothing stops or restarts mid-run.
- **Gap:** the instruction refers to briefs for P1 to P4 that weren't included in the message. They are not started. They will run under this table when their briefs arrive. Building stops at 12:30.
- **Evidence:** the delegation ledger.

### 46. Feedback 1 additions 20 to 24 accepted; Design.MD 1.4

- **Decided:**
  - Items 20 to 23 (P1 to P4) and item 24 (I1) are accepted as owner instruction and recorded in the feedback file. They run as five concurrent tasks, with briefs and ownership in the plan ("Additions 20 to 23").
  - Models follow decision 45:
    - P1, P3 and I1 use a sonnet implementer and a sonnet reviewer.
    - P2 and P4 use a sonnet implementer and an opus reviewer.
- **Fallbacks:**
  - The People pages are split by component. P2 and P4 get mounted placeholders (ddef0a2).
  - P3's component is the existing `ApplyPathway.tsx` picker, so it needs no new file.
  - P2 writes its own `src/db/newStarters.ts`, so it doesn't share `queries.ts` with P4.
  - I1 builds a shareable search, because P3 hasn't committed yet.
- **Spec:**
  - Design.MD goes to 1.4: grade X after G, named supporting Pathways, the Workday add, search when applying, and "Edit this pathway".
  - `GLOSSARY.md` adds grade X.
  - ADR-0002 gets a note: "Edit this pathway" is Additions on the snapshot, template Journeys stay unremovable, and the "Based on" line reads the snapshot's title and version, never the live one. So the ADR's decision is unchanged.
- **Why:** owner instruction.
- **Risk:** building stops at 12:30. Any task not through review and gate by then is parked and not merged. The report will list it.
- **Evidence:** `docs/evidence/feedback-1/{P1,P2,P3,P4,I1}/`.

### 47. P4 (edit an Applied Pathway) is the demo priority

- **Decided:**
  - The owner said at about 12:00 that editing an in-flight Pathway after it's assigned is key to the demo. So P4 gets first call on review and gate time.
  - P4 may run past the 12:30 build stop, to a hard cut-off of 12:50. That leaves time for the gate, the push and a port 3000 refresh before 12:58.
  - The other tasks still stop at 12:30.
  - If P4 isn't green by 12:50, it's parked and not merged.
- **Fallback, already in the build:** the Line Manager's "Add a journey" (Additions, decision 26 era, live on Bob's phone within 3 seconds) already edits Bob's in-flight Pathway. The demo can show that move whatever happens to P4.
- **Why:** owner instruction. Their latest word on priority overrides the 12:30 stop for this one task only.

### 48. Skip (Demo) on the Starter Preview; Design.MD 1.5

- **Decided:**
  - The owner asked for a "Skip (Demo)" button on `/me`. While information-gathering Actions wait on the joiner (Read, Provide, Choose, their own Tasks), it completes them all with synthetic values, so the demo can move on to the WaitingCard, the Hidden automations and the later stages.
  - It reuses `completeInputs` from the Demo controls, so every engine rule still applies. It is hidden when nothing waits and in the Delegate view.
- **Spec:** Design.MD goes to 1.5. D13 item 8 now puts the inputs control on `/me` as a labelled demo shortcut, starter view only.
- **Process:** the `anthropic-skills:phase-workflow` skill was not installed this session, so the repo copy `docs/workflow/phase-workflow.md` was used, with the owner's approval.
- **Why:** owner instruction.
