# BUILD-PLAN.md: MW Launchpad

The build plan for the design in `Design.MD`. Terms are defined in `GLOSSARY.md`. Scope omissions are in `Design.MD` D15.

## Status

**Agreed and executable. Day 2, 10 Nov 2026.** Written to be handed to agents one task at a time, with no human in the loop until the build is complete. Every decision the earlier draft left open is closed in section 3. **No agent working from this plan may ask the owner a question.** If a brief is ambiguous, take the fallback it names, record a line in `docs/decisions.md`, and keep going.

Optimised for a short critical path, not for a tidy sequence. Four agents run at once through the middle of the build. The mechanism that makes that safe is exclusive **file ownership** (section 6), not branching.

---

## 1. How to use this plan

1. **Record the start.** The first agent writes the real clock time into the line below. Every offset in this plan is measured from it.

   > **Wave A began at: `__:__`** (fill this in, commit it with wave A)

2. Waves run in order. **Inside a wave, every task runs at the same time**, in its own agent. They never collide because no two tasks own the same file (section 6).
3. Each brief is self-contained. Hand it over verbatim, with the Global Constraints block in section 2. The agent should not need to read the rest of this file.
4. A task is finished when every line of its **Done when** list is true. Not before.
5. Commit per task on `main`, message supplied. Push at the end of every wave. **If it is not pushed to the fork, it does not count** (`launchpadnotes.MD`, build rules).
6. Each task has a **Time box** and a **STOP**. At the time box, take the STOP action, commit what is green, and hand back. Do not keep digging.
7. **Never edit a file you do not own.** If you need a change in someone else's file, leave a `// NEEDS: <what and why>` comment in your own file and say so in your closing message. The orchestrator resolves it between waves.

### Critical path

| Wave | Offset | Agents | What lands |
| --- | --- | --- | --- |
| **A** | T+0 → T+12 | 1 | Scaffold, tokens, engine types, loop detection, fixtures, a fixture-backed `/api/state` |
| **B** | T+12 → T+57 | **4** | Engine and tests ‖ database and seed ‖ Starter Preview ‖ Pathway builder canvas |
| **C** | T+57 → T+82 | **4** | Real API ‖ people, apply and Demo controls ‖ Manager and Buddy view ‖ Journey builder and libraries |
| **D** | T+82 → T+102 | 2 | Chains and Hard Stop end to end ‖ canvas persistence and read-only blocks |
| **E** | T+102 → T+127 | 1 | Hardening, README, real-phone walkthrough, push |

**Critical path: 127 minutes.** Started at 08:50, the build is freeze-ready by about 11:00, leaving two hours before the 13:00 freeze for the stretch list and rehearsal. That slack is the plan's safety margin; do not spend it early by widening scope.

### Why this is faster than it looks

Three things carry the saving, and they are design choices, not optimism.

**The UI never waits for the back end.** Wave A ships `src/engine/fixtures.ts` and a `GET /api/state` route that returns it. Every UI task calls the real hook against the real route from its first minute, so when wave C swaps that route's internals for the database, nothing in the UI changes. The Starter Preview and the canvas are built while the engine and the database are still being written.

**Applying a Pathway never depended on the canvas.** The earlier draft had it waiting for the builder. It only needs published Pathways, which the seed supplies. It moves up a whole wave.

**Loop detection ships in wave A.** The canvas needs `wouldCreateLoop` and so does the engine. Wave A writes it once, from the source in section 4.4, so neither later task blocks on the other.

---

## 2. Global Constraints

Paste this block into every task brief.

> **Global Constraints (MW Launchpad)**
>
> - **Invoke the `ponytail` skill** before you write code, and work to it: produce the code the brief asks for and no more, and keep token use low. Do not re-read files you just wrote, do not echo file contents back, and do not summarise your own diff. The plan already contains the exact code and values for anything it specifies verbatim: transcribe it, do not re-derive it.
> - Engineering standard is [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices), per `CLAUDE.md`: structure by component, layer the code, handle errors centrally, validate at the boundary, config from the environment.
> - Repo root is the working directory. Work on `main`. One commit per task, message given in the brief.
> - **You own the files your brief lists, and only those.** Do not create or edit files outside them. If you need a change elsewhere, leave a `// NEEDS: <what and why>` comment in a file you own and state it in your closing message.
> - Stack: Next.js 15 (App Router) + React 19 + TypeScript **strict** + Tailwind CSS 4 + Drizzle ORM over SQLite (`better-sqlite3`) + Vitest + React Flow (`@xyflow/react`) + zod. No other runtime dependency without recording a decision. Tailwind 4 has no config-file theme: brand colours are declared in an `@theme` block in `src/ui/tokens.css`.
> - **Use the exact vocabulary in `GLOSSARY.md`** in identifiers, UI copy, comments and commits: Journey, Action, Pathway, Pathway Item, Dependency, Container, Timer, Anchor, Reminder, Applied Pathway, Addition, Journey Status, Outcome, Hard Stop, Needs decision, Stage, Blocked Flag, Usual Range, Journey Duration, Starter Preview, Admin Portal, Manager and Buddy view, Demo clock, Demo controls. Never use that file's _Avoid_ words: no "step", "milestone", "gate", "trigger", "survey", "SLA", "assignment", "checklist", "termination".
> - **Layer the code.** `src/engine/` is pure: no React, no Next, no Drizzle, no `Date.now()`, no I/O. `src/db/` is data access only. `src/adapters/` holds mocked systems behind interfaces. `app/` is web only and calls the engine, never reimplements it.
> - **All date logic uses the Demo clock**, never the real clock. The engine takes `today` as a parameter. `new Date()` is banned outside `src/db/seed.ts` and `src/lib/clock.ts`.
> - TypeScript strict, no `any` unless a one-line comment justifies it. `const` by default, `===`, camelCase for values, PascalCase for types and components. Throw `Error` objects, never strings. Validate input at the API boundary with zod.
> - No `console.log` in committed code; use `src/lib/log.ts`. Never log personal data.
> - **Synthetic data only**, everywhere, including tests. **No secrets in the repo**: real values in `.env` (git-ignored), placeholders in `.env.example`. No tenant or subscription IDs anywhere.
> - Follow section 5 of `BUILD-PLAN.md` exactly for colour and type. Do not invent colours. Do not add a red or an amber.
> - Run `npm run check` (`tsc --noEmit && eslint . && vitest run`) before committing. Never commit red.
> - You may not ask the owner a question. Ambiguity resolves to the fallback in your brief; record it in `docs/decisions.md` and continue.

---

## 3. Decisions now closed

Briefs cite these by number.

| # | Question | Decision |
| --- | --- | --- |
| **B1** | Live updates: server-sent events or polling? | **Polling every 3 seconds**, the agreed fallback in `Design.MD` D14. SSE moves to the production path. One hook, `useLiveState`, used by all three faces. SSE through a dev server and phone wifi is a demo risk for no visible difference at this granularity. |
| **B2** | Is "Add a Journey" P0, P1 or P2? | **In scope, wave C.** The headline move in `Design.MD` D2 ends with a Line Manager adding a Journey live, so it cannot be optional. Minimal: unlock **Now** or **After [a card]**, mandatory toggle, "Added by [name]". No "On Day N". |
| **B3** | Observability | **Cut from the headline.** Not built in waves A to E. A Journey Duration and Usual Range strip is a stretch item. The Usual Range still appears on the starter's waiting card, which is where it earns its keep. |
| **B4** | Containers, Timers and Hard Stops: engine or canvas? | **Full logic in the engine, seeded as data, rendered read-only on the canvas.** Authoring them is a stretch item. Keeps Persona A's vetting wait, "Cleared to start" and the Hard Stop in the demo at a fraction of the cost. |
| **B5** | Hard Stop end to end | **In scope, wave D**, On Failed trigger plus the Needs decision flow (Confirm, Extend, Dismiss, reason recorded). Extend defaults to **+7 days**. On deadline is seeded and evaluated but not a scripted demo moment. |
| **B6** | Delegate Reminders | Always to **both** starter and Delegate. No setting (simplifies `Design.MD` D12a rule 6). |
| **B7** | Line Manager's library filter | **Journey tags only.** Journeys carry no org unit. |
| **B8** | HR's To-do list | In the **Admin Portal**, on the person's page. Not a separate screen. |
| **B9** | Demo clock start `T` | **`DEMO_T = '2026-11-10'`**, a constant in `src/db/seed.ts`. Every seeded date derives from it, so tests and Reset demo are deterministic. |
| **B10** | Persona names | **Keep the `SEED-DATA.md` placeholders.** The A-02 pack is not in the repo and renaming late is pure risk. All synthetic. |
| **B11** | How many Journeys to seed | **All 18 in `SEED-DATA.md`.** They are data rows. If wave B overruns, drop 13, 14, 16 and 18 in that order. |
| **B12** | Seeded history for the Usual Range | **Generated**: 20 synthetic prior starters per Pathway from a seeded pseudo-random function, tuned so Pre-employment checks lands at 21 to 35 days. |
| **B13** | Hosting | **Local network only.** `npm run build && npm start` on the demo laptop; phones reach `http://<laptop-ip>:3000`. Azure stays in `Design.MD` D14 as production path. Deployment is optional under the event rules. |
| **B14** | Branching | **Work directly on `main`**, commit per task, push per wave. Parallelism is made safe by file ownership (section 6), which costs nothing to merge. |
| **B15** | Authentication | None. A persona switcher in a cookie (`Design.MD` D15). |
| **B16** | How UI and back end run at once | **Wave A ships a fixture-backed `GET /api/state`.** UI tasks call the real hook against the real route from the start; wave C swaps the route's internals for the database. No UI rewiring, and the two halves build concurrently. |
| **B17** | Where loop detection lives | **Wave A**, from the source in section 4.4, so neither the engine task nor the canvas task waits on the other. |

Decisions made during the build go in `docs/decisions.md` as the next number.

---

## 4. Architecture contract

Agents in different waves must converge. These names are fixed in wave A and are not renegotiable.

### 4.1 Directory layout

```
app/
  layout.tsx                 root: fonts, tokens, SimulatedDateStrip
  portal/
    layout.tsx               left rail + Demo controls header
    journeys/page.tsx        Journey library
    journeys/[id]/page.tsx   Journey builder form
    pathways/page.tsx        Pathway library
    pathways/[id]/page.tsx   Pathway builder canvas
    people/page.tsx          people list
    people/[id]/page.tsx     apply a Pathway, Additions, HR To-do list, Needs decision
  me/page.tsx                Starter Preview (phone)
  team/page.tsx              Manager and Buddy view (phone)
  api/
    state/route.ts  actions/route.ts  clock/route.ts  simulate/route.ts  reset/route.ts
    apply/route.ts  additions/route.ts  hard-stops/[id]/decision/route.ts
    journeys/route.ts  pathways/[id]/route.ts  pathways/[id]/publish/route.ts
src/
  engine/                    PURE. no framework imports
    types.ts                 section 4.2, written in wave A
    loops.ts                 wouldCreateLoop, section 4.4, written in wave A
    fixtures.ts              demoState, written in wave A
    availability.ts  status.ts  hardStops.ts  duration.ts  computeState.ts  index.ts
    __tests__/*.test.ts
  db/        schema.ts  client.ts  seed.ts  queries.ts
  adapters/  types.ts  mockWorkday.ts  mockVetting.ts  mockItProvisioning.ts  mockMerch.ts
  ui/        tokens.css  components/<face>/*.tsx
  lib/       clock.ts  log.ts  persona.ts  apiHandler.ts  useLiveState.ts
docs/        adr/  decisions.md
```

### 4.2 Engine contract

Wave A writes `src/engine/types.ts` with exactly these types.

```ts
export type ISODate = string;                       // 'YYYY-MM-DD'
export type StageId = 'pre-contract' | 'pre-employment' | 'onboarding' | 'first-30-days';
export type ActionType = 'read' | 'notification' | 'task' | 'automation' | 'choose' | 'provide';
export type ActorRole = 'starter' | 'line-manager' | 'buddy' | 'hr';
export type JourneyStatus =
  | 'not-started' | 'in-progress' | 'action-required' | 'done' | 'skipped' | 'cancelled';
export type OutcomeValue = 'done' | 'cancelled' | 'skipped' | 'passed' | 'failed';
export type AutomationResult = 'passed' | 'failed' | 'returned';
export type PersonStatus = 'joiner' | 'starter' | 'onboarded';

export interface Tags {
  jobFamily?: string; role?: string; grade?: string; platform?: string; location?: string;
}

export interface ActionDef {
  id: string; type: ActionType; label: string;
  owner?: ActorRole;              // task, notification
  starterOnly?: boolean;          // a Delegate cannot complete it
  options?: string[];             // choose
  flagAtOrBelow?: number;         // choose: raises a Line Manager Task
  setsOutcome?: boolean;          // automation
}

export interface JourneyDef {
  id: string; version: number; title: string; description: string;
  ownerTeam: string; stage: StageId; tags: Tags;
  actions: ActionDef[]; whileYouWait?: string; declaresOutcome: boolean;
}

export type AnchorKind = 'offer-accepted' | 'start-date' | 'item-done' | 'container-complete';
export interface Anchor { kind: AnchorKind; itemId?: string; containerId?: string }

export interface TimerDef {
  id: string; label: string; anchor: Anchor;
  offsetDays: number;             // negative only when anchor.kind === 'start-date'
  reminder?: { to: ActorRole; aboutItemId: string; message: string };
}

export interface ContainerDef { id: string; label: string; itemIds: string[] }

export type HardStopTrigger =
  | { kind: 'on-failed'; itemId: string }
  | { kind: 'on-deadline'; timerId: string; watchesItemId: string };

export interface HardStopDef {
  id: string; label: string; trigger: HardStopTrigger;
  stops: { wholePathway: boolean; itemIds: string[]; containerIds: string[] };
}

export type DependencyRef =
  | { kind: 'item'; itemId: string }
  | { kind: 'container'; containerId: string }
  | { kind: 'timer'; timerId: string };

export interface PathwayItem {
  id: string; journeyId: string; journeyVersion: number;
  mandatory: boolean; dependsOn: DependencyRef[]; containerId?: string;
  lane: StageId; x: number; y: number;          // canvas position
  addedBy?: { personId: string; name: string }; // set only on an Addition
}

export interface PathwaySnapshot {
  id: string; pathwayId: string; version: number; title: string; tags: Tags;
  items: PathwayItem[]; containers: ContainerDef[]; timers: TimerDef[]; hardStops: HardStopDef[];
}

export interface PersonRef {
  id: string; name: string; tags: Tags;
  offerAcceptedDate: ISODate; startDate: ISODate;
  lineManagerId?: string; buddyId?: string; delegateId?: string;
}

export interface ActionProgress {
  itemId: string; actionId: string; state: 'pending' | 'done';
  doneAt?: ISODate; doneByPersonId?: string;
  value?: string | number; automationResult?: AutomationResult;
}

export interface ItemOverride {
  itemId: string; status: 'done' | 'skipped'; reason?: string; byPersonId?: string; at: ISODate;
}

export interface HardStopDecision {
  hardStopId: string; decision: 'confirm' | 'extend' | 'dismiss';
  reason?: string; extendDays?: number; at: ISODate;
}

export interface DurationSample { journeyId: string; journeyVersion: number; days: number }

export interface EngineInput {
  today: ISODate;
  person: PersonRef;
  pathway: PathwaySnapshot;
  journeys: Record<string, JourneyDef>;     // keyed `${journeyId}@${version}`
  progress: ActionProgress[];
  overrides: ItemOverride[];
  hardStopDecisions: HardStopDecision[];
  history: DurationSample[];
}

export interface ItemState {
  itemId: string; journeyId: string; title: string; stage: StageId;
  status: JourneyStatus; mandatory: boolean; available: boolean;
  availableSince?: ISODate; doneAt?: ISODate; outcome?: OutcomeValue;
  currentAction?: ActionDef;
  blockedFlag: boolean;                      // waiting on a Hidden automation. HR and Line Manager only
  waitingDays?: number; usualRange?: [number, number]; overdue: boolean;
  unmetDependencies: DependencyRef[];
  whileYouWait?: string;
  addedBy?: { personId: string; name: string };
}

export interface ContainerState {
  containerId: string; label: string; complete: boolean;
  doneCount: number; mandatoryCount: number; remainingItemIds: string[];
}

export interface TimerState { timerId: string; firesOn?: ISODate; fired: boolean }

export interface NeedsDecision {
  hardStopId: string; label: string; reason: string;
  stopsItemIds: string[]; wholePathway: boolean; raisedOn: ISODate; extendAllowed: boolean;
}

export interface TaskRef {
  itemId: string; actionId: string; label: string;
  owner: ActorRole; personId: string; starterName: string; raisedOn: ISODate;
}

export interface EngineState {
  today: ISODate; stage: StageId; personStatus: PersonStatus; dayNumber: number;
  items: ItemState[]; containers: ContainerState[]; timers: TimerState[];
  needsDecisions: NeedsDecision[];
  tasks: TaskRef[];                          // every open Task; filter by owner for a To-do list
  notifications: { to: ActorRole; message: string; sentOn: ISODate }[];
  nextUp?: { itemId: string; line: string }; // the starter's "what's next" line
}

// Signatures only. computeState lives in computeState.ts, resolveTimerDate in availability.ts,
// wouldCreateLoop in loops.ts. types.ts holds no implementation.
export function computeState(input: EngineInput): EngineState;
export function resolveTimerDate(timer: TimerDef, input: EngineInput): ISODate | undefined;
export function wouldCreateLoop(
  items: PathwayItem[], fromItemId: string, toItemId: string, titleOf: (id: string) => string
): { loops: true; throughTitles: string[] } | { loops: false };
```

**Rules the engine must encode** (`Design.MD` D2, D2d, D2e, D2f, D3, D6, D7, D8):

1. An item is available when every Dependency is met: a depended-on item is `done` (a Failed Outcome counts as done), a depended-on Container is complete, a depended-on Timer has fired.
2. Status: locked → `not-started`. Available → `action-required` when the current Action's owner is the starter, otherwise `in-progress`. Terminal → `done`, `skipped`, `cancelled`.
3. A Container is complete when every **mandatory** item inside it is `done`. Optional items never hold it up.
4. A Timer fires when `today >= anchorDate + offsetDays`. Negative offsets only against the Start date. Moving the Anchor moves the Timer. A Reminder is skipped when the item it is about is already done.
5. A Hard Stop raises a Needs decision; it never acts alone. On Confirm its targets become `cancelled` and unlock nothing. Extend moves the deadline Timer by `extendDays` (default 7). Dismiss records a reason and proceeds.
6. A Stage never holds work back. It groups and labels only.
7. Journey Duration runs from `availableSince` to `doneAt`. The Usual Range is the interquartile range of that Journey version's `history`. Past the top of the range, `overdue` is true and a Line Manager Task is raised.
8. `personStatus`: `joiner` before the Start date, `starter` Day 1 to Day 30, `onboarded` from Day 30. `dayNumber` counts the Start date as Day 1.
9. Current Stage is `pre-contract` until Contracting is done, then derived from `dayNumber` against the `Design.MD` D8 table.

### 4.3 API contract

Every route validates with zod and returns `{ ok: true, data }` or `{ ok: false, error: string }`. Errors go through `src/lib/apiHandler.ts`.

| Method and route | Body | Returns | Owner |
| --- | --- | --- | --- |
| `GET /api/state?personId=&as=` | — | `{ engineState, person, simulatedDate, personas }` | A, then C1 |
| `POST /api/actions` | `{ itemId, actionId, value?, actorPersonId }` | updated `engineState` | C1 |
| `POST /api/clock` | `{ set?: ISODate, advanceDays?: number }` | `{ simulatedDate }`, forward only | C2 |
| `POST /api/simulate` | `{ itemId, actionId, result }` | updated `engineState` | C2 |
| `POST /api/reset` | — | `{ ok: true }`, reseeds | C2 |
| `POST /api/apply` | `{ pathwayId, personId }` | `{ appliedPathwayId }` | C2 |
| `POST /api/additions` | `{ personId, journeyId, unlock, mandatory, byPersonId }` | updated `engineState` | C3 |
| `POST /api/hard-stops/:id/decision` | `{ decision, reason?, extendDays? }` | updated `engineState` | C3 |
| `GET` / `POST /api/journeys` | Journey draft | library list, published Journey | C4 |
| `PUT /api/pathways/:id`, `POST /api/pathways/:id/publish` | draft contents | saved draft, `{ version }` | D2 |

`as` is `starter`, `delegate`, `line-manager` or `buddy` and **filters on the server**: a Buddy never receives Blocked Flags, Choose values, Outcomes or Needs decisions; a starter never receives Blocked Flags or Needs decisions; a Delegate receives what the starter receives plus an `actingFor` name.

`src/lib/useLiveState.ts` polls `GET /api/state` every 3000 ms, pauses when `document.visibilityState !== 'visible'`, and exposes `{ state, loading, refresh }`. Mutations call `refresh()` immediately so the acting face never waits for a poll.

### 4.4 Loop detection, written verbatim in wave A

```ts
// src/engine/loops.ts
import type { PathwayItem } from './types';

/** Refuses a Dependency that would make a loop, naming the Journeys on it. */
export function wouldCreateLoop(
  items: PathwayItem[],
  fromItemId: string,
  toItemId: string,
  titleOf: (itemId: string) => string
): { loops: true; throughTitles: string[] } | { loops: false } {
  if (fromItemId === toItemId) return { loops: true, throughTitles: [titleOf(fromItemId)] };

  // Edges run dependency -> dependent. Adding `from` as a Dependency of `to`
  // loops when `from` is already reachable from `to`.
  const dependents = new Map<string, string[]>();
  for (const item of items) {
    for (const dep of item.dependsOn) {
      if (dep.kind !== 'item') continue;
      const list = dependents.get(dep.itemId) ?? [];
      list.push(item.id);
      dependents.set(dep.itemId, list);
    }
  }

  const path: string[] = [];
  const seen = new Set<string>();
  const walk = (at: string): boolean => {
    if (at === fromItemId) { path.push(at); return true; }
    if (seen.has(at)) return false;
    seen.add(at);
    path.push(at);
    for (const next of dependents.get(at) ?? []) if (walk(next)) return true;
    path.pop();
    return false;
  };

  return walk(toItemId)
    ? { loops: true, throughTitles: path.map(titleOf) }
    : { loops: false };
}
```

---

## 5. Design tokens and direction

### 5.1 The idea

Two faces, one palette, opposite densities. The **Admin Portal is an instrument**: dense, structural, hairline rules, Racing Green chrome. The **Starter Preview is correspondence**: one column, generous spacing, few words, warm. The Manager and Buddy view borrows the preview's shell.

Spend the boldness in one place: **the Usual Range band on the starter's waiting card**. It is the only custom data visualisation in the build, and it answers "what does honest progress look like when there is no news". Everything around it stays quiet.

### 5.2 Colour

```css
/* src/ui/tokens.css */
:root {
  --racing:   #024731;  /* premium, refined moments */
  --heritage: #006A4D;  /* continuity and trust */
  --everyday: #11B67A;  /* everyday, familiar, pragmatic */
  --vibrant:  #6CF479;  /* energy, used sparingly */
  --calm:     #C7FFC6;  /* calm and sensitive */
  --ink:      #000000;  /* typography */
  --charcoal: #323233;  /* premium, secondary surfaces */
  --paper:    #FFFFFF;  /* white space */

  /* derived neutrals, the only values not in the brand palette */
  --paper-2:  #F6F8F6;  /* canvas and lane fill */
  --hairline: #E3E7E4;  /* 1px rules and card borders */
  --muted:    #5B5F5C;  /* secondary text, 6.5:1 on paper */
}
```

Declare the eight brand colours in an `@theme` block in the same file so Tailwind generates utilities.

| Token | On `--paper` | Use for |
| --- | --- | --- |
| `--racing` 10.8:1 | yes | headings, portal rail, Done bar |
| `--heritage` 6.6:1 | yes | links, primary buttons with white text, In progress bar |
| `--everyday` 2.6:1 | **never as text on white** | fills, canvas Dependency edges, bars; black text when used as a surface |
| `--vibrant` | **never as text on white** | one accent at a time: selected card ring, Action required bar, the live-update pulse, text on `--ink` |
| `--calm` | **never as text** | the waiting card and complete-Container surfaces, with black text |
| `--charcoal` | yes | Cancelled fill with white text, portal secondary surfaces |

### 5.3 Status without red or amber

The palette has no alarm colour and we are not adding one. Severity is carried by **darkness and weight, never hue**, and every state also carries a word and a shape, which is better for colour-blind users anyway.

| State | Treatment |
| --- | --- |
| Not started | paper, 1px `--hairline`, title `--muted`, no left bar, closed padlock |
| In progress | 3px left bar `--heritage` |
| Action required | 3px left bar `--vibrant`, title `--ink` at 600 |
| Blocked Flag (HR and Line Manager only) | 3px dashed left bar `--everyday` |
| Done | 3px left bar `--racing`, title `--muted`, tick |
| Skipped | 1px dotted `--hairline`, no bar, "Not for me" |
| Cancelled | `--charcoal` fill, paper text, "Stopped" |
| Needs decision | `--ink` surface, paper text, `--vibrant` dot, Confirm / Extend / Dismiss |

### 5.4 Type

One superfamily, two roles. **IBM Plex Sans** everywhere, **IBM Plex Serif** for the Starter Preview's Stage headings and the waiting card's lead line only. Load both through `next/font/google` so they self-host and the demo does not depend on venue wifi.

- Portal: base 15px, scale 1.2 (15 / 18 / 21.6 / 26 / 31), line height 1.45, labels 13px.
- Phone faces: base 17px, scale 1.25 (17 / 21 / 27 / 33), line height 1.55, measure capped at 62 characters.
- Sentence case throughout. **No all-caps labels, no eyebrow labels above headings, no `·` separators, no arrows in button text.** Buttons say what happens: "Publish", "Apply pathway", "Add a journey", "Got it".

### 5.5 Layout

**Admin Portal** (`/portal`), 1280px minimum, no phone layout.

```
+--------------------------------------------------------------+
| ink strip: Simulated date 10 Nov 2026 | persona | Demo controls|
+------+-------------------------------------------------------+
|racing| Pathway: Branch colleague  v3   [Save draft] [Publish] |
| rail +-------------------------------------------------------+
|      | Library  | Pre-contract | Pre-employment | Onboarding  |
| Jrn  | [search] |  +--------+  |   +--------+   |  +-------+  |
| Pth  | [ card ] |  |Contract|--|-->|Payroll |   |  |Branch |  |
| Ppl  | [ card ] |  +--------+  |   +--------+   |  +-------+  |
|      | [ card ] |              |  ,--Cleared--. |             |
|      |          |              |  | [..] [..] | |             |
+------+----------+--------------+--`-----------'-+-------------+
```

Stage lanes are vertical columns alternating `--paper` and `--paper-2`, separated by 1px `--hairline`, Stage name top left in `--muted` 13px. Containers are a 12px-radius dashed `--heritage` outline with the label on the top edge. Journey cards are 6px radius, buttons 4px. **Radius varies by hierarchy on purpose; do not unify it.** One shadow only, on the dragged card.

**Starter Preview** (`/me`), 420px max width, centred, `--paper`.

```
+--------------------------+
| Simulated date 10 Nov    |   ink strip, 12px
+--------------------------+
| Getting ready            |   serif 27px, --racing
| Day 18 of your wait      |   --muted 15px
+--------------------------+
| +----------------------+ |
| | Pre-employment checks| |   calm surface, the waiting card
| | We are checking your | |
| | documents. Nothing   | |
| | needed from you.     | |
| |                      | |
| | |-----[####]-------| | |   the Usual Range band
| |  0    21  35     day | |
| | Usually 21 to 35 days| |
| +----------------------+ |
| Contracting         done |
| Payroll    action required|
+--------------------------+
```

The Usual Range band is a rule of day ticks: the interquartile band filled `--everyday` at 30% opacity, today a 2px `--racing` marker, the label in plain English underneath. Past the range the marker turns `--charcoal` and the line reads "This is taking longer than usual. Your manager knows and will be in touch."

**Manager and Buddy view** (`/team`), same shell: starters with current Stage, next Container, and the viewer's own open Tasks grouped underneath.

### 5.6 Quality floor

Visible keyboard focus (`2px solid var(--vibrant)`, 2px offset), `prefers-reduced-motion` respected, touch targets at least 44px on the phone faces, text contrast at least 4.5:1, no motion except the live-update pulse and the drag. The Simulated date strip appears on all three faces (`Design.MD` D13 rule 5).

---

## 6. File ownership

This is what makes four concurrent agents safe. No file appears twice in this table.

| Task | Owns |
| --- | --- |
| **A1** | everything created in wave A: config, `src/engine/{types,loops,fixtures}.ts`, `src/ui/tokens.css`, `src/lib/*`, `app/layout.tsx`, `app/api/state/route.ts`, route stubs, plus the "Wave A began at" line in `BUILD-PLAN.md` |
| **B1** engine | `src/engine/**` except `types.ts`, `loops.ts`, `fixtures.ts` |
| **B2** data | `src/db/**`, `src/adapters/**` |
| **B3** preview | `app/me/**`, `src/ui/components/starter/**` |
| **B4** canvas | `app/portal/pathways/[id]/**`, `src/ui/components/canvas/**` |
| **C1** API | `app/api/state/route.ts`, `app/api/actions/**`, `src/lib/apiHandler.ts` |
| **C2** people | `app/portal/people/**`, `src/ui/components/demo-controls/**`, `app/api/{clock,simulate,reset,apply}/**`, `app/portal/layout.tsx` |
| **C3** team | `app/team/**`, `src/ui/components/team/**`, `app/api/additions/**`, `app/api/hard-stops/**` |
| **C4** builder | `app/portal/journeys/**`, `app/portal/pathways/page.tsx`, `app/api/journeys/**` |
| **D1** chains | `src/engine/**`, `src/db/seed.ts`, `app/me/**` (fixes and anything wave B cut, with a test each) |
| **D2** persistence | `app/api/pathways/**`, `app/portal/pathways/[id]/**` |
| **E1** freeze | `README.md`, `docs/decisions.md`, anything a fix requires |

---

## 7. The waves

### Wave A — Contract · T+0 → T+12 · one agent, sonnet · skills: `ponytail`

**Task A1 · Scaffold, tokens, contract, fixtures**

> Most of this is transcription from `BUILD-PLAN.md`, not design. Copy the given code exactly; do not improve it.
>
> 1. `npx create-next-app@latest . --typescript --tailwind --app --eslint --no-src-dir --import-alias "@/*"`, then add `drizzle-orm`, `better-sqlite3`, `@xyflow/react`, `zod`, `vitest`, `@vitejs/plugin-react`, `@testing-library/react`, `tsx`. Lockfile committed.
> 2. `"strict": true` in `tsconfig.json`. Scripts: `"check": "tsc --noEmit && eslint . && vitest run"`, `"test": "vitest"`, `"seed": "tsx src/db/seed.ts"`.
> 3. Create the layout in section 4.1. Files not yet implemented get a one-line `// implemented in wave <X>` comment, so no later agent guesses a path.
> 4. `src/engine/types.ts` **verbatim from section 4.2**. The three function signatures go in `computeState.ts`, `availability.ts` and `loops.ts`; the first two throw `new Error('not implemented')`.
> 5. `src/engine/loops.ts` **verbatim from section 4.4**. This is real, working code, not a stub: two later tasks depend on it (decision B17).
> 6. `src/ui/tokens.css` **verbatim from section 5.2**, imported in `app/layout.tsx`, with an `@theme` block for the eight brand colours. Wire IBM Plex Sans and IBM Plex Serif through `next/font/google` as `--font-sans` and `--font-serif`.
> 7. `src/lib/clock.ts` (reads and writes the Demo clock; the only runtime place `new Date()` is allowed), `src/lib/log.ts`, `src/lib/persona.ts` (a `persona` cookie, default `A`), `src/lib/useLiveState.ts` exactly as section 4.3 describes.
> 8. **`src/engine/fixtures.ts`**: a hand-written `demoState: EngineState` for Persona A mid-story — Contracting `done`, Payroll `action-required`, Pre-employment checks `in-progress` with `blockedFlag: true`, `waitingDays: 18`, `usualRange: [21, 35]` and a "while you wait" message, ID creation `not-started`, the "Cleared to start" Container incomplete, one Pulse check behind a Timer. Every Journey Status value must appear at least once so the UI tasks can style all of them. Synthetic names only.
> 9. **`app/api/state/route.ts`**: returns `{ ok: true, data: { engineState: demoState, person, simulatedDate: '2026-11-10', personas } }`. Wave C1 replaces the internals; the shape must not change (decision B16).
> 10. Stub `/portal`, `/me`, `/team` pages, each showing the Simulated date strip and the current persona. `.env.example` with `DATABASE_URL="file:./launchpad.db"`. `.gitignore` adds `*.db` and `.env`.
> 11. Write the real clock time into the "Wave A began at" line at the top of `BUILD-PLAN.md`.
>
> **Done when:** `npm run check` green; `npm run dev` serves all three routes; `curl localhost:3000/api/state` returns the fixture; `src/engine/types.ts` and `loops.ts` match sections 4.2 and 4.4 exactly.
> **Time box:** 12 minutes. **STOP:** if `better-sqlite3` will not build, switch to `node:sqlite` behind the same `src/db/queries.ts` interface, record the decision, continue. No native-module debugging.
> **Commit:** `Scaffold the app, design tokens, engine contract and demo fixtures`

---

### Wave B — Four tracks at once · T+12 → T+57 · skills: `ponytail`, plus `frontend-design` on B3 and B4

**Task B1 · Pathway engine and Vitest tests** · opus · owns `src/engine/**` except types, loops, fixtures

> Implement the engine against `src/engine/types.ts`. Pure functions only: no React, no Next, no Drizzle, no `new Date()`. `computeState` is the single entry point. `wouldCreateLoop` already exists in `loops.ts`; do not rewrite it.
>
> Implement rules 1 to 9 in `BUILD-PLAN.md` section 4.2 exactly, and `resolveTimerDate`.
>
> Vitest tests in `src/engine/__tests__/`, named "what, when, expected", at least one per rule and one per row here:
> - a Pathway Item with an unmet Dependency is `not-started`
> - a Pathway Item whose current Action is the starter's is `action-required`
> - a Pathway Item on a Hidden automation is `in-progress` and raises the Blocked Flag
> - a Container with an optional item pending is complete
> - a Container with a mandatory item pending is not complete
> - a Timer at minus 7 days against the Start date fires on the right day
> - a Timer anchored to an item that moves, moves with it
> - a Reminder about an item already done is not raised
> - a Failed Outcome counts as done for Journey Duration
> - a confirmed Hard Stop cancels its targets and unlocks nothing downstream
> - an unconfirmed Hard Stop changes nothing
> - Extend moves the deadline Timer by 7 days
> - a wait past the top of the Usual Range is overdue and raises a Line Manager Task
> - a Choose answer at or below `flagAtOrBelow` raises a Line Manager Task
> - a Stage does not hold back an item with no unmet Dependencies
> - `dayNumber` and `personStatus` across Day 1, Day 14 and Day 30
>
> Fixtures for tests go in `src/engine/__tests__/fixtures.ts`, modelled on the Branch colleague Pathway in `SEED-DATA.md` section 4. Do not edit `src/engine/fixtures.ts`; the UI tasks are using it right now.
>
> **Done when:** `npx vitest run` passes with at least 20 tests; `grep -rE "react|next|drizzle" src/engine/` returns nothing.
> **Time box:** 45 minutes. **STOP:** drop Hard Stop `on-deadline` first, then Reminders. Never drop Dependencies, Containers, Status or Journey Duration.
> **Commit:** `Add the Pathway engine with Vitest tests`

**Task B2 · Database, seed data and mocked adapters** · sonnet · owns `src/db/**`, `src/adapters/**`

> `src/db/schema.ts` in Drizzle: `persons`, `journeys` (versioned), `actions`, `pathways`, `pathwayVersions`, `pathwayItems`, `containers`, `timers`, `hardStops`, `appliedPathways` (snapshot JSON of the published `PathwaySnapshot` plus `personId` and `appliedOn`), `actionProgress`, `itemOverrides`, `hardStopDecisions`, `durationHistory`, `demoClock` (one row), `notes`. Snapshot columns store the engine's own JSON shapes so no mapping layer is needed.
>
> `src/db/queries.ts` exposes what the API needs, including **`buildEngineInput(personId): EngineInput`**, which assembles the engine's input in one place. Wave C1 depends on this name.
>
> `src/db/seed.ts` seeds everything in `SEED-DATA.md` with `DEMO_T = '2026-11-10'` (B9): the five fixed tag lists; the three personas with Line Managers, Buddies and Delegate from section 2, placeholder names kept (B10); all 18 library Journeys with Actions in order from section 3; the three published Pathway templates from section 4 including the "Cleared to start" Container, the Payroll Reminder Timer, both Hard Stops and the Day 14 and Day 30 Pulse check Timers; the Applied Pathways and Additions in section 5; and generated history per B12 — 20 synthetic prior starters per Pathway from a seeded pseudo-random function, tuned so Pre-employment checks has a Usual Range of 21 to 35 days.
>
> Seed Persona A partway through, matching `src/engine/fixtures.ts`: Contracting done, Pre-employment checks waiting on its Hidden automation for 18 days. B and C start at the beginning.
>
> `src/adapters/`: `WorkdayAdapter` (fetches a delivery address, never stored), `VettingAdapter`, `ItProvisioningAdapter`, `MerchAdapter` — each an interface plus a mock returning pending until Demo controls simulates a result.
>
> **Done when:** `npm run seed` builds the database from empty; `buildEngineInput('person-a')` returns a valid `EngineInput`; reseeding twice gives identical data; every name, address and date is synthetic.
> **Time box:** 45 minutes. **STOP:** at 40 minutes drop Journeys 13, 14, 16 and 18 (B11) and commit.
> **Commit:** `Add the database schema, synthetic seed data and mocked adapters`

**Task B3 · Starter Preview** · opus · skills `ponytail`, `frontend-design` · owns `app/me/**`, `src/ui/components/starter/**`

> Build `/me` to section 5.5, mobile first at 390px. **Use `useLiveState` against `/api/state` from the start** — it already returns the fixture, and wave C swaps the data behind it with no change here (B16).
>
> Content: the Simulated date strip; the current Stage in the friendly label from `Design.MD` D8 as a serif heading; Journeys grouped by Stage with the status treatments in section 5.3; a "what's next" line from `engineState.nextUp`; and the waiting card with the Usual Range band for any item carrying a Blocked Flag, showing the "while you wait" message and never the Blocked Flag itself.
>
> Interactive, posting to `POST /api/actions` (that route arrives in wave C; call it and handle a 404 quietly until then): Read takes "Got it"; a starter's Task ticks; Choose shows options; Provide submits a form and keeps only a receipt line ("Submitted 10 Nov"), never the content (`Design.MD` D3a). An optional Journey offers "Not for me", recording Skipped.
>
> Copy is plain and calm. No jargon, no "required" label on mandatory Journeys, no progress percentages. The honest line for an overdue wait is in section 5.5. The Usual Range band is the one bold element on this face; keep everything around it quiet.
>
> **Done when:** at 390px every Journey Status renders per section 5.3; the waiting card shows Day 18 inside a 21 to 35 band; polling refreshes without a reload; keyboard focus visible; touch targets at least 44px.
> **Time box:** 45 minutes. **STOP:** the waiting card, Read and Task must work. Choose and Provide can slip to wave D.
> **Commit:** `Add the Starter Preview with the honest-progress waiting card`

**Task B4 · Pathway builder canvas** · opus · skills `ponytail`, `frontend-design` · owns `app/portal/pathways/[id]/**`, `src/ui/components/canvas/**`

> Build the canvas with React Flow to `Design.MD` D2a-i and section 5.5. **Hold the Pathway in local React state this wave**; wave D2 adds persistence. Seed the initial state from `src/engine/fixtures.ts`.
>
> 1. **Library panel** left: Journey cards with title, Stage and tags, search and tag filters. Drag a card onto the canvas to create a Pathway Item.
> 2. **Stage lanes**: four vertical lanes in `Design.MD` D8 order as the background. A dropped card snaps into its Journey's Stage lane. A card cannot be dragged to another lane, because a Journey has exactly one Stage.
> 3. **Dependencies**: drag from the dot on a card's right edge to another card. Call `wouldCreateLoop` from `src/engine/loops.ts` **before** connecting. If it loops, refuse and show a plain-English message naming the two Journeys — "Payroll already waits for Contracting, so Contracting cannot wait for Payroll." No jargon, no stack trace.
> 4. **Side panel** on click: a Mandatory toggle and "Remove from pathway". Mandatory shows as a padlock on the card.
> 5. **Containers, Timers and Hard Stops render read-only** (B4): the Container a dashed `--heritage` outline with its label, the Timer a small card reading "7 days before start date", the Hard Stop a `--charcoal` card. Movable, not editable.
> 6. **Pathway tags** from the fixed lists in a header control.
> 7. Header has Save draft and Publish buttons, wired to local state this wave and to the API in wave D2.
>
> This is the USP (ADR-0003). It gets the most build time of any single task; spend it on the drag, the connect and the refusal message feeling obvious to a non-technical HR Partner.
>
> **Done when:** a Journey drags from the library into its lane; a Dependency connects; a loop is refused with a named, jargon-free message; Mandatory toggles and shows a padlock; the fixture's Container and Hard Stop render.
> **Time box:** 45 minutes. **STOP:** priority order if cutting — lanes and drag-on, then Dependencies with loop refusal, then the side panel, then read-only blocks, then tags.
> **Commit:** `Add the drag-and-drop Pathway builder canvas`

**Wave B gate:** `npm run check` green, four commits pushed. If B1 is red, wave C does not start.

---

### Wave C — Four tracks at once · T+57 → T+82 · skills: `ponytail`, plus `frontend-design` on C3

**Task C1 · Real state API** · sonnet · owns `app/api/state/route.ts`, `app/api/actions/**`, `src/lib/apiHandler.ts`

> Replace the fixture inside `app/api/state/route.ts` with `buildEngineInput(personId)` then `computeState`. **The response shape does not change** (B16). Add `POST /api/actions`.
>
> Apply the `as` filter on the server, per section 4.3. Filter in the route, never in a component.
>
> Validate bodies with zod. Route every error through `src/lib/apiHandler.ts`, which catches, logs via `src/lib/log.ts` and returns `{ ok: false, error }`.
>
> **Done when:** `/me` shows real seeded data with no change to `app/me/**`; a Buddy response contains no Blocked Flag, Outcome or Needs decision; three Vitest tests cover the filter.
> **Time box:** 25 minutes. **STOP:** `/api/state` matters more than `/api/actions`; if cutting, ship state and leave actions to wave D.
> **Commit:** `Serve real engine state from the API with role filtering`

**Task C2 · People, apply a Pathway, Demo controls** · sonnet · owns `app/portal/people/**`, `src/ui/components/demo-controls/**`, `app/api/{clock,simulate,reset,apply}/**`, `app/portal/layout.tsx`

> `/portal/people` lists the three personas with current Stage and Applied Pathway. `/portal/people/[id]` shows the person, their Applied Pathway grouped by Stage with each Journey Status, the HR To-do list (Tasks owned by HR, B8), any Needs decision, and **Apply a pathway**: filter the Pathway library by that person's job family, role, grade, platform and location, pick one, apply. Applying snapshots the live version (ADR-0002) and creates the Applied Pathway.
>
> **Demo controls** in the Admin Portal header, never on the phone faces (`Design.MD` D13): the Simulated date; per-persona quick jumps for Offer accepted, plus 3 weeks, Day 1, Day 14, Day 30; plus 1 day and plus 1 week; **Simulate Passed / Failed / Returned** on any waiting Hidden automation, Passed and Failed only where the automation sets the Outcome; and **Reset demo**. The clock moves forward only and rejects a backward move in plain English. Moving it recomputes state, so everything due fires in date order on the next read; no scheduler is needed.
>
> **Done when:** applying "Software engineer" to Persona B gives a visibly different pack on `/me` from Persona A's; Simulate Passed on A's vetting unlocks ID creation within 3 seconds on the phone; Reset returns everything to seeded state.
> **Time box:** 25 minutes. **STOP:** Reset and Simulate are non-negotiable. Quick jumps may fall back to plus 1 day and plus 1 week only.
> **Commit:** `Add people pages, applying a Pathway and the Demo controls`

**Task C3 · Manager and Buddy view with Add a Journey** · opus · skills `ponytail`, `frontend-design` · owns `app/team/**`, `src/ui/components/team/**`, `app/api/additions/**`, `app/api/hard-stops/**`

> Build `/team` on the same mobile shell as `/me` (`Design.MD` D5).
>
> **Line Manager**: their starters with current Stage, Containers complete and next Container; the Blocked Flag with its reason; the starter's Choose results; Needs decision alerts. They tick their own Tasks from a To-do list across all their starters, override a Journey to Done with a recorded reason except where it declares an Outcome, send the starter a note, and **Add a Journey** (B2): tap "Add a journey" on a starter, pick from the library filtered by Journey tags (B7), choose unlock **Now** or **After [a card]**, choose mandatory or optional with optional the default, confirm. It appears on the Applied Pathway labelled "Added by [name]" for everyone, removable by its author before it starts.
>
> **Buddy**: current Stage and Containers only, their own Tasks, the note box. Never Blocked Flags, Choose results or check results. The server filters this; do not rely on hiding in the component.
>
> **Needs decision**: Confirm, Extend (+7 days, B5) or Dismiss, each recording a reason.
>
> **Done when:** Persona B's Line Manager adds the Payments squad access package and it appears on B's `/me` within 3 seconds; a Buddy's response and screen contain no Blocked Flag; a confirmed Needs decision shows the stopped Journeys as Cancelled.
> **Time box:** 25 minutes. **STOP:** Add a Journey is the priority — it completes the headline move. Notes and the override can go.
> **Commit:** `Add the Manager and Buddy view, Additions and Needs decision`

**Task C4 · Journey builder and the libraries** · sonnet · owns `app/portal/journeys/**`, `app/portal/pathways/page.tsx`, `app/api/journeys/**`

> `/portal/journeys` — the Journey library: a table of published Journeys with title, owner team, Stage, tags, version, "Applied N times" and skip rate. Search and tag filters. "New journey".
>
> `/portal/journeys/[id]` — the Journey builder (`Design.MD` D3 rule 5): a laptop form with header fields (title, description, owner team, Stage, the five tags from the fixed lists, declares an Outcome, "while you wait" message) and a drag-to-reorder Action list. Adding an Action picks one of the six types in `GLOSSARY.md` and shows only that type's fields: owner for Task and Notification; options and "flag answers at or below" for Choose; "Starter only" for Provide and Choose; "sets the Outcome" for Hidden automation. Publish posts to `POST /api/journeys` and adds a version.
>
> `/portal/pathways` — the Pathway library: published Pathways with tags, live version, "Applied N times", a tag filter, linking to the canvas.
>
> `--paper` surfaces, `--hairline` rules, 13px labels, sentence case. Tables, not cards: this is an instrument.
>
> **Done when:** a Journey can be created with four ordered Actions and published, then appears in the library and can be dragged onto the canvas; filters work; seeded Journeys list with correct Stages and tags.
> **Time box:** 25 minutes. **STOP:** the builder form matters more than the library pages. If cutting, make the libraries plain filtered tables with no counts.
> **Commit:** `Add the Journey builder and the Journey and Pathway libraries`

**Wave C gate:** `npm run check` green, four commits pushed, `/me` running on a real phone.

---

### Wave D — Integration · T+82 → T+102 · two agents · skills: `ponytail`

**Task D1 · Chains and the Hard Stop, end to end** · opus · owns `src/engine/**`, `src/db/seed.ts` for fixes

> Run the three chain reactions in `Design.MD` D10 and confirm each fires: Manager ready (Line Manager Task → Hidden automation → Notification to the starter); "Cleared to start" complete unlocking Meet your buddy with its Notification and Buddy Task; a Pulse check answer of 2 or lower raising a Line Manager Task.
>
> Then the Hard Stop path (B5): Simulate Failed on Persona A's Pre-employment checks raises a Needs decision for HR in the Admin Portal and the Line Manager in `/team`, never the Buddy or starter. While pending, the Starter Preview does not change. After Confirm, stopped items show Cancelled and the starter sees only that their recruiter will be in touch.
>
> Fix whatever these paths expose, **with a Vitest test for each fix**. If a fix belongs in a file you do not own, leave a `// NEEDS:` note and report it.
>
> **Done when:** all three chains and the Hard Stop run end to end on the local build, each verified on a phone; new tests cover every fix.
> **Time box:** 20 minutes. **STOP:** chain 1 and the Hard Stop matter most; chain 3 needs only the Day 14 Pulse check Timer.
> **Commit:** `Wire the chain reactions and the Hard Stop end to end`

**Task D2 · Canvas persistence** · opus · owns `app/api/pathways/**`, `app/portal/pathways/[id]/**`

> Add `PUT /api/pathways/:id` (save draft) and `POST /api/pathways/:id/publish` (new live version), then wire the canvas to them: Save draft on a 1-second debounce after any change, Publish showing the new version number. Nothing reaches starters until published. Load the real Pathway from the database instead of the fixture, restoring card positions.
>
> Anything B4 cut for time comes back here, in B4's priority order.
>
> **Done when:** a Pathway can be edited, saved, reloaded with positions intact, and published; a published change reaches a newly applied starter and not an existing one (ADR-0002).
> **Time box:** 20 minutes. **STOP:** publish matters more than debounced autosave; an explicit Save draft button is an acceptable fallback.
> **Commit:** `Persist and publish Pathways from the canvas`

---

### Wave E — Freeze preparation · T+102 → T+127 · one agent, opus · skills: `ponytail`, `security-review`

**Task E1 · Harden, document, walk the demo, push**

> 1. **Run the `security-review` skill** over the diff. Resolve or record every finding.
> 2. `npm run check` green. `npm audit` clean of high and critical, or each exception noted in `docs/decisions.md`.
> 3. `grep -rn "console.log\|new Date()\|any" src app` and resolve every hit outside the two allowed places.
> 4. `grep -rniE "lloyds|@.*\.com" src app` to confirm nothing non-synthetic reached the repo. Confirm `.env` is ignored and no tenant or subscription ID appears anywhere.
> 5. Rewrite `README.md`: team name, what the product does in three sentences, which part of the challenge it tackles, how to run it (`npm install && npm run seed && npm run build && npm start`, then `http://<laptop-ip>:3000/me` from a phone on the same wifi), the three faces and their routes, how to run the tests, and a **"What is simulated"** section listing every omission from `Design.MD` D15 plus decisions B1, B3 and B4. Mentors ask "what is simulated or unfinished" — answer it in writing first.
> 6. Walk the whole demo on a real phone and a laptop: apply both Pathways, flip personas, add a Journey live, move the clock to Day 14, answer a Pulse check with 2, simulate a Failed vetting, confirm the Hard Stop, reset. Fix what breaks; record what you cannot fix in the README.
> 7. Push to the fork and confirm on GitHub, not just locally.
>
> **Done when:** a clean clone runs the demo from the README alone; every step 6 item works or is a listed known gap; the fork shows the final commit.
> **Time box:** 25 minutes. **STOP:** documentation of a gap beats a rushed fix.
> **Commit:** `Prepare the build for freeze: security review, README and demo walkthrough`

---

### Stretch · only once wave E is green · stop at 12:58 whatever the state

One at a time, committing each. Abandon anything not green.

1. Timer and Hard Stop authoring on the canvas (lifts B4).
2. An insight strip on the Pathway library: Journey Duration, Usual Range, skip rate (lifts B3).
3. Delegate for Persona C: the "Acting for" banner, Starter only Actions shown as "Waiting for [starter]", "Done by [Delegate] for [Starter]" attribution.
4. The scripted assistant on `/me`: "Need help?", three tappable questions, pre-written answers, a real handover raising a Line Manager Task.
5. Rehearse the demo against section 9 until it runs clean twice.

---

## 8. If you are behind

Check the offset at every gate. If a wave runs over, do not absorb it into the next one; cut from here, top first.

1. The Journey builder form (C4) — seeded Journeys ship as data, so the demo never depends on building one live.
2. The library pages become plain tables with no counts.
3. Chains 2 and 3 (D1), keeping chain 1 and the Hard Stop.
4. The Buddy half of `/team`, keeping the Line Manager.
5. Choose and Provide on `/me`, keeping Read and Task.

Never cut: the engine and its tests, the seed data, the canvas with Dependencies and loop refusal, applying a Pathway, the Starter Preview, Demo controls with Reset, the README.

---

## 9. What "complete" means

Complete when, on a phone and a laptop on the same wifi, with no code changes:

1. HR opens the Pathway builder, drags Journeys onto Stage lanes, draws a Dependency, is refused a loop in plain English, sets one mandatory, and publishes a version.
2. HR filters the Pathway library and applies "Branch colleague" to Persona A and "Software engineer" to Persona B.
3. Two phones side by side show two different packs built from the same library Journeys.
4. Persona B's Line Manager adds their team's access package Journey and it appears on B's phone within three seconds, labelled "Added by".
5. Persona A's phone shows the honest waiting card: Day 18 against a usual 21 to 35 days, nothing needed from them.
6. Demo controls simulate a Failed vetting; HR and the Line Manager get a Needs decision; the starter's view does not change until it is confirmed.
7. The clock moves to Day 14, the Pulse check appears, a score of 2 raises a Task on the Line Manager's phone.
8. Reset demo returns everything to the start.
9. `npm run check` is green and everything is pushed to the fork.
