# Five pence short

Team name: the notes do not state one, so this uses the repository name, "five pence short".

Built for LaunchPad '26 (Modern Workplace Engineering hackathon, Edition 02).

## What it does

HR builds Journeys in the Journey builder and groups them into a Pathway on a drag-and-drop canvas in the Admin Portal. They apply a Pathway to a Person, and the Applied Pathway is built live from the back end on that person's phone. A Line Manager or Buddy sees what is left and can act on it, and changes made in the portal show up on the phones within a few seconds.

## Which part of the challenge it tackles

The challenge is a mobile-first companion that takes a new joiner from unconditional offer to feeling connected and confident by Day 30. We tackle the guidance gap: Workday records the joining process but does not guide anyone through it. The product lets HR design that guidance as Pathways and gives the starter, Line Manager and Buddy a light phone view of it.

## How to run it

```bash
npm install && npm run seed && npm run build && npm start
```

Open `http://localhost:3000/portal` on the laptop. For a phone on the same wifi, open `http://<laptop-ip>:3000/me`.

- Phones pick a persona by opening `/persona/A`, `/persona/B` or `/persona/C`.
- Open `/team?viewer=lm-chris` for the Line Manager view.
- Demo controls in the portal move the Demo clock, simulate system results and reset the demo to the seed data.

## The three faces

| Face | Route | Device |
| --- | --- | --- |
| Admin Portal (Journey library and builder, Pathway builder, people, Demo controls) | `/portal` | Laptop |
| Starter Preview | `/me` | Phone |
| Manager and Buddy view | `/team` | Phone |

## Tests

```bash
npm run check
```

This runs the type check, lint and the Vitest tests (the Pathway engine rules, on the Demo clock).

## What is simulated

Deliberate omissions (`Design.MD` D15):

- No login or authentication. A persona switcher replaces it.
- No real LLM or multi-agent orchestration, no two-way chat and no Teams integration.
- No real system-of-record integrations. The adapters are mocked.
- No automatic matching of Journeys or Pathways to starters, no rerouting on events mid-journey, no changing or removing an HR-published Pathway's items for one starter, no undoing a Hard Stop, and no multiple or external Delegates.
- No merging of Pathway versions and no "behind the live version" alerts.

Build decisions:

- Live updates poll every 3 seconds. Server-sent events are the production path (B1).
- There is no observability page (B3).
- Containers, Timers and Hard Stops are seeded as data and read-only on the canvas. The engine runs them in full, but they cannot be authored in the UI yet (B4).
- Local network only. There is no Azure deploy (B13).
- Mocked adapters stand in for Workday, vetting, IT provisioning and merch.
- All data is synthetic.

## Known gaps

These come from two full walks of the demo script (`docs/evidence/launchpad-build/integration/walk-1.md` and `walk-2.md`). Numbers are entries in `docs/decisions.md`.

- **Not tested on real phones yet.** Every phone check ran in headless Chrome at a 390px viewport. Before the demo, the team needs to check two phones on the same wifi.
- **The canvas drag was simulated in the automated checks.** The checks fired synthetic drag events and used the API. A person still needs to try the real mouse drag and edge drawing on the demo laptop.
- **Persona B starts with a Needs decision already raised.** The deadline Timer fires on demo day. Leave it alone on stage (19, waiting on the owner).
- **"Your recruiter will be in touch"** follows `Design.MD`, but the glossary avoids "recruiter" (27, waiting on the owner).
- **Timers, Containers and Hard Stops can't be authored on the canvas.** They are seeded and shown read-only (B4).
- **The Journey library shows a dash for "Applied N times" and the skip rate** (22).
- **Phones refresh every 3 seconds**, so a change takes up to about 3 seconds to appear (B1).
- **A pending Hard Stop is matched to its item by the Needs decision's reason text.** The sturdier fix is listed in decision 30.
- **Delegate attribution, the scripted assistant and the insight strip aren't built.** They are stretch items.
- **Seed before you start.** A new, empty database makes every route return an error until `npm run seed` has run.
