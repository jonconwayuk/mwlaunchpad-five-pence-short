# Integration walk 1: BUILD-PLAN.md section 9, three faces together

- Build: commit 4c88233 (clean gated build in a private worktree), own SQLite file, port 3090. Wave D working-tree changes are NOT in this build.
- Date: 2026-11-10, Demo clock starts at 10 Nov 2026 after Reset demo.
- Driver: `shot.mjs` in this folder (headless Chrome over CDP, no new dependency) plus curl against the API. Each phone screenshot is **390px headless, not a device**. Laptop = 1280 wide.
- Synthetic data only. `NN.txt` files hold the page text captured with each screenshot.

| # | Beat | Result |
| --- | --- | --- |
| 1 | Pathway builder: drag, Dependency, loop refused, mandatory, publish | PENDING-D2 (plus one small layout finding) |
| 2 | Filter library, apply Branch colleague to A, Software engineer to B | **FAIL** (applying wipes the seeded state, which breaks beats 5 and 6) |
| 3 | Two phones, two different packs | PASS |
| 4 | Line Manager adds access package, on B's phone within 3 s, "Added by" | PARTIAL |
| 5 | A's honest waiting card: Day 18 against 21 to 35 | PASS from Reset demo; FAIL if beat 2 ran first |
| 6 | Failed vetting, Needs decision, starter view unchanged until confirmed, Cancelled | **FAIL** |
| 7 | Day 14, Pulse check, score 2 raises a Task on the Line Manager's phone | PASS |
| 8 | Reset demo returns everything to the start | PASS |

## 1. Pathway builder (PENDING-D2)

- `/portal/pathways` lists the three Pathways (`04-portal-pathways-1280.png`). The canvas at `/portal/pathways/pw-engineer` renders (`05-canvas-engineer-1280.png`). Saving and publishing are wave D2 work, so this build does not test them.
- Finding: at 1280 wide the canvas page has `scrollWidth 1460`, so the whole page scrolls sideways on the laptop (`05-canvas.txt`). The canvas should scroll inside itself, not move the page.

## 2. Apply Pathways (FAIL)

- `POST /api/apply {"pathwayId":"pw-branch","personId":"person-a"}` returns `{"ok":true,...}`. The same call for B also succeeds.
- After Reset demo, A and B already have these Pathways (SEED-DATA.md section 5). Applying again rebuilds A from nothing:
  - Before: Contracting done, Payroll Action required, Pre-employment checks In progress (Day 18), Branch device done, Manager ready done, Uniform Skipped, plus the HR Additions Start delay engagement and In-person events calendar.
  - After: every Journey is back to Not started or Action required, and both HR Additions have gone.
- A's phone then shows "Your offer / Read your offer" in place of the Day 18 waiting card (`06-me-A-after-reapply-390px-headless.png`). The people page shows "Applied Pathway: Branch colleague v1" (`07-people-A-1280.png`).
- This is the scripted order in section 9, so beat 2 breaks beats 5 and 6 on stage. Either the seed should leave A and B unapplied, or applying the same Pathway again should keep progress, or the script needs a different order. The orchestrator should decide which.

## 3. Two packs (PASS)

- `01-me-A-390px-headless.png` shows Alex: Branch device, Uniform, Start delay engagement. `02-me-B-390px-headless.png` shows Sam: Developer device, Engineering community intro. Each phone used its own browser profile and persona cookie. Both have `scrollWidth 390`.

## 4. Line Manager adds a Journey (PARTIAL)

- Payments squad access package was added through `POST /api/additions` (After a Container "Cleared to start", mandatory, by lm-chris). It showed up in `/api/state?personId=person-b` 0.03 s later.
- Both phones poll every 3000 ms (`src/lib/useLiveState.ts:34`). Worst case is therefore 3 s plus the request and render time, which is right at the limit and can go over it. Server-sent events (P1) or a 2 s poll would fix this. I timed the server, not the browser.
- B's phone shows "Payments squad access package / Not started" (`08-me-B-after-addition-390px-headless.png`) but no "Added by" yet. That label is being added by D1. The `/team` card already shows "Added by" (`TeamView.tsx:119`).

## 5. Waiting card (PASS from Reset demo)

- `01-me-A-390px-headless.png`: "Day 18 of your wait", "Usually 21 to 35 days", plus the while-you-wait text "nothing you need to do right now".

## 6. Failed vetting (FAIL)

- `POST /api/simulate` (person-a, i-checks, j-checks-a2, failed) returns ok.
- Needs decision appears for Priya on `/team?viewer=lm-priya` (`10-team-priya-needs-decision-390px-headless.png`) and on `/portal/people/person-a` (`11-people-A-needs-decision-1280.png`). PASS for that part.
- **The starter's view changes before anyone confirms.** A's phone loses the Day 18 waiting card. Pre-employment checks goes from In progress to **Done**, and the hero becomes "Getting ready / Next: Provide your bank details" (`09-me-A-after-failed-390px-headless.png`). The failed Outcome makes the Journey Done straight away; the spec says a Failed Outcome is Done, but the starter-facing view must not change until confirmation (Design.MD D2).
- After confirming (`POST /api/hard-stops/hs-failed/decision`, confirm): stopped items show **"Stopped"**, not GLOSSARY's **"Cancelled"** (`12-me-A-after-confirm-390px-headless.png`). Pre-employment checks still says "Done".
- Portal copy repeats itself: "Pre-employment checks failed: Pre-employment checks failed" (`11-people-A-needs-decision-1280.png`).
- At Reset demo, Chris's `/team` already shows a Needs decision for Sam: "Pre-employment checks not done in time" (`03-team-chris-390px-headless.png`). B starts in 5 days, so the On deadline Hard Stop fires at once. The audience sees an unexplained decision during beat 4.

## 7. Day 14 Pulse check (PASS)

- Clock set to 2026-11-28 (B's Day 14). Pulse check becomes Action required on B. After answering 2 and 2, Chris's `/team` lists two Tasks: "Sam scored 2 for ... Have a chat." (`13-team-chris-pulse-task-390px-headless.png`).
- The Simulated date reads "28 Nov 2026" on `/me`, `/team` and `/portal/people/person-b` (`13`, `14`, `15`). PASS.

## 8. Reset demo (PASS)

- The `/api/state` JSON for person-a, person-b and person-c, taken right after a fresh seed and again after the whole walk plus `POST /api/reset`, is byte-identical for all three.

## Cross-face checks

- An Action done on B's `/me` (Contracting, read) shows the same status through the `/team` API and the HR state API on the very next request. PASS at API level.
- Demo controls and Reset demo do not appear on `/me` or `/team` (searched the text of `13.txt` and `14.txt`). PASS.
- No "undefined", raw error or "Milestone" in any captured page text. Every phone page has `scrollWidth 390`. PASS.
- Minor copy: `/team` shows "Add a journey" and "0 of 1 containers complete". GLOSSARY capitalises Journey and Container.
