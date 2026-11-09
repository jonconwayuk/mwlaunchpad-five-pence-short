# Design.MD: MW Launchpad

The agreed spec for the LaunchPad '26 build. Raw ideas live in `Ideas.MD`; terms are defined in `GLOSSARY.md`; decisions with lasting trade-offs are recorded as ADRs in `docs/adr/`. Brief and judging details are in `launchpadnotes.MD`.

## Status

Agreed by the team on 9 Nov 2026 (Day 1). Every design question is settled except the demo script, which is parked. Later changes to an agreed decision should update this file, the glossary and any ADR it names.

**Version 1.0** (9 Nov 2026). This is the project's spec under the phase workflow (`docs/workflow/phase-workflow.md`). It changes only by explicit amendment: each amendment bumps the version, adds a line to the amendment log below, and gets an entry in `docs/decisions.md`.

| Version | Date | Amendment | Decision |
| --- | --- | --- | --- |
| 1.0 | 9 Nov 2026 | Agreed by the team (Day 1) | 1 |

## Decisions

### D1. The demo centres on the Admin Portal (ADR-0003)

- The lead is the back end and pathway-building logic, with a front end: Journey library and builder, Pathway builder, applying a Pathway to a Person, observability. This is the USP.
- Built as one web app with three faces:
  - **Admin Portal**: laptop-first, not designed for phones. Journey library and builder, Pathway builder, apply, observability.
  - **Starter Preview**: mobile. The starter is the consumer.
  - **Manager and Buddy view**: mobile. Seeing what is left and acting on it.
- Changes in the Admin Portal show up live in the mobile faces.
- Any screenshots or mock-ups use synthetic data only.
- The presentation includes a slide on the advantages of building a web app.

### D1a. The starter's side is a live Starter Preview

- A phone page that shows an Applied Pathway as the starter would see it: Journeys grouped by Stage, each with its Journey Status, plus a "what's next" line.
- Later decisions made it interactive: the starter (or Delegate) completes their own Actions here, such as Read, Task, Choose, Provide and Pulse check (D3, D9, D12a). No chat.
- Built live from the back end, so a change made in the Admin Portal shows up in the preview. The key demo move: apply Pathways to two personas and flip between their previews on the phone.
- Static mock-ups only for things we won't build, such as chat or the Teams integration, and labelled as mock-ups.

### D2. Pathways are a dependency graph with Conditions resolved when applied (ADR-0004)

- A Journey is a discrete, self-contained set of instructions. It holds no dependencies and never refers to another Journey.
- The Pathway holds all the logic, on Pathway Items: Dependencies (which Pathway Items must be Done first) and Conditions (which Person attributes a Pathway Item applies to). Whether a Journey is mandatory is also set on its Pathway Item.
- Sequence and parallel work both come from Dependencies: anything with no unmet Dependencies is available.
- Conditions are resolved once, at apply time. The Applied Pathway keeps only matching Pathway Items; a Dependency on an excluded Pathway Item counts as met.
- Demo move: apply the same Pathway to two personas and show two different Starter Previews.
- Out of scope: branching on events mid-journey (production path).

### D2a. The Pathway builder is a drag-and-drop graph editor

- This is the core USP, so it gets the build time. It must be intuitive to a non-technical HR Partner.
- HR drags Journeys from the library onto a canvas to make Pathway Items, and draws connections between them to set Dependencies.
- Laptop only (Admin Portal).

### D2a-i. Canvas interaction rules

1. **Library panel** on the left: Journey cards with Stage and tags, search and tag filter. Drag a card onto the canvas to create a Pathway Item.
2. **Stage lanes**: the canvas background has one labelled column per Stage. A dropped card snaps into its Journey's Stage lane, so the Pathway reads left to right.
3. **Dependencies by dragging from the dot** on a card's right edge to another card ("this must be done first"). A connection that would make a loop is refused with a plain-English message naming the two Journeys, with no jargon.
4. **Click a card for a side panel**: "Who gets this?" Condition as plain dropdowns from the fixed tag lists (default "Everyone"), a Mandatory toggle, and "Remove from pathway".
5. **Cues on cards**: a badge for a Condition (for example "Branch only") and a lock icon for mandatory.
6. **"Preview as…" picker**: choose a synthetic Person and the Pathway Items that don't apply to them fade out.
7. **Save Draft and Publish**: edits save as a draft automatically; Publish creates a new Pathway version. Nothing reaches starters until published.

### D2a-ii. Three more canvas building blocks (detail being agreed)

The team asked for three more kinds of block on the canvas:

1. **Milestone** (agreed, see D2d): a box around several Pathway Items that must all be done before the process moves on.
2. **Timer** (agreed, see D2e): something happens X days after a chosen event, such as a reminder or an offer becoming available (company car scheme, flex benefits).
3. **Hard Stop** (agreed, see D2f; originally "termination block"): when a deadline is reached or an Outcome fails (for example failed vetting), it stops other activities from progressing. ADR-0004 is amended to allow this.

### D2d. Milestones

1. Dependencies can attach to a Milestone as a whole: a card that depends on it waits for all of it.
2. A Milestone is hit when every mandatory Pathway Item inside it is Done. Optional items, and items a Condition left out, don't hold it up.
3. Pathway Items inside run at the same time unless HR draws Dependencies between them.
4. Milestones do not nest; they can be chained with Dependencies.
5. A Milestone sits inside one Stage lane or spans neighbouring lanes. It's the natural gate between Stages, such as "Cleared to start".
6. The starter sees it: a hit Milestone is a visible moment of progress, and one not yet hit shows what's left inside it ("Where am I?").

### D2e. Timers

1. A Timer is set as "N days after or before an Anchor". Anchors: Offer accepted, Start date, a chosen Pathway Item Done, a chosen Milestone hit. Counting backwards is allowed only from the Start date.
2. **Unlock**: drag from the Timer's dot to a card; the card can't start until the Timer fires. Combines with other Dependencies (all must be met).
3. **Remind**: "Send a reminder" in the side panel, choosing recipient (Starter, Line Manager or Buddy), the card it's about, and a short message. Skipped if that card is already Done ("Guide, don't nag").
4. One firing, no repeats. A second nudge needs a second Timer.
5. When an Anchor's date moves (such as a slipped start date), every Timer anchored to it moves too (SQ-06, "When Plans Change").
6. The starter sees a friendly date ("Flex benefits open on 24 Nov"), never the Timer itself.

Consequence: Timers make a demo clock essential (open question 7).

### D2f. Hard Stops and Outcomes

- Named **Hard Stop**, because "termination" means ending employment in HR.
- A Journey can optionally declare an **Outcome**: Passed or Failed (Vetting, Right to work, pre-employment checks). A Failed Outcome still counts as Done for Journey Duration.
1. Two triggers: **On Failed** (drag from a card's Failed dot to the Hard Stop) and **On deadline** (a Timer plus the card it watches; fires only if that card isn't Done in time).
2. What it stops is drawn: HR connects it to cards or Milestones, or ticks "Stop the whole pathway". Stopped items become **Cancelled**: no Reminders, nothing downstream unlocks.
3. A person always confirms. It raises "Needs decision" in the Admin Portal and the Manager and Buddy view: **Confirm**, **Extend** (deadlines only; moves the Timer) or **Dismiss** (proceed, with a reason). The reason is recorded for audit.
4. The starter never hears it from the app first. While pending, nothing changes for them; after Confirm the Starter Preview says only that their recruiter will be in touch.
5. No undo in the demo: re-apply the Pathway instead. Reinstating cancelled items is a production-path item.

### D3. A Journey is made of Actions

A Journey is a header (title, description, owner, version, Stage, tags), an ordered list of **Actions**, and an optional "while you wait" message (see question 5). It may declare a pass/fail **Outcome**.

| Type | What it does | Who acts | Done when |
| --- | --- | --- | --- |
| **Read** | Shows an info card | Starter | Starter taps "Got it" |
| **Notification** | Sends a message to a chosen person, shown in their view. How chain reactions happen. | Nobody; it sends itself | Sent |
| **Task** | One thing for one named owner: Starter, Line Manager, Buddy or HR | Its owner | Ticked |
| **Hidden automation** | Calls a mocked internal system behind an interface; never shown to the starter. Can set the Outcome. | Mocked system (or HR pressing "simulate result" in the demo) | System returns a result |
| **Choose** | Starter picks from options. Used only by the Journey that asked, and visible to the Line Manager. | Starter | Choice made |
| **Provide** | Starter fills in a form or uploads. Content goes to the system of record; the app keeps only a receipt. | Starter | Submitted |

Rules:
1. Actions run in order inside a Journey. Dependencies between Journeys stay on the Pathway.
2. A Journey is Done when all its Actions are done. Its Journey Status comes from them: an open starter-owned Action means *Action required*; only others' Actions open means *In progress*.
3. A **To-do list** is a roll-up of each person's open Tasks across all Journeys and starters, shown in their view. It is not an Action type.
4. The Journey builder is a simple laptop form: header plus a drag-to-reorder Action list.
5. An AI Agent attaches to a Journey as a "Need help?" button, not as an Action type.

### D3a. Data kept and data passed through

- **Outcomes of every Journey are recorded** in the database with timestamps: Done, Cancelled, Passed or Failed. They feed observability and later use.
- **Choose** results are kept with the Journey that asked for them, and used only by that Journey.
- **Provide** content (form fields, uploads) is transient: it is passed to the system of record (a mocked adapter in the demo) and not stored in the app database. The app keeps only a receipt (who, what, when).
- **Journeys never share data with each other.** Each Journey is discrete. Any Journey can read the Person's own attributes (job family, location, start date, Line Manager, Buddy), because those belong to the Person, not to another Journey.
- **Personal details such as home address come from the system of record**, fetched by a Hidden automation when needed, and are not recorded by the app.

### D3b. Example Journeys (from Ideas.MD), checked for self-containment

All flags resolved 9 Nov 2026. Every Journey below is now self-contained.

| Journey | How it is self-contained |
| --- | --- |
| Contracting | Self-contained |
| Payroll | Collects bank details itself (Provide, passed through to the system of record) |
| **Pre-employment checks** | Merges Right to work, Proof of address and Vetting (Flag A): Provide documents, then a Hidden automation runs the check, then Outcome Passed or Failed. The demo's main Hard Stop case. |
| ID creation (photo) | Photo upload and badge request in one Journey. Waits for Pre-employment checks Passed, which is a Dependency on the Pathway, not data. |
| Start delay engagement | Kept as a Journey (Flag C), unlocked by a Timer such as "30 days after Offer accepted". Read and Notification Actions. |
| Merch distribution | Its own Choose for size. Delivery address fetched from the system of record by Hidden automation, not stored in the app (Flag B). |
| Device preferences and provisioning | One combined Journey: Choose the device, then Hidden automation orders it. Delivery address fetched from the system of record (Flag B). |
| Access package provision | Creates the network account first, then the access package, both by Hidden automation (Flag D). |
| In-person events calendar | Uses the Person's location |
| Welcome from sponsoring exec | Uses org structure |

### D4. Pathway versions and one-off changes (ADR-0002, rewritten)

1. Each Pathway has **one live version**, the only one that can be applied. It keeps a recorded **version history** and a **count of times applied**.
2. Only the Pathway's owner publishes a new live version.
3. Applying snapshots the live version (and its Journey versions, ADR-0001) and records it against the Person as their Applied Pathway. Later changes reach only starters it is applied to afterwards.
4. A **one-off change** for one starter is made only in their Applied Pathway. It is never saved as a new Pathway, never reusable, never in the library.
5. No forks, no merging. If the same one-off change keeps being made, the owner publishes it in the live version.

### D4a. Line Managers add Journeys to their starter's Applied Pathway

- A Line Manager can add **as many Journeys as they like** to a starter's Applied Pathway.
- They **cannot change or remove anything in the Pathway HR assigned**.
- Their additions are one-off changes (D4, rule 4): recorded on that starter only.

### D4b. Manager additions are the only per-starter change

- **HR never tailors a Pathway for one starter.** If HR wants something different, the owner changes the live Pathway or HR applies a different Pathway. The canvas has no "tailor for a Person" mode.
- **How a Line Manager adds a Journey, on their phone:**
  1. Tap **"Add a Journey"** on their starter's page.
  2. Pick from the library, filtered to their area, location and platform.
  3. Choose when it unlocks: **Now**, **After [a card]** (creates a Dependency) or **On Day N** (creates a Timer anchored to the Start date). No canvas, no arrows.
  4. The Journey shows **"Added by [manager's name]"** to everyone, including the starter.
  5. The manager can remove their own additions that haven't started. Never HR's items.
  6. The library shows "Applied 23 times · manager additions 9". When many managers add the same Journey, observability flags it to the Pathway owner.

### D5. Manager and Buddy view (mobile)

**Line Manager**
- Sees: their starters (Stage, Milestones hit, next Milestone); Blocked Flags with reasons; the starter's Choose results; "Needs decision" alerts from Hard Stops.
- Can: tick their own Tasks from their To-do list across all starters; add a Journey (D4b); override a Journey's status to Done with a recorded reason, except Journeys with a pass/fail Outcome; Confirm, Extend or Dismiss a Hard Stop (D2f); send the starter a note, shown on the Starter Preview.

**Buddy**
- Sees: the starter's Stage and Milestones only. No Blocked Flags, choices or check results; those stay private. Their own To-do list.
- Can: tick their own Tasks; send the starter a note.

**Out of scope, shown as labelled mock-up screenshots:** full two-way chat, and the Microsoft Teams integration.

### D6. Honest progress during long waits

1. The **Blocked Flag** sets itself while a Journey waits on a Hidden automation, and clears when it returns.
2. The **Usual Range** comes from the middle half of that Journey version's past Journey Durations (seeded synthetic history in the demo).
3. The starter sees a calm waiting card: what it's waiting on, "Nothing needed from you right now", "Usually takes 3–5 weeks · Day 18 so far", and the "while you wait" message.
4. Past the Usual Range: the Line Manager gets a Task to check in with the starter, and the starter's card says it's taking longer than usual and their manager knows and will be in touch.
5. Managers see "Waiting 38 days · usual 21–35 · overdue", with overdue starters sorted to the top.

### D7. Mandatory and optional

1. **Mandatory**: must be Done before its Milestone is hit; the starter can't skip it. Lock icon in the builder, but no "required" label for the starter.
2. **Optional**: shown as "Suggested for you". The starter can tap "Not for me", recording the Outcome **Skipped**. No more Reminders, and it holds up nothing.
3. Skip rate per Journey shows in the library ("Skipped by 40% of starters") as an improvement signal for the owner.
4. Line Managers choose mandatory or optional for Journeys they add; the default is optional.
5. At Day 30 the starter becomes Onboarded regardless, but each open mandatory Journey raises a Task for the Line Manager.

### D8. Four time-based Stages

1. Four Stages, used as canvas lanes:

   | Stage | From | To | Starter sees |
   | --- | --- | --- | --- |
   | Pre-contract | Offer accepted | Contract signed | Your offer |
   | Pre-employment | Contract signed | Day 1 | Getting ready |
   | Onboarding | Day 1 | End of week 1 | Your first week |
   | First 30 days | Week 2 | Day 30 | Your first month |

2. HR sees the formal names; the starter sees the friendly labels.
3. Every Journey must have exactly one Stage.
4. No slide mapping the brief's six stages onto ours.

### D9. "Did it work?": the Pulse check

1. A **Pulse check** Journey in the library: a Read ("Two quick questions. Your answers go to [manager] so they can help.") and two Choose Actions scored 1–5: "How connected do you feel to your team?" and "How confident do you feel in your role?".
2. Placed on the Pathway twice, unlocked by Timers at **Day 14** and **Day 30**.
3. Choose gains a "flag answers at or below" setting. A score of 2 or lower creates a Task for the Line Manager ("Sam scored 2 for connection on Day 14. Have a chat."). The rule lives inside the Journey, so it stays discrete.
4. Scores go only to the Line Manager, never the Buddy.
5. Observability rolls scores up by Pathway version ("Retail colleague v3: average connection 4.1 at Day 30 · v4: 4.4") and compares them with skipped Journeys. The loop: build, apply, measure feeling, improve.

Demo moment: move the demo clock to Day 14, answer "2", and a manager Task appears live on the phone.

### D10. Chain reactions need no rules engine

Chain reactions are expressed only through Actions inside Journeys (a Task, then a Hidden automation, then a Notification) and Pathway logic (Dependencies, Milestones, Timers). There is no separate "when X, then Y" builder.

Three chains built as seed Journeys and demoed:

| # | Chain | How it's built |
| --- | --- | --- |
| 1 | Goals set → welcome pack sent → starter told | "Manager ready" Journey: Task (Line Manager sets 3-month goals) → Hidden automation (send welcome pack) → Notification to the starter |
| 2 | Cleared to start → buddy says hello | Pre-employment checks Passed → "Cleared to start" Milestone hit → unlocks "Meet your buddy": Notification to the Buddy, then a Task for them to send a hello note |
| 3 | Low pulse → manager acts | Pulse check score of 2 or lower → Task for the Line Manager (D9) |

Already designed, mentioned but not demoed: overdue wait → manager Task (D6); Hard Stop → "Needs decision" (D2f).

### D11. The AI Agent is mocked

- No real LLM in the build. The AI Agent stays in the model as a library item, reached from a "Need help?" button on a Journey.
- **A scripted mock with a real handover**:
  - "Need help?" opens a small chat panel on the Starter Preview, labelled **"Simulated assistant"**.
  - Three tappable suggested questions with pre-written answers, no free-text typing: "What should I bring on my first day?" (from the synthetic policy pack), "When will my laptop arrive?" (uses the starter's real Usual Range), and "Can I talk to someone?" (handover).
  - The handover is real: it creates a Task for the Line Manager, which appears live on the Manager and Buddy view (chain reaction 4).
- Production path: swap the script for a grounded model behind the same interface.

### D12. Demo personas

One shared Pathway, **"Colleague core"**, with Conditions on job family and location, applied to three synthetic personas. Each has a synthetic Line Manager and Buddy. Use people from the synthetic data pack (A-02) if it has them.

| Persona | Gets only them | Role in the demo |
| --- | --- | --- |
| **A: Branch colleague, Cardiff** | Branch induction, uniform (Merch with a size Choose), cash-handling training | **Leads**: long vetting wait, Hard Stop risk, in-person items |
| **B: Software engineer, Leeds** | Developer access package, high-spec device options, engineering community intro | Contrast: flip phones to show a different pack (echoes prompt 05) |
| **C: Executive, with an Executive Assistant as Delegate** | Exec-specific Journeys (such as Welcome from sponsoring exec) | Shows a Delegate acting on the starter's behalf |

Shared by all: Pre-employment checks, Contracting, Payroll, ID creation, Meet your buddy, Pulse checks.

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
3. Moving the clock fires everything due, in date order: Timers, Reminders, overdue Tasks, Status changes.
4. **Simulate: Passed / Failed / Returned** buttons on waiting Hidden automations, only in Demo controls, never on the mobile faces.
5. Every face, phones included, shows a "Simulated date: …" strip.
6. **Reset demo** reseeds the synthetic data so every run starts from the same state.
7. Time only moves forward; to go back, reset.

### D14. Stack and live updates (ADR-0006)

- One **Next.js (TypeScript)** app: `/portal` (Admin Portal), `/me` (Starter Preview, also for Delegates), `/team` (Manager and Buddy view).
- **React Flow** for the Pathway builder canvas.
- A separate **Pathway engine** module with no UI, unit-tested with **Vitest**.
- **SQLite** (Prisma or Drizzle), seeded with synthetic data; Reset demo reseeds.
- **Adapter interfaces** with mock implementations for Workday, vetting, IT provisioning and merch.
- **Server-sent events** for live updates; fall back to polling every 3 seconds.
- **Azure App Service, UK South**, named to the team convention; secrets in app settings. Fallback: run locally over the same network.

### D15. Build plan and scope

Build freeze is 13:00 on Day 2 (10 Nov). Suggested split tonight: one person builds the Pathway engine and tests, another builds the canvas against seed data; they meet at the engine's interface.

**P0, Day 1 evening (no demo without these)**
1. Pathway engine and Vitest tests: Conditions, Dependencies, Milestones, Timers, Journey Status and Outcomes, against the Demo clock.
2. Seed data: three personas with Line Managers and Buddies, about 10 library Journeys, and the "Colleague core" Pathway.
3. Pathway builder canvas: library panel, drag on, connect Dependencies with loops refused, side panel for Condition and Mandatory, Milestone grouping, Stage lanes, Publish.
4. Journey builder UI (D3 rule 4): a simple laptop form in the Admin Portal to create or edit a Journey (header, Stage, tags, Outcome, "while you wait" message) with a drag-to-reorder Action list, then publish it to the library. The seeded Journeys still ship as data, so the demo never depends on building one live.
5. Apply a Pathway to a Person; Starter Preview on a phone with Stage groups, statuses and the waiting card.
6. Demo controls: clock, Simulate result, Reset.
7. Deploy once, to find phone problems early.

**P1, Day 2 morning, before the 10:15 checkpoint**
- Manager and Buddy view: To-do list, ticking Tasks, "Needs decision".
- Hard Stop end to end; Timer and Hard Stop blocks on the canvas.
- Live updates over server-sent events.
- Chains 1 and 2; Pulse check with a manager Task on a low score (chain 3).

**P2, 10:15–12:30, only if ahead**
- Observability page: durations, Usual Range, skip rate, Pulse by version, manager additions.
- "Preview as…" on the canvas.
- Delegate (Persona C).
- Scripted assistant.
- Manager "Add a Journey".

**Out of scope, stated in the README and slides as deliberate omissions**
- Login and authentication: a persona switcher replaces login. Real sign-in (such as Entra ID) is production path.
- Real LLM and multi-agent orchestration; two-way chat; Teams integration.
- Real system-of-record integrations (adapters are mocked).
- Branching on events mid-journey; undoing a Hard Stop; multiple or external Delegates; HR tailoring a Pathway per starter.
- Merging Pathway versions; "behind the live version" alerts.

## Parked

- **Demo script.** The team will shape the demo later. When it does: the Day 2 private walkthrough is "10 minutes showing the working build on a phone", and the Admin Portal is laptop-only, so check with the mentor how the laptop part is treated.
