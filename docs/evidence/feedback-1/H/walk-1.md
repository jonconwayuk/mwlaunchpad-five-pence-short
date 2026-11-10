# Wave H, Bob walk 1 (10 Nov 2026, 10:45 to 11:00)

Own instance: `DATABASE_URL=file:/tmp/h.db`, `next dev -p 3130` on the working tree at 9ad4c65 then 1478178 (the G1 fix landed mid-walk; step 2 filters re-checked after it). Headless Chrome, **one tab** for everything, driven over the DevTools protocol by `cdp.mjs` with one step file each in `steps/`. Every view change used the top-strip **View** and **Person** switchers. Raw output: `walk-log.txt`. Synthetic data only.

| Step | Result | Evidence (log lines, screenshots) |
| --- | --- | --- |
| 0. Reset demo | PASS | Simulated date 10 Nov 2026; "Infrastructure engineer E ... Applied 0 times" |
| 1. Journey builder: Connected repository, a new Journey as a file, Sync, ServiceNow operation | PASS | Panel: "Repository: This repository / Branch: main / Folder: journeys/". Wrote `journeys/j-h-demo.json` ("Service desk tools access"), clicked **Sync from repository**: "Last sync 2026-11-10 (Simulated date): 1 added"; library "22 of 22 Journeys". On its Hidden automation Action chose Connector **ServiceNow**, Operation **requestAccessPackage**, Publish > New content: the file on disk now has `"semver": "1.1.0"`, `"connector": "servicenow"`, `"operation": "requestAccessPackage"`. `01-repo-sync.png`, `01-connector.png`, `01-published.png` |
| 2. Pathway builder: filter by Stage and grade, drag, Dependency, loop refused, semver publish | PASS | Stage Onboarding + Grade E: "Branch induction, Engineering community intro, In-person events calendar, Lab environment, Service desk tools access" (Journeys with no grade tag are for everyone, so they stay; by design). Dropped onto "Infrastructure engineer E" as `i-j-h-demo-1` (synthetic drag events, as in G1). Dependency Lab environment to it: edges 11 to 12. Loop: "Service desk tools access already waits for Privileged access request, so Privileged access request cannot wait for Service desk tools access." Publish asks "What kind of change is this?"; New content: "Live version 1.1.0". `02-filtered.png`, `02-loop-refused.png`, `02-published.png` |
| 3. People: find Bob, apply, add a Delegate | PASS after fix 1 | "Find a person" + "Bob" leaves only Bob. Apply pathway (suggested "Infrastructure engineer E"). **Found:** the heading said "Infrastructure engineer E v2" while the builder said 1.1.0. Fix 1 (`fixes.md`): now "Applied Pathway: Infrastructure engineer E version 1.1.0". Delegate: Lena Brooks, "Lena Brooks can act for this person." `03-find-bob.png`, `03-bob-applied-delegate.png`, `fix1-people-semver.png` |
| 4. Bob's view: pack, honest wait after Plus 3 weeks, help chat, handover | PASS | Pack from Contracting to Pulse check, including "Service desk tools access". Demo controls (Bob) **Plus 3 weeks**: date 24 Nov; card "Privileged access request ... Day 14 ... Usually 19 to 28 days", nothing needed. Need help? (labelled "Simulated: scripted answers"): "When will my laptop arrive?" answered by "IT setup helper". A typed lab-budget question: "I'm not sure. Would you like to talk to a person?", **Talk to a person**: "SIMULATED TEAMS HANDOVER. Hannah Price will pick this up in Teams." `04-*.png` |
| 5. Hannah: progress, Addition within 3 s, Reminder, Needs decision | PASS | "Bob is in Pre-contract. 0 of 12 things done. Waiting on privileged access request, usually 19 to 28 days", plus the help-chat To-do. Add a journey "Modern Workplace team access package", After Cleared to start, Confirm: on Bob's view in **1525 ms** including the view switch; live with Bob's view left open (no reload): **2361 ms** (poll every 3 s, so up to about 3 s). Labelled "Added by Hannah Price". **Send a Reminder now** (company car scheme): "Reminder sent to Bob Warwick"; Bob sees it. Bob then did Read your offer > Got it, Sign your contract > Submit, Pre-employment checks documents > Submit ("with our vetting partner"). Demo controls "Bob Warwick: Pre-employment checks" > Simulate failed: Bob's view unchanged; Hannah: "Needs decision. Bob Warwick: Pre-employment checks failed", reason required; typed a reason, Dismiss: Needs decision gone, Bob's checks "Done", ID creation "Action required". `05-*.png` |
| 6. Leo (Buddy) | PASS | "Bob is in Pre-employment. Nothing to do right now. Cleared to start 1 of 3 done. Note to Bob Warwick." No Needs decision, failure, help question, Reminder, Add a journey or Pulse score. `06-leo-buddy.png` |
| 7. Insights | PASS | "across 80 past starters"; Pathway times; "Managing director starters in Executive take longest"; Journeys by Business area, Role and Grade (all three toggles change the dots); drill-down "Pre-employment checks usually 21 to 35 days ... The quickest took 14 days and the longest 48"; Stage filter "in the Pre-employment Stage"; "Built from synthetic history". `07-*.png` |
| 8. Reset demo | PASS, one caveat | Date 10 Nov, Infrastructure engineer E version 1.0.0 applied 0 times, Bob no Pathway and no Delegate, Hannah has no help question, Addition or Needs decision. **Caveat:** the new Journey stays in the library, because Reset reseeds from `journeys/` and the file is still there. That is config as code working; delete the file (or `git checkout journeys/`) before Reset. Deleted here, then reseeded. `08-after-reset.png` |

## BUILD-PLAN section 9 (personas A and B), same tab

| Item | Result | Evidence |
| --- | --- | --- |
| 1 (canvas) | PASS | Covered by step 2 above on the same canvas |
| 2 filter and apply | PASS | Job family Branch lists only "Branch colleague"; Applied "Branch colleague" to Alex, "Software engineer" to Sam |
| 3 two packs | PASS | Alex: Branch device, Uniform. Sam: Developer device, Engineering community intro |
| 4 LM Addition | PASS | Chris adds "Payments squad access package": "Added by Chris Lee" on Sam's view after 1013 ms (with the switch). First try FAILED because the driver clicked the first **Confirm** on the page, which is Sam's seeded Needs decision, not the Add a journey form's (a driver error, but the same trap for a presenter; see the script) |
| 5 honest wait | PASS | Alex: "Day 18 of your wait", "Usually 21 to 35 days" |
| 6 failed vetting | PASS | Needs decision on Alex's People page and Priya's view; Alex's view unchanged (Day 18, no failure, no "recruiter") |
| 7 Day 14 Pulse | PASS | Sam: "A quick check-in" > Got it, answered 2 twice; Chris: "Sam scored 2 for "How connected do you feel? (1 to 5)". Have a chat." |
| 8 reset | PASS | Simulated date 10 Nov 2026 |
| 9 check | Orchestrator's gate | Not run here |

## Walk 2 (11:05 to 11:10, after fix 1 and the phone layout fix)

One driver, `steps/walk.mjs`, runs steps 0 to 8 in the same tab on a fresh seed. It copies `docs/demo/j-h-demo.json` into `journeys/` for step 1 and deletes it before the final Reset, as the script does. Every step PASSED (`walk-2-log.txt`): 1 added on Sync; Live version 1.1.0; "Applied Pathway: Infrastructure engineer E version 1.1.0"; Day 14 against 19 to 28 days; handover to Hannah Price; Addition on Bob's view in 1502 ms with the switch; "Reminder sent to Bob Warwick"; Needs decision dismissed with a reason; Leo sees "Nothing to do right now"; Insights drill-down; Reset gave 21 Journeys, version 1.0.0, and Bob with no Pathway and no Delegate.

Two runs before that failed for driver reasons, not product ones:
- The persona cookie was still Sam from the section 9 run, because Reset demo doesn't reset the Person. The script now says to set Person back to Bob.
- A 3-second wait was too short for a view switch while another agent's build was compiling. The step files now poll.

Phone layout check after 7455ca2: the joiner face sits in a 390px frame (`09-phone-layout-joiner.png`).
