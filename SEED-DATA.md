# SEED-DATA.md: MW Launchpad

The synthetic data the demo runs on and the Pathway engine tests use (Design.MD D12). Reset demo reseeds exactly this. Terms are in `GLOSSARY.md`.

## Status

**Draft, for team review.** If the synthetic data pack (A-02) arrives with its own people, locations or roles, swap them in and keep the structure.

## 1. Fixed tag lists

Used for Journey tags, Pathway tags and Person attributes. For browsing and filtering only; nothing is matched automatically.

| List | Values |
| --- | --- |
| Job family | Branch, Software engineering, Executive, HR, IT |
| Role | Customer service colleague, Software engineer, Managing director, Executive assistant, Line manager |
| Grade | Colleague, Manager, Senior manager, Executive |
| Platform | Retail, Technology, Group Functions |
| Location | Cardiff, Leeds, London, Edinburgh |

## 2. People

Dates are relative to the Demo clock's starting "today" (T), so Reset demo always gives the same story. The clock only moves forward, so the order of the demo matters (Demo script is parked).

| Persona | Job family / Role / Grade / Platform / Location | Offer accepted | Start date (Day 1) | Line Manager | Buddy | Delegate |
| --- | --- | --- | --- | --- | --- | --- |
| **A: Alex Morgan** | Branch / Customer service colleague / Colleague / Retail / Cardiff | T − 21 days | T + 56 days (long vetting wait) | Priya Shah | Tom Evans | — |
| **B: Sam Okafor** | Software engineering / Software engineer / Colleague / Technology / Leeds | T − 35 days | T + 5 days | Chris Lee | Jo Patel | — |
| **C: Dana Whitfield** | Executive / Managing director / Executive / Group Functions / London | T − 14 days | T + 21 days | Ruth King | Mark Allen | Lena Brooks (Executive assistant) |
| HR Partner | HR / — / Manager / Group Functions / Leeds | | | | | |

The HR Partner persona is also the Journey owner and Pathway owner in the demo.

## 3. Library Journeys

"Starter only" marks Actions a Delegate can't do. The Outcome column shows Journeys that declare a pass/fail result.

| # | Journey | Owner team | Stage | Actions, in order | Outcome |
| --- | --- | --- | --- | --- | --- |
| 1 | Contracting | HR | Pre-contract | Read (your offer) → Provide (sign contract) | — |
| 2 | Payroll | HR | Pre-employment | Provide (bank details, Starter only) | — |
| 3 | Pre-employment checks | HR | Pre-employment | Provide (right to work and proof of address, Starter only) → Hidden automation (vetting). "While you wait" message. | Passed / Failed |
| 4 | ID creation (photo) | Security | Pre-employment | Provide (photo) → Hidden automation (badge request) | — |
| 5 | Manager ready | HR | Pre-employment | Task, Line Manager (set 3-month goals) → Hidden automation (send welcome pack) → Notification to Starter | — |
| 6 | Meet your buddy | HR | Pre-employment | Notification to Buddy → Task, Buddy (send a hello note) | — |
| 7 | Pulse check | HR | First 30 days | Read → Choose (connection 1–5, flag ≤ 2, Starter only) → Choose (confidence 1–5, flag ≤ 2, Starter only) | — |
| 8 | Branch device | IT | Pre-employment | Choose (device) → Hidden automation (order to address from system of record) | — |
| 9 | Developer device | IT | Pre-employment | Choose (high-spec device) → Hidden automation (order) | — |
| 10 | Executive device | IT | Pre-employment | Choose (device) → Hidden automation (order) | — |
| 11 | Uniform (Merch distribution) | Retail | Pre-employment | Choose (size) → Hidden automation (order to address from system of record) | — |
| 12 | Branch induction | Retail | Onboarding | Read → Task, Starter (shadow shift) → Task, Line Manager (week-one 1:1) | — |
| 13 | Cash-handling training | Retail | First 30 days | Read → Task, Starter (complete e-learning) | — |
| 14 | Engineering community intro | Technology | Onboarding | Read → Task, Starter (join the guild channel) | — |
| 15 | Payments squad access package | Technology | Pre-employment | Hidden automation (network account) → Hidden automation (access package) | — |
| 16 | Welcome from sponsoring exec | Executive office | Onboarding | Notification to Starter → Task, HR (book sponsor meeting) | — |
| 17 | Start delay engagement | HR | Pre-employment | Read (what's happening while you wait) → Notification to Line Manager (say hello) | — |
| 18 | In-person events calendar | HR | Onboarding | Read (events near you, from the Person's location) → Choose (event to attend) | — |

## 4. Pathway templates

All three share the same core structure, reusing the same library Journeys:

| Pathway Item | Mandatory | Unlocks after |
| --- | --- | --- |
| Contracting | Yes | — |
| Payroll | Yes | Contracting |
| Pre-employment checks | Yes | Contracting |
| ID creation | Yes | Pre-employment checks |
| Device Journey (per template) | Yes | Contracting |
| Manager ready | Yes | Contracting |
| **Container "Cleared to start"**: Payroll, Pre-employment checks, ID creation | | |
| Meet your buddy | Yes | "Cleared to start" complete |
| Pulse check (Day 14) | No | Timer: Day 14 |
| Pulse check (Day 30) | No | Timer: Day 30 |

Core Timers and Hard Stops:
- **Timer**: 7 days before Start date, Reminder to Starter about Payroll (skipped if Done).
- **Hard Stop, On Failed**: Pre-employment checks Failed → stop the whole Pathway, Needs decision.
- **Hard Stop, On deadline**: Timer 5 days before Start date watching Pre-employment checks → stop Meet your buddy and anything after "Cleared to start", Needs decision (Extend allowed).

Template-specific items:

| Pathway | Tags | Device Journey | Extra Pathway Items |
| --- | --- | --- | --- |
| **Branch colleague** | Branch / Retail / Colleague | Branch device | Uniform (optional, after Contracting); Branch induction (mandatory, Timer Day 1); Cash-handling training (mandatory, Timer Day 8) |
| **Software engineer** | Software engineering / Technology / Colleague | Developer device | Engineering community intro (optional, Timer Day 1) |
| **Executive** | Executive / Group Functions / Executive | Executive device | Welcome from sponsoring exec (mandatory, after "Cleared to start") |

## 5. Applied Pathways and Additions at reset

| Persona | Pathway applied | Additions |
| --- | --- | --- |
| A | Branch colleague | By HR: Start delay engagement (Timer: 30 days after Offer accepted, optional); In-person events calendar (On Day 1, optional) |
| B | Software engineer | None at reset. **Live in the demo**: Line Manager adds Payments squad access package (After "Cleared to start", mandatory) |
| C | Executive | None |

## 6. Seeded history

So the Usual Range and observability have data: about 20 past synthetic starters per Pathway, with Journey Durations for each Journey version. Pre-employment checks usually take 21–35 days. A few have Skipped optional Journeys and Pulse scores across two Pathway versions ("Branch colleague v3" and "v4").

## Open points

- Persona names are placeholders; replace them with people from A-02 if it has them.
- Exact Demo clock start date (T).
- Whether 18 Journeys is too many to seed in time; items 13, 14, 16 and 18 are the easiest to drop.
