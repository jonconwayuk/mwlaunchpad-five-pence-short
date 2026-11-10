# Integration walk 2: BUILD-PLAN.md section 9, after waves A to D

- Build: clean worktree at c76b8c4 (`.next` built), own SQLite file `/tmp/int2.db`, port 3090. The team's port 3000 and its database were not touched. Server stopped and the file deleted at the end.
- Date: 2026-11-10. Demo clock starts at 10 Nov 2026 after Reset demo.
- Drivers: `shot.mjs` (one page, one capture) and `drive.mjs` (new here: opens a page, runs click steps in the page, captures text and a screenshot after each step as `<prefix>-<n>.png/.txt`). Both are headless Chrome over CDP with no new dependency. Phone captures are **390px headless, not a device**. Laptop is 1280x800.
- "Clicked" means a DOM click or select change in the real page. "API" means a direct call, used where drag-and-drop or edge drawing could not be driven in the time.
- Synthetic data only.

| # | Beat | Result |
| --- | --- | --- |
| 1 | Canvas: add, Dependency, loop refused, mandatory, Publish, reload | **PARTIAL** (works; Dependency, loop and mandatory driven by API; two canvas copy bugs) |
| 2 | Filter library, apply Branch colleague to A, Software engineer to B | PASS (clicked; re-apply keeps the story) |
| 3 | Two phones, two packs | PASS |
| 4 | Line Manager adds access package from /team, on B's phone, "Added by" | PASS (clicked; seen on B's phone 0.98 s after Confirm) |
| 5 | A's honest waiting card, Day 18 against 21 to 35 | PASS |
| 6 | Failed vetting, Needs decision, starter unchanged while pending, Confirm, Dismiss | PASS (one copy finding: "Stopped" not "Cancelled") |
| 7 | Day 14, Pulse check, score 2 raises a Task for the Line Manager only | PASS (one minor strip lag) |
| 8 | Reset demo returns everything to the start | PASS |
| 9 | Gate state | Recorded, not run: gate green at c76b8c4, 81 tests (`../wave-gates/wave-D.txt`) |

## 1. Canvas (PARTIAL)

- `/portal/pathways/pw-engineer` at 1280: `scrollWidth 1280`, so the walk-1 sideways scroll is fixed (`w2-01-canvas-1280.png`, `w2-01-canvas.txt`).
- Clicked the library **Add** on "Start delay engagement", then clicked **Publish**: header goes from "Live version 1" to "Live version 2" (`w2-01-edit-0..2`). The HTML5 drag onto a lane and drawing an edge were not driven; the Add button is the same placement path.
- API: saved a Dependency (Start delay engagement waits for Contracting) and set it mandatory: `ok`. Saving the reverse edge is refused in plain English: "Start delay engagement already waits for Contracting, so Contracting cannot wait for Start delay engagement." (`w2-01-loop-response.txt`). Publish returned version 3. A fresh page load shows "Live version 3" and the new item (`w2-01-reload-1280.png`).
- **FAIL, repeated-Journey subtitle:** the two Pulse check cards read "Day 13" and "Day 29" (`w2-01-canvas.txt` lines 124 to 127). The Timers are 13 and 29 days after Start date, which are Day 14 and Day 30. `src/ui/components/canvas/model.ts:114` prints `Day ${t.offsetDays}`; it should print `offsetDays + 1`.
- **FAIL, edge label clipped:** the "If Failed" label on the Hard Stop edge renders as "If Faile" against the Pre-employment checks card (`w2-01-canvas-1280.png`, around x 640, y 357). Edge built at `src/ui/components/canvas/PathwayCanvas.tsx:80`.

## 2. Filter and apply (PASS)

- Clicked Job family "Branch" on `/portal/pathways`: only "Branch colleague v1" listed (`w2-02-filter-1.txt`).
- Clicked **Apply pathway** on "Branch colleague" at `/portal/people/person-a` and on "Software engineer" at `/portal/people/person-b`. The `/api/state` JSON for A, B and C is byte-identical before and after (decision 29 holds). The page shows "Applied Pathway: Branch colleague v1".
- Minor copy: the apply list repeats tags, "Executive Executive, Group Functions, Executive" (`w2-02-apply-A-0.txt` line 78).

## 3. Two packs (PASS)

- `w2-03-me-A-390px-headless.png`: Branch device, Uniform (Merch distribution). `w2-03-me-B-390px-headless.png`: Developer device, Engineering community intro. Both `scrollWidth 390`.

## 4. Line Manager adds a Journey (PASS)

- `/team?viewer=lm-chris`, clicked **Add a journey**, chose "Payments squad access package", Unlock "After Cleared to start", ticked Mandatory, clicked Confirm (`w2-04-add-0..4`, `w2-04-add.log`).
- A second browser on B's `/me`, checking every 100 ms, saw it at 09:56:44.774, 0.98 s after Confirm at 09:56:43.790 (`w2-04-meB.log`). B's phone shows "Payments squad access package / Not started / Added by Chris Lee" (`w2-04-meB-1.txt`); `/team` shows "Added by Chris Lee" and Remove.
- "Now" unlock tested by API (Start delay engagement for B): `ok`.
- At Reset demo Chris already has a Needs decision for Sam, "Pre-employment checks not done in time" (decision 19, `w2-04-team-chris-before.txt`). Expected, but the presenter must know.
- Minor: the Unlock list shows "After Pulse check" twice with nothing to tell them apart (`w2-04-add-1.txt`). The button still reads "Add a journey" (lower-case j).

## 5. Waiting card (PASS)

- `w2-03-me-A.txt`: "Day 18 of your wait", "Usually 21 to 35 days", nothing needed from Alex.

## 6. Failed vetting (PASS)

- Clicked **Simulate failed** in Demo controls (default "Alex Morgan: Pre-employment checks").
- Needs decision for Priya on `/team?viewer=lm-priya` ("Alex Morgan: Pre-employment checks failed") and on `/portal/people/person-a` (`w2-06-team-priya.txt`, `w2-06-people-A.txt`). The walk-1 doubled copy is gone.
- A's `/me` page text before and after the failure is **identical** (`diff` of `w2-06-me-A-before.txt` and `w2-06-me-A-pending.txt`).
- Typed a reason and clicked **Confirm** on the people page: A's phone shows only "Your recruiter will be in touch." (`w2-06-me-A-confirmed-390px-headless.png`).
- Separately, Reset, fail, then Dismiss without a reason is refused ("Give a reason before you decide."); with a reason, Dismiss proceeds: Pre-employment checks Done, ID creation (photo) Action required "Provide your photo" (`w2-06-me-A-dismissed.txt`).
- **Copy finding:** after Confirm the HR people page shows the stopped Journeys as "Stopped" (`w2-06-people-confirm-1.txt` line 33 on). GLOSSARY's Journey Status is "Cancelled". Word map at `app/portal/people/[id]/page.tsx:13` (and the starter one at `src/ui/components/starter/JourneyRow.tsx:19`).
- Two Hard Stops on B (decision 30 check): with hs-deadline pending at reset, completed B's starter Actions and simulated Failed on B's checks. The Failed Outcome makes the Journey Done, so the deadline Hard Stop clears and only "Pre-employment checks failed" is pending. B's `/me` still shows the waiting card, ID creation Not started (`w2-06b-me-B-failed-pending.txt`): masking is correct. Note: `src/lib/roleFilter.ts:40` matches by `reason === failedReason(title)`, not by Hard Stop id. It works today; matching on `hardStopId` with trigger kind on-failed would not depend on copy.

## 7. Day 14 Pulse check (PASS)

- Clicked Sam Okafor and **Day 14** in Demo controls: B is Day 14 on 28 Nov 2026, Pulse check Action required. Answered 2 and 2 (API, as the starter).
- Chris's `/team` lists "Sam scored 2 for ... Have a chat." twice (`w2-07-team-chris.txt`). B's `/me` has no such Task (`w2-07-me-B.txt`).
- Simulated date "28 Nov 2026" on `/me`, `/team`, `/portal` and `/portal/people/person-b` after load.
- Minor: on the portal page where Day 14 was clicked, the strip still read 10 Nov 2.5 s later (`w2-07-portal-day14-2.txt`); Plus 1 day updated within 2.5 s (`w2-07-strip-1.txt`). Seen once; not a stage risk if the presenter waits a moment.

## 8. Reset demo (PASS)

- After clock moves, Additions, a failure, a published Pathway version and `POST /api/reset`, the `/api/state` JSON for A, B and C is byte-identical to the fresh seed. The pw-engineer draft returns to version 2 without the canvas edits.

## Cross-face checks

- No "undefined", "NaN", raw error text or ids (`i-`, `j-`, `person-`, `lm-`, `hs-`) in any of the 47 captured page texts. Every phone capture is `scrollWidth 390`, every laptop capture `scrollWidth 1280`.
- Avoid-word sweep found only allowed compounds (Admin Portal, Line Manager, the "Manager ready" Journey) and "Have a chat" in a Task, which is ordinary copy, not the Avoid-listed feature.
