# New-joiner companion

The LaunchPad '26 companion that takes a new joiner from unconditional offer to feeling connected and confident by Day 30. The whole onboarding journey is modelled, with the core concept as the focus. The demo leads with the internal orchestration side: the back end and pathway-building logic, with a front end over them (journey builder and library, pathway builder, observability). It is one web app with three faces: the Onboarding Studio (laptop-first), the Starter Preview (mobile) and the Manager and Buddy view (mobile). Changes made in the Onboarding Studio show up live in the mobile faces. Internal systems are mocked with synthetic data behind an interface. See ADR-0003.

## Language

**Journey**:
A reusable, versioned template for one unit of onboarding work, such as Vetting or Device onboarding: a discrete, self-contained set of instructions. A Journey never refers to other Journeys and holds no dependencies or ordering; that logic belongs to the Pathway. Built and published by a journey owner. Tagged with job family, role, grade, platform and location so HR Partners and Line Managers can browse and filter the library. Tags never select Journeys automatically. Tag values come from fixed lists maintained by HR, not free text.
_Avoid_: Journey block, journey package, step

**Action**:
One instruction inside a Journey. A Journey is an ordered list of Actions, each of one type:
- **Read**: an info card the starter acknowledges.
- **Notification**: a message sent to a chosen person; done as soon as it is sent. How chain reactions happen.
- **Task**: one thing for one named owner (Starter, Line Manager, Buddy or HR) to do and tick off.
- **Hidden automation**: a call to a mocked internal system behind an interface, never shown to the starter. Can set the Journey's Outcome.
- **Choose**: the starter picks from options. The choice is kept with, and used only by, the Journey that asked; the Line Manager can see it. Journeys never share data with each other. A Choose can have a "flag answers at or below" setting: an answer at or below it creates a Task for the Line Manager.
- **Provide**: the starter fills in a form or uploads something. The content is passed on to the system of record and not kept in the app; the app keeps only the fact that it was submitted.
_Avoid_: Step, activity

**To-do list**:
A person's roll-up of the open Tasks they own, across every Journey and every starter they are involved with. A view, not something a journey owner builds.
_Avoid_: Checklist, backlog, inbox

**Pulse check**:
A library Journey that asks the starter how connected and how confident they feel, each scored 1 to 5, and tells them their answers go to their Line Manager. Placed on a Pathway twice, unlocked by Timers at Day 14 and Day 30. A score of 2 or lower creates a Task for the Line Manager. Scores are seen only by the Line Manager, never the Buddy, and are rolled up by Pathway version to show whether a Pathway actually works.
_Avoid_: Survey, feedback form, NPS

**Pathway**:
A template built and published by an HR Partner for a kind of starter, such as "Branch colleague" or "Software engineer". It arranges library Journeys as Pathway Items and holds all the logic between them: which depend on which (Dependencies), Containers, Timers, Hard Stops, and which are mandatory. Journeys with no unmet Dependencies can run at the same time, so one rule gives both sequence and parallel work. Tagged with job family, role, grade, platform and location so HR can find the right one for a new starter; tags never select a Pathway automatically. Each Pathway has one live version, the only one that can be applied, plus a recorded version history and a count of how many times it has been applied. Only its owner publishes a new live version. Applying a Pathway snapshots the live version, so later changes reach only starters it is applied to afterwards (ADR-0002). Once applied, no one can change or remove its items for that starter; if a starter needs something different, HR builds and publishes a different Pathway.
_Avoid_: Flow, process, plan

**Pathway Item**:
One Journey's place in a Pathway. Carries everything about how that Journey is used there: its Dependencies, the Container it sits in (if any), and whether it is mandatory. The same Journey can sit in many Pathways with different Pathway Items.
_Avoid_: Step, node, slot

**Dependency**:
A rule on a Pathway Item that another Pathway Item in the same Pathway must be Done, a Container must be complete, or a Timer must have fired, before this one becomes available. Defined only in the Pathway, never in the Journey.
_Avoid_: Prerequisite, link, gate

**Container**:
A box HR draws on a Pathway around several Pathway Items that must all be completed before anything after it starts, such as "Cleared to start". HR chooses what goes inside. A Container is complete when every mandatory Pathway Item inside it is Done; optional ones do not hold it up. Pathway Items inside run at the same time unless they have Dependencies on each other. Other Pathway Items can depend on a Container as a whole. Containers do not nest. A Container can sit within one Stage lane or span neighbouring lanes, but it is not a Stage. The starter sees a Container completing as a moment of progress, and sees what is left inside one not yet complete.
_Avoid_: Milestone, group, scope, gate

**Timer**:
A block on a Pathway that fires once, a set number of days after an Anchor, or before the Start date. It can unlock Pathway Items that depend on it, send a Reminder, or both. When an Anchor's date moves, the Timer's date moves with it.
_Avoid_: Trigger, schedule, delay, wait

**Anchor**:
The event a Timer counts from. One of: Offer accepted, Start date, a chosen Pathway Item being Done, or a chosen Container being complete. Only the Start date can be counted back from.
_Avoid_: Trigger event, start point

**Reminder**:
A one-off message a Timer sends (or an HR Partner or Line Manager sends by hand: see Send a Reminder now) to the starter, their Line Manager or their Buddy about a chosen Pathway Item. Skipped if that Pathway Item is already Done. Never repeats.
_Avoid_: Nudge, notification, alert, chaser

**Applied Pathway**:
One Pathway applied to one Person by an HR Partner, recorded against that Person as a snapshot of the Pathway version used, with a start date and each Journey's status. Holds every Pathway Item in that version, plus any Additions made for that starter. No one can change or remove the Pathway's own items on it. It cannot be reused for anyone else. Each Journey on it is pinned to the version the starter began with.
_Avoid_: Assignment, instance, enrolment

**Addition**:
A Journey added to one starter's Applied Pathway by an HR Partner or the starter's Line Manager after the Pathway is applied, such as a scheduled event, a team-level onboarding task, a team access package or a start delay Journey. Set to unlock Now, After a chosen card, or On Day N, and mandatory or optional (default optional). Labelled "Added by [name]" to everyone. The person who added it can remove it before it starts. The only per-starter change; never saved as a new Pathway.
_Avoid_: One-off change, tailoring, customisation, override

**Person**:
A record for anyone in the organisation. Carries job family, role, grade, platform and location, using the same fixed lists as Journey and Pathway tags, so HR can filter the libraries by a starter's attributes. Nothing is matched automatically. A starter is a Person whose Status says they are joining or joined. Personal details such as home address are not held on the Person record in the app: they stay in the system of record and are fetched by a Hidden automation only when a Journey needs them.
_Avoid_: User, employee, profile

**Status**:
Where a Person is in the joining process. Moves in order through **Joiner** (offer accepted, before their first day), **Starter** (from their first day until Day 30) and **Onboarded** (Day 30 reached).
_Avoid_: Phase, state

**Journey Status**:
Where a starter is with one Journey. One of **Not started** (locked: its Dependencies or Timer are not yet met), **In progress** (available, and the current Action belongs to someone else or a Hidden automation), **Action required** (available, and the current Action is the starter's), **Done** (every Action done, including a Failed Outcome), **Skipped** (an optional Journey the starter marked "Not for me") or **Cancelled** (stopped by a confirmed Hard Stop; sends no Reminders and unlocks nothing).
_Avoid_: Journey state, progress

**Onboarding Studio**:
The laptop-first part of the app where journey owners and HR Partners work: the Journey library and builder, the Pathway library and builder, applying Pathways to Persons, making Additions, and observability. Not designed for phones.
_Avoid_: Admin Portal (the name before Design.MD 1.2), console, back office, admin app

**Manager and Buddy view**:
The mobile-friendly part of the app where a starter's Line Manager and Buddy see what is left and act on it.
_Avoid_: Manager app, manager portal

**Starter Preview**:
The phone-sized starter face of the app, built live from the back end, where a starter (or their Delegate) sees their Applied Pathway grouped by Stage and completes their own Actions: acknowledging Read cards, ticking Tasks, making choices, submitting Provide forms and answering Pulse checks. Shows Journey Status, waiting cards and what's next. A demo-grade version of the starter app, not the production one.
_Avoid_: Starter app, mobile app, mock-up

**Outcome**:
The recorded result of a Journey for one starter. Every Journey records an Outcome in the database when it ends, with a timestamp, for later use (observability and reporting; never read by other Journeys): **Done**, **Cancelled**, **Skipped** (an optional Journey the starter marked "Not for me"), or, for Journeys that declare a pass/fail result such as Pre-employment checks, **Passed** or **Failed**. A Failed Outcome still counts as finished for Journey Duration, and can raise a Hard Stop.
_Avoid_: Result, verdict, pass/fail status

**Mandatory**:
A setting on a Pathway Item. A mandatory Journey must be Done before any Container it sits in is complete, and the starter cannot skip it; the starter is not shown a "required" label. A Journey that is not mandatory is shown to the starter as "Suggested for you" and can be Skipped, which stops its Reminders and holds up nothing. Whoever makes an Addition chooses this for it, defaulting to not mandatory. Mandatory Journeys still open at Day 30 each raise a Task for the Line Manager.
_Avoid_: Required, compulsory, core

**Hard Stop**:
A block on a Pathway that stops work when a Pathway Item ends with a Failed Outcome, or when a Timer deadline passes and the Pathway Item it watches is not Done. It stops the Pathway Items and Containers it is connected to, or the whole Applied Pathway. It never acts on its own: it raises a Needs decision alert for the HR Partner or Line Manager to Confirm, Extend (deadlines only) or Dismiss, with a recorded reason. While a decision is pending the starter's view does not change; after Confirm the starter sees only that their recruiter will be in touch.
_Avoid_: Termination, termination block, kill switch, cancel rule

**Needs decision**:
The alert a Hard Stop raises, shown to the HR Partner in the Onboarding Studio and to the Line Manager in the Manager and Buddy view, never to the Buddy or starter. Cleared when one of them chooses Confirm, Extend or Dismiss.
_Avoid_: Approval, escalation

**Day N**:
A day counted from the starter's Start date, which is Day 1. So Day 14 is 13 days after the Start date, and Day 30 is when Status becomes Onboarded.
_Avoid_: Week N (except "end of week 1", which is Day 7)

**"While you wait" message**:
Optional text on a Journey, shown on the starter's waiting card while that Journey waits on a Hidden automation.
_Avoid_: Holding message, filler

**Note**:
A short free-text message a Line Manager or Buddy sends to the starter, shown on the Starter Preview. Not an Action and not part of any Journey; one-way, not chat.
_Avoid_: Message, chat, Notification

**Demo clock**:
The single simulated "today" that every date calculation in the demo uses. Moves only forward; moving it fires everything that has become due, in date order. Shown on every face as "Simulated date".
_Avoid_: Time travel, fake date, system time

**Demo controls**:
The panel in the Onboarding Studio header that sets the Demo clock, simulates Hidden automation results (Passed, Failed, Returned) and resets the demo data. Never shown on the mobile faces.
_Avoid_: Admin tools, debug panel, god mode

**Blocked Flag**:
An internal flag on a Journey that shows it is waiting on something outside the starter's control, such as vetting. Raised automatically while the Journey waits on a Hidden automation, and cleared when it returns. Visible to HR and Line Managers only, never to the starter, who instead sees a calm waiting card with the Usual Range and the Journey's "while you wait" message. When the wait passes the Usual Range, the Line Manager gets a Task to check in, and the starter is told their manager knows and will be in touch.
_Avoid_: Blocked status, stuck

**Usual Range**:
How long a Journey version normally takes, taken from the middle half of its past Journey Durations, such as "usually 3–5 weeks". Shown to the starter while they wait, and used to mark a wait as overdue.
_Avoid_: SLA, estimate, ETA

**Journey Duration**:
Time from a starter's Journey becoming available (leaving Not started) to becoming Done. Reported per starter and rolled up per Journey version.
_Avoid_: Time taken, lead time

**Stage**:
One of four periods in the joining process. Every Journey must be tagged with exactly one. In order:
- **Pre-contract**: offer accepted until the Contracting Journey is Done. Starter sees "Your offer".
- **Pre-employment**: Contracting Done until Day 1. Starter sees "Getting ready".
- **Onboarding**: Day 1 to Day 7. Starter sees "Your first week".
- **First 30 days**: Day 8 to Day 30. Starter sees "Your first month".

Stages are the lanes on the Pathway builder canvas, group Journeys in the starter's view, and drive the high-level view in observability: how many Journeys sit in each Stage and how long each Stage took. A Stage only groups and labels: it never holds a Journey back; only Dependencies, Containers and Timers do. HR sees the formal names; the starter sees the friendly ones.
_Avoid_: Milestone, phase, step, the six reference stages

**Agent**:
A scripted, versioned library item that answers a starter's question and, when needed, hands over to a person. Defined as a file in `agents/`, listed in the Agent library, and reached from a "Need help?" button on a Journey or from the help chat on the Starter Preview. Not an Action. Scripted, not built on a real model (see Design.MD D11).
_Avoid_: AI Agent (the name before Design.MD 1.2), bot, assistant, chatbot

**Agent library**:
The Onboarding Studio page that lists the Agents. Not the Journey library.
_Avoid_: Bot store, assistant list

**HR Partner**:
The HR person who builds and publishes Pathways in the Onboarding Studio, filters the Pathway library to apply the right one to each new starter, makes Additions for a starter, sets a starter's Delegate, and handles Needs decision alerts. A Pathway's **Pathway owner** is the HR Partner who alone can publish its new live version.
_Avoid_: Admin, HR user. ("Recruiter" is allowed in starter-facing copy, such as "Your recruiter will be in touch"; decision 36.)

**Journey owner**:
The person who builds a Journey in the Journey builder and publishes its versions to the library. Can be from any team (HR, IT, Social). In the demo, the HR Partner persona plays this role too.
_Avoid_: Author, creator

**Library**:
The searchable, filterable lists of published items. The **Journey library** holds Journeys, searchable by Stage and tags; HR Partners drag from it onto the Pathway builder canvas, and HR Partners and Line Managers pick from it when making an Addition. The **Pathway library** holds published Pathways, filterable by tags; HR Partners pick from it to apply a Pathway to a new starter.
_Avoid_: Catalogue, store, marketplace

**Line Manager**:
The Person a starter reports to, linked through org structure. Can make as many Additions as they like to their starter's Applied Pathway, such as their team's access package, but cannot change or remove anything in the Pathway HR applied. Can override a Journey's status to Done with a recorded reason, except for Journeys with a pass/fail Outcome. Sees Blocked Flags and the starter's Choose results; confirms, extends or dismisses Hard Stops.
_Avoid_: Manager, supervisor, contact

**Buddy**:
The Person assigned to help a starter settle in, linked through org structure. Sees only the starter's current Stage and Containers, never Blocked Flags, choices or check results. Can tick their own Tasks and send the starter a note.
_Avoid_: Mentor, sponsor, contact

**Delegate**:
A Person who acts on a starter's behalf, such as an Executive Assistant for an executive, or someone supporting a starter with accessibility needs. Not limited to Executive Assistants. An HR Partner sets the Delegate on the starter's record when the starter asks. A Delegate sees exactly what the starter sees, under an "Acting for" banner, and can complete the starter's Actions except those marked Starter only. Everything they complete is recorded as done by them for the starter. One Delegate per starter in the demo.
_Avoid_: Proxy, assistant, representative, carer

**Starter only**:
A setting on an Action that stops a Delegate completing it. On by default for Provide Actions and the Pulse check's Choose Actions; a journey owner can turn it off for a specific Action. A Delegate sees these as "Waiting for [starter]".
_Avoid_: Private, restricted, personal

**Connector**:
A config file in `connectors/` describing a system the Journey builder can draw on (Workday, ServiceNow or Oracle), with the Operations it offers. Simulated in the demo: it names what a Hidden automation could call and does not reach a real system.
_Avoid_: Plug-in, integration, API

**Operation**:
One named thing a Connector can do, chosen by a Hidden automation Action, such as "create ticket".
_Avoid_: Endpoint, method, call

**Send a Reminder now**:
A manual Reminder that an HR Partner or Line Manager sends to a starter on request, for optional prompts no date decides, such as the company car scheme or "Have you received your merch?". Not tied to a Timer.
_Avoid_: Trigger, nudge, chaser

**Semantic version**:
The major.minor.patch label shown on a Journey or Pathway beside its integer version. A fix bumps the patch, a backwards-compatible change the minor, a breaking change the major. Stored values are `patch`, `minor` and `major`; the UI words them "Fix", "New content" and "Breaking change". The integer version is still the one Applied Pathways pin.
_Avoid_: Release number, build number

**Grade**:
A tag on Journeys, Pathways and Persons, from A to G, plus X for the executive grade (Design.MD 1.4).
_Avoid_: Level, band, seniority

**Insights**:
The Onboarding Studio pages that show starters' progress and how long Pathways and Journeys take, by Stage, business area, role and grade. Replaces the term "observability" in the interface.
_Avoid_: Analytics, reports, dashboard
