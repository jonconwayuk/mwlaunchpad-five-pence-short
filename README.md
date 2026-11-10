# Five pence short

Team name: the notes do not state one, so this uses the repository name, "five pence short".

Built for LaunchPad '26 (Modern Workplace Engineering hackathon, Edition 02).

## What it does

Bob Warwick has just accepted an offer as a Modern Workplace infrastructure engineer at grade E. In the Onboarding Studio, HR builds Journeys (kept as files in this repo) and groups them into the "Infrastructure engineer E" Pathway on a drag-and-drop canvas, then applies it to Bob from People. Bob, his manager Hannah and his buddy Leo each see their own live view of the same Applied Pathway: Bob sees what to do and an honest wait, Hannah sees his progress and can add a Journey or send a Reminder, and Leo sees only what a Buddy should.

## Which part of the challenge it tackles

The challenge is a mobile-first companion that takes a new joiner from unconditional offer to feeling connected and confident by Day 30. We tackle the guidance gap: Workday records the joining process but does not guide anyone through it. The product lets HR design that guidance as Pathways and gives the starter, Line Manager and Buddy a light view of it.

## How to run it

```bash
npm install && npm run seed && npm run build && npm start
```

Open `http://localhost:3000/portal`. The whole demo runs in that one window. The stage walk is in `docs/demo/script.md`.

## The faces and the switcher

| Face | Route | Who |
| --- | --- | --- |
| Onboarding Studio: Journey library and builder, Pathway builder, People, Insights, Agent library, Demo controls | `/portal` | HR and admins, on a laptop |
| Joiner view | `/me` | Bob (or another starter, or their Delegate) |
| Manager and Buddy view | `/team` | Hannah Price (Line Manager) or Leo Grant (Buddy) |

The black strip at the top of every page is the switcher. **View** moves between Onboarding Studio, Joiner, Manager and Buddy. **Person** picks the starter, and Manager and Buddy follow that starter's Line Manager and Buddy. **Layout** shows the three people views in a phone frame or full width. The default person is Bob. Phones on the same wifi can still open `http://<laptop-ip>:3000/me`. `/persona/bob`, `/persona/A`, `/persona/B` and `/persona/C` set the person directly.

Demo controls in the Studio move the Demo clock (including **Plus 3 weeks** for a starter), simulate system results (passed, failed, returned) and **Reset demo** to the seed data.

## Tests

```bash
npm run check
```

This runs the type check, lint and the Vitest tests (the Pathway engine rules on the Demo clock, the data layer, and the UI logic).

## What is simulated

- **The "Connected repository" is this repository.** There is no second repo. The Journey builder's Connected repository panel points at the `journeys/` folder here, connectors are described in `connectors/`, and agents in `agents/`. **Sync from repository** re-reads `journeys/`, and Publish writes the file back. Nothing talks to GitHub or any other remote.
- **Connectors are mocked.** Workday, ServiceNow and Oracle are manifests in `connectors/` backed by mocked adapters in `src/adapters/`. A Hidden automation Action names a connector and an operation, but no real system is called. Demo controls stand in for the results.
- **Agents and the help chat are scripted.** The Agent library (`agents/`) and the joiner's **Need help?** chat match questions to scripted answers. There is no LLM, and the chat is labelled "Simulated: scripted answers".
- **The Teams handover is simulated.** "Talk to a person" shows a mock Teams card and puts the question in the Line Manager's To-do. Nothing is sent to Teams.
- **Insights use synthetic history:** 80 made-up past starters.
- All data is synthetic.

Deliberate omissions (`Design.MD` D15):

- No login or authentication. The persona switcher replaces it.
- No real LLM or multi-agent orchestration and no real Teams integration. The chat and handover above are scripted.
- No real system-of-record integrations. The adapters are mocked.
- No automatic matching of Journeys or Pathways to starters (People only suggests one), no rerouting on events mid-journey, no changing or removing an HR-published Pathway's items for one starter, no undoing a Hard Stop, and no multiple or external Delegates.
- No merging of Pathway versions and no "behind the live version" alerts.

Build decisions:

- Live updates poll every 3 seconds. Server-sent events are the production path (B1).
- Local network only. There is no Azure deploy (B13).

## Known gaps

Numbers are entries in `docs/decisions.md`. The latest walk is `docs/evidence/feedback-1/H/walk-1.md`.

- **Reset demo keeps Journey files you add.** Reset reseeds from `journeys/`, so a file added in the demo stays in the library until it is deleted. The demo script deletes it before the final Reset.
- **Not tested on real phones or with a real mouse drag.** Every check ran in headless Chrome, and the canvas drag used synthetic drag events. Someone needs to try both on the demo laptop.
- **Who sent a Reminder isn't stored.** The route checks the sender but doesn't record it (42).
- **Insights groups past starters by row order.** The synthetic history rows have no starter key. That's correct for the seed, but would need an additive `starterKey` for real data (42).
- **Library filters keep untagged Journeys.** A Journey with no grade or location tag counts as being for everyone, so it stays listed under every grade and location.
- **Phones refresh every 3 seconds**, so a change takes up to about 3 seconds to appear (B1).
- **Persona B starts with a Needs decision already raised** (19, kept as is under 36). It is supporting data, not on stage.
- **Seed before you start.** A new, empty database makes every route return an error until `npm run seed` has run.
