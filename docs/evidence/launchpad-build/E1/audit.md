# E1 phase-end audit (ponytail-audit)

Scope: `app/` and `src/` at HEAD (`647f63a`, plus the uncommitted README and ledger edits, which are outside scope). Read only. No code changed.

**What this repo does:** One Next.js app with three faces: the Admin Portal (`/portal`: Journey builder, Pathway canvas, applying a Pathway, Demo controls), the Starter Preview (`/me`) and the Manager and Buddy view (`/team`). A pure TypeScript engine (`src/engine`) works out each starter's state from a SQLite snapshot and the Demo clock. The phones poll every 3 s.

**Load assumed:** One `next start` process on the local network. One presenter laptop and two or three phones polling `/api/state` or `/api/team` every 3 s. No auth, by design (BUILD-PLAN B13, B15). The shortcuts already accepted in decisions 16 to 30 are not reported again here (Persona B's Needs decision at reset, the matching on the reason string, the `stopped` cast, the 3 s poll, the postcss exception).

## Must fix (breaks or embarrasses the live demo)

1. **The canvas keeps the rehearsal after Reset demo, then saves it back** (`src/ui/components/canvas/PathwayCanvas.tsx:143`, `src/ui/components/demo-controls/DemoControls.tsx:23`)
   - **What this is:** Demo controls sit in the portal layout. Reset demo reseeds the database, then calls `router.refresh()`.
   - **Problem:** The canvas holds its Pathway in `useReducer(canvasReducer, draft, ...)`. The initial value is read only once, so a refresh passes the new `draft` prop and the canvas ignores it. The presenter still sees the rehearsal edits. The first drag after that autosaves the old snapshot over the freshly seeded draft, one second later.
   - **Fix:** After a successful Reset, do a full reload: `if (url === '/api/reset') location.reload()` in `post()`. That's one line, and it also resets every other client state.
   - **If we skip it:** A rehearsal before the demo leaves its edits in the "clean" Pathway.

2. **"Set date" fails after "Plus 1 week"** (`src/ui/components/demo-controls/DemoControls.tsx:12`)
   - **What this is:** The date picker's value comes from `useState(today)`.
   - **Problem:** The initial state is read once. After Plus 1 day or Plus 1 week, the picker still shows the old date. Clicking Set date without changing it sends a past date, and the presenter sees "The Demo clock only moves forward" on stage. After a Reset, the picker shows a date in the future.
   - **Fix:** Remount when the clock moves. In `app/portal/layout.tsx:26`, render `<DemoControls key={today} ... />`.
   - **If we skip it:** The clock control shows a red error during the demo.

3. **Publish says "Draft saved"** (`src/ui/components/canvas/PathwayCanvas.tsx:164`)
   - **What this is:** Publish saves the draft, then publishes it.
   - **Problem:** When it succeeds, the status line reads "Draft saved", so neither the audience nor HR can see that the Pathway went live. The builder is the USP, and this is its headline action.
   - **Fix:** `setSaved(\`Published version ${version}\`)`.
   - **If we skip it:** The presenter has to tell the audience "trust me, it published".

4. **A Hard Stop decision carries over to a different Pathway** (`src/db/queries.ts:131-133`)
   - **What this is:** Re-applying a Pathway keeps the Hard Stop decisions whose `hardStopId` still exists in the new snapshot.
   - **Problem:** Every seeded template uses the same ids, `hs-failed` and `hs-deadline` (`src/db/seedData.ts:163-165`). Suppose HR confirms the failed-checks Hard Stop for Persona A, then applies a Pathway again to "start her over". The old Confirm still matches, so the new Pathway is cancelled at once, and `/me` shows "Your recruiter will be in touch." straight away. An Extend also carries over to a new deadline.
   - **Fix:** Keep decisions only when the same Pathway is re-applied. Inside the loop, delete when `old?.snapshot.pathwayId !== pathwayId` too, so the rule matches the `appliedOn` one on line 134.
   - **If we skip it:** After the Hard Stop beat, the only way to recover is Reset demo. Tell the presenter.

5. **Some buttons fail silently when the server returns a page that is not JSON** (`src/ui/components/demo-controls/DemoControls.tsx:21`, `app/portal/people/ApplyPathway.tsx:22`, `app/portal/people/NeedsDecisionPanel.tsx:17`)
   - **What this is:** These buttons call `await res.json()` with no guard.
   - **Problem:** If the server is restarting, or Next serves an HTML error page, `res.json()` throws. The rejection is never handled, so the button looks dead and shows no message. The canvas `call()` (`PathwayCanvas.tsx:137`) and the team `send()` (`src/ui/components/team/useTeam.ts:51`) already guard this.
   - **Fix:** Use the same pattern: `.json().catch(() => ({ ok: false, error: 'The server did not answer.' }))`.
   - **If we skip it:** Apply pathway or Simulate does nothing on stage, and nobody can see why.

6. **An unseeded database makes every route fail with a 500** (`src/db/queries.ts:9`)
   - **What this is:** `getDemoClock` reads the clock row with `get()!`.
   - **Problem:** `client.ts` creates the tables but adds no rows. On a new database file, such as a fresh `/tmp/demo` instance, every page and API call throws a TypeError and shows "Something went wrong".
   - **Fix:** Run `npm run seed` before every `next start`, as an operator step in `docs/demo/script.md`. In code, the alternative is to call `seed()` in `open()` when `demo_clock` is empty.
   - **If we skip it:** A rebuilt demo instance looks broken until someone presses Reset demo, and the portal layout itself may fail to render.

## Should fix

7. **Additions can duplicate a Journey already on the Pathway** (`app/api/additions/route.ts:35`)
   - **What this is:** An Addition gets the id `add-<journeyId>`.
   - **Problem:** The id is checked only against other Additions. A Line Manager can add `j-buddy` to a starter whose Pathway already has `i-buddy`, and the phone then shows the same Journey twice.
   - **Fix:** Refuse with a 409 when `snap.items.some((i) => i.journeyId === journeyId)`.
   - **If we skip it:** The "add a Journey live" beat can show a duplicate if the presenter picks the wrong card.

8. **No test covers the API's permission checks** (`app/api/actions/route.ts:36-43`, `app/api/team/load.ts:9`)
   - **What this is:** These check who may complete a Task and who may add or remove an Addition.
   - **Problem:** They are branchy and security-shaped, and no test fails if one breaks. Today only the engine, `roleFilter`, `applyPathway` re-apply and the loop guard are tested.
   - **Fix:** After the freeze, add one Vitest test per route that calls the exported handler with a Buddy acting on a Line Manager Task and expects a 403.
   - **If we skip it:** A later edit can quietly let the wrong persona tick a Task.

9. **Pathway Item coordinates are capped at 5000** (`app/api/pathways/[id]/route.ts:15`)
   - **What this is:** The draft save validates every card's x and y.
   - **Problem:** If a card is dragged far down a tall lane, past y = 5000, the save is refused with a raw Zod message such as `items.3.y: Too big`.
   - **Fix:** Raise the bound to 100000. It only exists to stop absurd values.
   - **If we skip it:** It is unlikely with the seeded Pathways (fewer than 15 cards).

## Nice to have

10. **Two `addDays` helpers** (`src/db/seed.ts:11`, `src/lib/clock.ts:8`; the engine has its own in `src/engine/dates.ts`)
    - **What this is:** The same UTC date step is written in three places.
    - **Problem:** If one copy is fixed, the others are not.
    - **Fix:** Import the engine's `addDays` in `seed.ts` and `clock.ts`. That saves about 10 lines.
    - **If we skip it:** Nothing breaks today.

One smaller finding was left out: `hard-stops/[id]/decision` has no `max` on `personId`.

Verdict: before 11:00, fix 1, 2 and 3 (one line each). Script around 4 and 6 (Reset demo after the Hard Stop beat; seed before start).
Lean: about -10 lines, -0 dependencies possible.
Not checked: canvas `model.ts` and `nodes.tsx` in depth, the journey-builder components, `TeamView.tsx` and `AddJourney.tsx` line by line, `seedData.ts` content against `SEED-DATA.md`, and the CSS. Nothing was run: no tests, build or browser.
