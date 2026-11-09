# Ideas.MD: MW Launchpad

Working log of the team's ideas for the LaunchPad '26 hack. Ideas here are raw input for design. Agreed decisions move to Design.MD.

## Hack context

**Event:** LaunchPad '26, Modern Workplace Engineering hackathon at Lloyds Banking Group. Leeds, Wellington Place, 9–10 Nov 2026.

**Event site:** [mwlaunchpad.com](https://mwlaunchpad.com/) is the official event site.

**Challenge:** Design and build a mobile-first companion that takes a new joiner from unconditional offer to feeling connected and confident by Day 30. The brief's prompts are context, not requirements.

**Problem as framed:** Vetting and screening leave weeks or months between offer and day one. Workday records the joining process but does not guide the joiner through it. New starters struggle to know what comes next, find what is relevant to their role and location, and meet their manager and buddy before they arrive. Support stops at day one.

**Constraints:**
- Mobile-first. The demo must run on a phone (web, PWA or native).
- Public APIs only. No internal LBG systems.
- Synthetic data only.
- Code pushed to our fork by 13:00 on Day 2 (build freeze). After that, demo prep only.
- README must cover team name, what it does, which part of the challenge it addresses, and how to run it.
- Azure credentials are available if we choose to deploy there. Deployment is optional.

**Judging:** Five equally weighted categories: Best Demo, Best Technical Approach, Best UX, Best Feature Fit, and Most Innovative. Top three mentor totals go to a Best in Show finals round.

**Checkpoints:** D1 12:00 (problem and approach), D1 15:30 (progress and decisions), D2 10:15 (working journey).

## Core idea

**Elevator pitch:** A scalable pre-boarding, onboarding, and induction and socialisation orchestrator. It has three parts: an internal package builder for journeys and AI agents, a library of published journeys and agents, and a pathway builder that arranges journeys into a flow. The output is a clear pathway shown to the new starter in an external mobile and web app.

**Key problem:** Running many onboarding journeys at scale. This is not a centrally owned process polished into a single app.

## What we want to demonstrate

**Library of journeys and AI agents**, tagged by defining characteristics:
- Platform
- Role
- Grade
- Location
- Whether the journey is mandatory for a given combination of characteristics

**Journey builder:** Creates and packages journeys.

**Pathway builder:** Arranges journey packages into a logical flow supporting:
- Sequential execution
- Parallel execution
- Context-dependent branching

**Limited database holding:**
- Person profiles
- Org structure
- Roles
- Locations
- Applied pathways (versioned)
- Journeys (versioned)

**Observability:** When journeys start and end, duration per person, and aggregate duration to support improvement analysis.

**Pathway owners (HR):** Define core pathways based on characteristics (platform, role, grade, location).

**Chat passthrough:** New starter can message their internal manager. Ideally surfaced inside Microsoft Teams.

## Presentation personas

1. A bank branch worker
2. A developer in the bank
3. An executive in the bank

## Architecture ideas

**AI orchestrator:** A generic chat for new starters that switches between specialised agents.

**Internal API:** Supports other bank automations, such as delivering messages, requesting input, and delivering status updates.

## Example journeys to show

We don't need to build all the content, but the presentation must show these.

**HR core journeys:**
- Contracting
- Payroll
- Right to work
- Proof of address
- Vetting
- ID creation (photo)
- Start delay engagement
- Merch distribution

**IT journeys:**
- Device preferences
- Device onboarding
- Access package provision

**Social journeys:**
- In-person events calendar
- Welcome from sponsoring exec

## Open questions

- Which of the six reference journey stages from the brief does the pathway builder map onto?
- How do we mock the internal systems (Workday, Teams, IT provisioning) using public APIs or synthetic data only?
- Which persona do we demo first, and which journeys carry the demo for each persona?
- Scope split: which parts are real builds and which are mocked for the demo?
