# Design.MD: MW Launchpad

The agreed spec for the LaunchPad '26 build. `Ideas.MD` is an early raw log, superseded by this file. Phasing and build tasks live in `BUILD-PLAN.md`. Terms are defined in `GLOSSARY.md`; decisions with lasting trade-offs are recorded as ADRs in `docs/adr/`. Brief and judging details are in `launchpadnotes.MD`.

## Status

Agreed by the team on 9 Nov 2026 (Day 1). Every design question is settled except the demo script, which is parked. Later changes to an agreed decision should update this file, the glossary and any ADR it names.

## Decisions

### D1. The demo centres on the Admin Portal (ADR-0003)

- The lead is the back end and pathway-building logic, with a front end: Journey library and builder, Pathway builder, applying a Pathway to a Person, observability. This is the USP.
- Built as one web app with three faces:
  - **Admin Portal**: laptop-first, not designed for phones. Journey library and builder, Pathway library and builder, apply, observability.
  - **Starter Preview**: mobile. The starter is the consumer.
  - **Manager and Buddy view**: mobile. Seeing what is left and acting on it.
- Changes in the Admin Portal show up live in the mobile faces.
- Any screenshots or mock-ups use synthetic data only.
- The presentation includes a slide on the advantages of building a web app.

### D1a. The starter's side is a live Starter Preview

- A phone page that shows an Applied Pathway as the starter would see it: Journeys grouped by Stage, each with its Journey Status, plus a "what's next" line.
- It is interactive: the starter (or their Delegate) completes their own Actions here: acknowledging Read cards, ticking Tasks, making Choose selections, submitting Provide forms and answering Pulse checks (D3, D9, D12a). No chat.
- Built live from the back end, so a change made in the Admin Portal or by a Line Manager shows up in the preview. The key demo move is in D2.
- Static mock-ups only for things we won't build, such as chat or the Teams integration, and labelled as mock-ups.

### D2. Pathways are templates that HR chooses and applies (ADR-0004)

- A **Journey** is a discrete, self-contained set of instructions. It holds no dependencies and never refers to another Journey. It is built once and reused in many Pathways.
- A **Pathway** is a template built by HR from library Journeys. It holds all the logic between them, on Pathway Items: **Dependencies** (which Pathway Items, Containers or Timers must be met first) and whether each Journey is **mandatory**.
- Sequence and parallel work both come from Dependencies: anything with no unmet Dependencies is available.
- **Nothing is matched automatically.** There are no rules that pick Journeys or Pathways for a Person. Journeys and Pathways are tagged with job family, role, grade, platform and location (fixed lists maintained by HR) only so that people can browse and filter the library.
- **How a starter gets their pack:**
  1. HR builds and publishes Pathway templates for the kinds of starter they see, such as "Branch colleague" or "Software engineer".
  2. When a new starter is selected, HR filters the Pathway library by the starter's job family, role, grade, platform and location, and applies the right template. This creates the starter's Applied Pathway.
  3. HR or the starter's Line Manager can then **add** Journeys to that starter's Applied Pathway, such as scheduled events or team-level onboarding tasks (D4a).
  4. **No one changes or removes anything from an HR-published Pathway** on an Applied Pathway. If a starter needs a different Pathway, HR builds and publishes a different one.
- **Demo move:** HR filters the Pathway library and applies "Branch colleague" to Persona A and "Software engineer" to Persona B. Both templates reuse the same core Journeys (Contracting, Payroll, Pre-employment checks). Flip phones to show two different packs. Then B's Line Manager adds their team's access package Journey, and it appears live on B's phone.
- Out of scope: rerouting a starter on events mid-journey (production path).

### D2a. The Pathway builder is a drag-and-drop graph editor

- This is the core USP, so it gets the build time. It must be intuitive to a non-technical HR Partner.
- HR drags Journeys from the library onto a canvas to make Pathway Items, and draws connections between them to set Dependencies.
- Laptop only (Admin Portal).

### D2a-i. Canvas interaction rules

1. **Library panel** on the left: Journey cards with Stage and tags, search and tag filter. Drag a card onto the canvas to create a Pathway Item.
2. **Stage lanes**: the canvas background has one labelled column per Stage. A dropped card snaps into its Journey's Stage lane, so the Pathway reads left to right.
3. **Dependencies by dragging from the dot** on a card's right edge to another card ("this must be done first"). A connection that would make a loop is refused with a plain-English message naming the two Journeys, with no jargon.
4. **Click a card for a side panel**: a Mandatory toggle and "Remove from pathway".
5. **Cues on cards**: a lock icon for mandatory.
6. **Pathway tags**: HR tags the Pathway itself with job family, role, grade, platform and location from the fixed lists, so it can be found in the Pathway library.
7. **Save Draft and Publish**: edits save as a draft automatically; Publish creates a new Pathway version. Nothing reaches starters until published.

### D2a-ii. Three more canvas building blocks

Besides Journey cards, the canvas has three kinds of block:

1. **Container** (D2d): a box around several Pathway Items that must all be Done before anything after it starts, such as "Cleared to start".
2. **Timer** (D2e): something happens N days after a chosen event, such as a Reminder or an offer becoming available (company car scheme, flex benefits).
3. **Hard Stop** (D2f): when a deadline passes or an Outcome is Failed (for example failed vetting), it stops other work from progressing. ADR-0004 allows this.

### D2d. Containers

1. HR chooses which Pathway Items go inside a Container, such as "Cleared to start".
2. Dependencies can attach to a Container as a whole: a card that depends on it waits for all of it.
3. A Container is **complete** when every mandatory Pathway Item inside it is Done. Optional items don't hold it up.
4. Pathway Items inside run at the same time unless HR draws Dependencies between them.
5. Containers do not nest; they can be chained with Dependencies.
6. A Container sits inside one Stage lane or spans neighbouring lanes. It is not a Stage: Stages are fixed time periods (D8), and Containers are groups HR draws.
7. The starter sees it: a complete Container is a visible moment of progress, and an incomplete one shows what's left inside it ("Where am I?").

### D2e. Timers

1. A Timer is set as "N days after or before an Anchor". Anchors: Offer accepted, Start date, a chosen Pathway Item Done, a chosen Container complete. Counting backwards is allowed only from the Start date.
2. **Unlock**: drag from the Timer's dot to a card; the card can't start until the Timer fires. Combines with other Dependencies (all must be met).
3. **Remind**: "Send a reminder" in the side panel, choosing recipient (Starter, Line Manager or Buddy), the card it's about, and a short message. Skipped if that card is already Done ("Guide, don't nag").
4. One firing, no repeats. A second Reminder needs a second Timer.
5. When an Anchor's date moves (such as a slipped start date), every Timer anchored to it moves too (SQ-06, "When Plans Change").
6. The starter sees a friendly date ("Flex benefits open on 24 Nov"), never the Timer itself.

Timers count against the Demo clock (D13), never the real clock.

### D2f. Hard Stops and Outcomes

- Named **Hard Stop**, because "termination" means ending employment in HR.
- A Journey can optionally declare an **Outcome**: Passed or Failed (Vetting, Right to work, pre-employment checks). A Failed Outcome still counts as Done for Journey Duration.
1. Two triggers: **On Failed** (drag from a card's Failed dot to the Hard Stop) and **On deadline** (a Timer plus the card it watches; fires only if that card isn't Done in time).
2. What it stops is drawn: HR connects it to cards or Containers, or ticks "Stop the whole pathway". Stopped items become **Cancelled**: no Reminders, nothing downstream unlocks.
3. A person always confirms. It raises a **Needs decision** alert for the HR Partner in the Admin Portal and for the Line Manager in the Manager and Buddy view (never the Buddy). Either can **Confirm**, **Extend** (deadlines only; moves the Timer) or **Dismiss** (proceed, with a reason). The reason is recorded for audit.
4. The starter never hears it from the app first. While pending, nothing changes for them; after Confirm the Starter Preview says only that their recruiter will be in touch.
5. No undo in the demo: re-apply the Pathway instead. Reinstating cancelled items is a production-path item.

### D3. A Journey is made of Actions

A Journey is a header (title, description, owner, version, Stage, tags), an ordered list of **Actions**, and an optional **"while you wait" message** shown on the starter's waiting card (D6). It may declare a pass/fail **Outcome** (D2f).

| Type | What it does | Who acts | Done when |
| --- | --- | --- | --- |
| **Read** | Shows an info card | Starter | Starter taps "Got it" |
| **Notification** | Sends a message to a chosen role (Starter, Line Manager, Buddy or HR), shown in their view. How chain reactions happen. | Nobody; it sends itself | Sent |
| **Task** | One thing for one named owner: Starter, Line Manager, Buddy or HR | Its owner | Ticked |
| **Hidden automation** | Calls a mocked internal system behind an interface; never shown to the starter. Can set the Outcome. | Mocked system (or HR pressing Simulate in Demo controls, D13) | System returns a result: **Passed** or **Failed** if it sets the Outcome, otherwise **Returned** (finished, no pass/fail, such as a device ordered) |
| **Choose** | Starter picks from options. Used only by the Journey that asked, and visible to the Line Manager. | Starter | Choice made |
| **Provide** | Starter fills in a form or uploads. Content goes to the system of record; the app keeps only a receipt. | Starter | Submitted |

Rules:
1. Actions run in order inside a Journey. Dependencies between Journeys stay on the Pathway.
2. **Journey Status** follows one lifecycle:
   - **Not started**: locked. Its Dependencies are not all met, or a Timer it depends on has not fired.
   - Once available, its status comes from the current Action (the first one not yet done): a starter-owned Action means **Action required**; anyone else's Action, or a Hidden automation, means **In progress**.
   - It ends as **Done** (every Action done), **Skipped** (an optional Journey the starter marked "Not for me", D7) or **Cancelled** (stopped by a confirmed Hard Stop, D2f).
   - A Journey with a Failed Outcome is Done; the Outcome records the failure.
3. **Journey Duration** runs from the moment the Journey becomes available (leaves Not started) to the moment it is Done.
4. A **To-do list** is a roll-up of each person's open Tasks across all Journeys and starters, shown in their view. It is not an Action type.
5. The Journey builder is a simple laptop form: header plus a drag-to-reorder Action list.
6. An AI Agent attaches to a Journey as a "Need help?" button, not as an Action type.

### D3a. Data kept and data passed through

- **Outcomes of every Journey are recorded** in the database with timestamps: Done, Cancelled, Skipped, Passed or Failed. They feed observability and later use.
- **Choose** results are kept with the Journey that asked for them, and used only by that Journey.
- **Provide** content (form fields, uploads) is transient: it is passed to the system of record (a mocked adapter in the demo) and not stored in the app database. The app keeps only a receipt (who, what, when).
- **Journeys never share data with each other.** Each Journey is discrete. Any Journey can read the Person's own attributes (job family, location, start date, Line Manager, Buddy), because those belong to the Person, not to another Journey.
- **Personal details such as home address come from the system of record**, fetched by a Hidden automation when needed, and are not recorded by the app.

### D3b. Example Journeys, each self-contained

| Journey | How it is self-contained |
| --- | --- |
| Contracting | Self-contained |
| Payroll | Collects bank details itself (Provide, passed through to the system of record) |
| **Pre-employment checks** | Covers Right to work, Proof of address and Vetting in one Journey: Provide documents, then a Hidden automation runs the check, then Outcome Passed or Failed. The demo's main Hard Stop case. |
| ID creation (photo) | Photo upload and badge request in one Journey. Waits for Pre-employment checks Passed, which is a Dependency on the Pathway, not data. |
| Start delay engagement | Added per starter by HR when they expect a long wait; never automatic. Unlocked by a Timer such as "30 days after Offer accepted". Read and Notification Actions. |
| Merch distribution | Its own Choose for size. Delivery address fetched from the system of record by Hidden automation, not stored in the app. |
| Device Journeys (such as Branch device, Developer device) | Device choice and provisioning are always one Journey: Choose the device, then a Hidden automation orders it. The device team publishes several, one per kind of role; HR picks the right one for each Pathway using the library filters. Delivery address fetched from the system of record. |
| Access package provision | Creates the network account first, then the access package, both by Hidden automation. There is one per team; the Line Manager picks their team's one from the library and adds it to their starter. |
| In-person events calendar | Uses the Person's location. Added per starter by HR. |
| Welcome from sponsoring exec | Uses org structure |

### D4. Pathway versions and additions (ADR-0002)

1. Each Pathway has **one live version**, the only one that can be applied. It keeps a recorded **version history** and a **count of times applied**.
2. Only the Pathway's owner publishes a new live version.
3. Applying snapshots the live version (and its Journey versions, ADR-0001) and records it against the Person as their Applied Pathway. Later changes reach only starters it is applied to afterwards.
4. The only per-starter change is an **addition**: a Journey added to one starter's Applied Pathway by HR or their Line Manager (D4a). It is recorded on that starter only, never saved as a new Pathway, never reusable, never in the library.
5. No forks, no merging. If the same addition keeps being made, the owner publishes it in the live version.

### D4a. Adding Journeys to one starter

- **HR or the starter's Line Manager** can add **as many Journeys as they like** to that starter's Applied Pathway, such as scheduled events, team-level onboarding tasks, a team access package or a start delay Journey.
- **No one can change or remove anything from the HR-published Pathway** on an Applied Pathway. If a starter needs a different Pathway, HR builds and publishes one.
- **How a Journey is added** (Line Manager on their phone; HR on the starter's page in the Admin Portal):
  1. Tap **"Add a Journey"** on the starter's page.
  2. Pick from the library, filtered by tags (job family, role, grade, platform, location).
  3. Choose when it unlocks: **Now**, **After [a card]** (creates a Dependency) or **On Day N** (creates a Timer anchored to the Start date). No canvas, no arrows.
  4. Choose mandatory or optional (default optional, D7).
  5. The Journey shows **"Added by [name]"** to everyone, including the starter.
  6. Whoever added a Journey can remove it if it hasn't started. No one can remove the HR-published Pathway's items.
  7. The library shows "Applied 23 times · additions 9". When many starters get the same addition, observability flags it to the Pathway owner.

### D5. Manager and Buddy view (mobile)

**Line Manager**
- Sees: their starters (current Stage, Containers complete, next Container); Blocked Flags with reasons; the starter's Choose results; "Needs decision" alerts from Hard Stops.
- Can: tick their own Tasks from their To-do list across all starters; add a Journey (D4a); override a Journey's status to Done with a recorded reason, except Journeys with a pass/fail Outcome; Confirm, Extend or Dismiss a Hard Stop (D2f); send the starter a note, shown on the Starter Preview.

**Buddy**
- Sees: the starter's current Stage and Containers only. No Blocked Flags, choices or check results; those stay private. Their own To-do list.
- Can: tick their own Tasks; send the starter a note.

**Out of scope, shown as labelled mock-up screenshots:** full two-way chat, and the Microsoft Teams integration.

### D6. Honest progress during long waits

1. The **Blocked Flag** sets itself while a Journey waits on a Hidden automation, and clears when it returns.
2. The **Usual Range** comes from the middle half of that Journey version's past Journey Durations (seeded synthetic history in the demo).
3. The starter sees a calm waiting card: what it's waiting on, "Nothing needed from you right now", "Usually takes 3–5 weeks · Day 18 so far", and the "while you wait" message.
4. Past the Usual Range: the Line Manager gets a Task to check in with the starter, and the starter's card says it's taking longer than usual and their manager knows and will be in touch.
5. Managers see "Waiting 38 days · usual 21–35 · overdue", with overdue starters sorted to the top.

### D7. Mandatory and optional

1. **Mandatory**: the starter can't skip it, and it must be Done before any Container it sits in is complete. Lock icon in the builder, but no "required" label for the starter.
2. **Optional**: shown as "Suggested for you". The starter can tap "Not for me", recording the Outcome **Skipped**. No more Reminders, and it holds up nothing.
3. Skip rate per Journey shows in the library ("Skipped by 40% of starters") as an improvement signal for the owner.
4. Whoever adds a Journey to one starter (HR or Line Manager) chooses mandatory or optional; the default is optional.
5. At Day 30 the starter becomes Onboarded regardless, but each open mandatory Journey raises a Task for the Line Manager.

### D8. Four Stages

1. Four Stages, used as canvas lanes:

   | Stage | From | To | Starter sees |
   | --- | --- | --- | --- |
   | Pre-contract | Offer accepted | Contracting Journey Done | Your offer |
   | Pre-employment | Contracting Journey Done | Day 1 (Start date) | Getting ready |
   | Onboarding | Day 1 | Day 7 (end of week 1) | Your first week |
   | First 30 days | Day 8 | Day 30 | Your first month |

2. HR sees the formal names; the starter sees the friendly labels.
3. Every Journey must have exactly one Stage.
4. **A Stage groups and labels; it never holds work back.** Only Dependencies and Timers decide when a Journey unlocks. A First 30 days Journey with no unmet Dependencies is available straight away; HR adds a Timer (such as "Day 8") if it must wait.
5. **A starter's current Stage** is Pre-contract until their Contracting Journey is Done. After that it comes from the Demo clock against their Start date, using the table above.
6. **Stages drive the high-level view** in observability: how many Journeys sit in each Stage, and how long each Stage took per starter and on average.
7. No slide mapping the brief's six stages onto ours.

### D9. "Did it work?": the Pulse check

1. A **Pulse check** Journey in the library: a Read ("Two quick questions. Your answers go to [manager] so they can help.") and two Choose Actions scored 1–5: "How connected do you feel to your team?" and "How confident do you feel in your role?".
2. Placed on the Pathway twice, unlocked by Timers at **Day 14** and **Day 30**.
3. Each Choose uses the "flag answers at or below" setting. A score of 2 or lower creates a Task for the Line Manager ("Sam scored 2 for connection on Day 14. Have a chat."). The rule lives inside the Journey, so it stays discrete.
4. Scores go only to the Line Manager, never the Buddy.
5. Observability rolls scores up by Pathway version ("Retail colleague v3: average connection 4.1 at Day 30 · v4: 4.4") and compares them with skipped Journeys. The loop: build, apply, measure feeling, improve.

Demo moment: move the demo clock to Day 14, answer "2", and a manager Task appears live on the phone.

### D10. Chain reactions need no rules engine

Chain reactions are expressed only through Actions inside Journeys (a Task, then a Hidden automation, then a Notification) and Pathway logic (Dependencies, Containers, Timers). There is no separate "when X, then Y" builder.

Three chains built as seed Journeys and demoed:

| # | Chain | How it's built |
| --- | --- | --- |
| 1 | Goals set → welcome pack sent → starter told | "Manager ready" Journey: Task (Line Manager sets 3-month goals) → Hidden automation (send welcome pack) → Notification to the starter |
| 2 | Cleared to start → buddy says hello | Pre-employment checks Passed → "Cleared to start" Container complete → unlocks "Meet your buddy": Notification to the Buddy, then a Task for them to send a hello note |
| 3 | Low pulse → manager acts | Pulse check score of 2 or lower → Task for the Line Manager (D9) |

Other chain reactions built from the same parts: overdue wait → Line Manager Task (D6); Hard Stop → "Needs decision" (D2f); assistant handover → Line Manager Task (D11).

### D11. The AI Agent is mocked

- No real LLM in the build. The AI Agent stays in the model as a library item, reached from a "Need help?" button on a Journey.
- **A scripted mock with a real handover**:
  - "Need help?" opens a small chat panel on the Starter Preview, labelled **"Simulated assistant"**.
  - Three tappable suggested questions with pre-written answers, no free-text typing: "What should I bring on my first day?" (from the synthetic policy pack), "When will my laptop arrive?" (uses the starter's real Usual Range), and "Can I talk to someone?" (handover).
  - The handover is real: it creates a Task for the Line Manager, which appears live on the Manager and Buddy view.
- Production path: swap the script for a grounded model behind the same interface.

### D12. Demo personas

Three synthetic personas, each with a synthetic Line Manager and Buddy. HR has published one Pathway template per kind of starter, and each persona has one applied. Use people from the synthetic data pack (A-02) if it has them.

| Persona | Pathway HR applies | Added for this starter | Role in the demo |
| --- | --- | --- | --- |
| **A: Branch colleague, Cardiff** | "Branch colleague": core Journeys plus Branch induction, Branch device, uniform (Merch with a size Choose), cash-handling training | By HR: Start delay engagement, In-person events calendar | **Leads**: long vetting wait, Hard Stop risk, in-person items |
| **B: Software engineer, Leeds** | "Software engineer": core Journeys plus Developer device, engineering community intro | By the Line Manager, live: their team's Access package provision | Contrast: flip phones to show a different pack (echoes prompt 05), then a live addition |
| **C: Executive, with an Executive Assistant as Delegate** | "Executive": core Journeys plus Executive device, Welcome from sponsoring exec | None | Shows a Delegate acting on the starter's behalf |

Core Journeys in every template: Contracting, Payroll, Pre-employment checks, ID creation, Meet your buddy, Pulse check (twice). They are the same library Journeys, reused, not copies. The full seed data is drafted in `SEED-DATA.md`, for team review.

**Delegate** is a general role, not only for Executive Assistants: it also supports starters with accessibility needs who want someone to act for them.

### D12a. Delegate rules

1. **The HR Partner sets the Delegate** on the starter's record when the starter asks. Removing one also goes through HR at the starter's request.
2. A Delegate can acknowledge Read cards, tick the starter's Tasks, and make Choose selections.
3. **Starter only** Actions can't be done by a Delegate. On by default for Provide (identity documents, bank details, right to work) and the Pulse check; a journey owner can turn it off for a specific Action, such as where help with a form is appropriate.
4. A Delegate sees exactly what the starter sees, on the Starter Preview with an "Acting for [name]" banner. Starter only Actions show as "Waiting for [starter]". Never Blocked Flags or check results.
5. Everything is attributed: "Done by [Delegate] for [Starter]", visible to the Line Manager and counted in observability.
6. Reminders go to the starter, the Delegate, or both, as the starter chooses. Default: both.
7. One Delegate per starter, from inside the organisation. Multiple Delegates, and external supporters such as carers, are production-path items.

Demo moment (Persona C): the EA, under "Acting for [Exec]", picks the exec's device and ticks two Tasks; the Pre-employment checks Provide shows "Waiting for [Exec]"; the Line Manager sees "Done by [EA] for [Exec]".

### D13. Demo clock and Demo controls

1. One system-wide **simulated today**, set from a **Demo controls** panel in the Admin Portal header. Every date calculation uses it, never the real clock.
2. Quick jumps per persona: Offer accepted, +3 weeks, Day 1, Day 14, Day 30; plus +1 day and +1 week.
3. Moving the clock fires everything due, in date order: Timers (and their Reminders and deadlines), overdue waits (D6), Day 30 checks (D7) and Status changes.
4. **Simulate: Passed / Failed / Returned** buttons on waiting Hidden automations, only in Demo controls, never on the mobile faces. Passed and Failed appear only on automations that set an Outcome; Returned means finished with no pass/fail result.
5. Every face, phones included, shows a "Simulated date: …" strip.
6. **Reset demo** reseeds the synthetic data so every run starts from the same state.
7. Time only moves forward; to go back, reset.

### D14. Stack and live updates (ADR-0006)

- One **Next.js (TypeScript)** app: `/portal` (Admin Portal), `/me` (Starter Preview, also for Delegates), `/team` (Manager and Buddy view).
- **React Flow** for the Pathway builder canvas.
- A separate **Pathway engine** module with no UI, unit-tested with **Vitest**.
- **SQLite** with **Drizzle** ORM, seeded with synthetic data; Reset demo reseeds.
- **Adapter interfaces** with mock implementations for Workday, vetting, IT provisioning and merch.
- **Server-sent events** for live updates; fall back to polling every 3 seconds.
- **Azure App Service, UK South**, named to the team convention; secrets in app settings. Fallback: run locally over the same network.

### D15. Scope: deliberate omissions

Phasing and build tasks are in `BUILD-PLAN.md`. These are out of scope, stated in the README and slides as deliberate omissions:
- Login and authentication: a persona switcher replaces login. Real sign-in (such as Entra ID) is production path.
- Real LLM and multi-agent orchestration; two-way chat; Teams integration.
- Real system-of-record integrations (adapters are mocked).
- Automatic matching of Journeys or Pathways to starters; rerouting on events mid-journey; changing or removing an HR-published Pathway's items for one starter; undoing a Hard Stop; multiple or external Delegates.
- Merging Pathway versions; "behind the live version" alerts.

## Parked

- **Demo script.** The team will shape the demo later. When it does: the Day 2 private walkthrough is "10 minutes showing the working build on a phone", and the Admin Portal is laptop-only, so check with the mentor how the laptop part is treated.
