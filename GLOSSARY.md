# New-joiner companion

The LaunchPad '26 companion that takes a new joiner from unconditional offer to feeling connected and confident by Day 30. The whole onboarding journey is modelled, with the core concept as the focus. The first view served is the internal journey view (journey builder and library, pathway builder, observability). The starter-facing app and other actors come later. For the demo, the internal journey view is built for real, and internal systems are mocked with synthetic data behind an interface.

## Language

**Journey**:
A reusable, versioned template for one unit of onboarding work, such as Vetting or Device onboarding. Built and published by a journey owner. Tagged with job family, role, grade, platform and location so HR Partners can find it for a Pathway. Tag values come from fixed lists maintained by HR, not free text.
_Avoid_: Journey block, journey package, task, step

**Pathway**:
An HR Partner's curated selection and order of Journeys for a starter, which can be reused for a similar starter. Tags on Journeys help HR find them, but tags do not create Pathways. HR sets whether each Journey is mandatory within a Pathway. Reusing a Pathway links to the original. Editing a reused Pathway creates a new Pathway, so the original changes only when its owner modifies it. An owner's change reaches only Pathways reused after the change. Applied Pathways already started are unaffected, because they pin Journey versions.
_Avoid_: Flow, process, plan, template

**Applied Pathway**:
One Pathway applied to one Person, with a start date and each Journey's status. A Line Manager can add Journeys to it but cannot change or remove the ones HR specified. Each Journey on it is pinned to the version the starter began with.
_Avoid_: Assignment, instance, enrolment

**Person**:
A record for anyone in the organisation. Carries job family, role, grade, platform and location, using the same fixed lists as Journey tags, so matching is exact. A starter is a Person whose Status says they are joining or joined.
_Avoid_: User, employee, profile

**Status**:
Where a Person is in the joining process. Moves in order through **Joiner** (offer accepted, before their first day), **Starter** (from their first day until Day 30) and **Onboarded** (Day 30 reached).
_Avoid_: Phase, state

**Journey Status**:
Where a starter is with one Journey. One of **Not started**, **In progress**, **Action required** (the starter needs to act) or **Done**.
_Avoid_: Journey state, progress

**Blocked Flag**:
An internal flag on a Journey that shows it is waiting on something outside the starter's control, such as vetting. Visible to HR and Line Managers only, never to the starter.
_Avoid_: Blocked status, stuck

**Journey Duration**:
Time from a starter's Journey first becoming In progress to first becoming Done. Reported per starter and rolled up per Journey version.
_Avoid_: Time taken, lead time

**Stage**:
One of four general points in the joining process that every Journey is tagged with, exactly one per Journey, in this order: Pre-contract, Pre-employment, Onboarding, First 30 days. Used to group Journeys for the starter view. Optional, not essential to the model.
_Avoid_: Phase, step, the six reference stages

**AI Agent**:
A separate, versioned library item that answers starters' questions at any time and hands over to a person when needed. A Journey can call an AI Agent as one of its steps.
_Avoid_: Bot, assistant, chatbot

**Line Manager**:
The Person a starter reports to, linked through org structure. Can add Journeys to a starter's Applied Pathway, within their own area (their org unit in org structure), location and platform, but cannot change or remove the items HR specified. Can override a Journey's status with a recorded reason.
_Avoid_: Manager, supervisor, contact

**Buddy**:
The Person assigned to help a starter settle in, linked through org structure.
_Avoid_: Mentor, sponsor, contact
