# Launchpad team project

This is a team's project for the Launchpad hackathon. The event site, https://mwlaunchpad.com/, has the brief and event details; fetch it when you need hackathon context. All teams share one Azure and Microsoft 365 tenant and one subscription, so a mistake here can affect other teams. `M365_AZURE_INSTRUCTIONS.md` has the full rules, and `CLAUDE_CODE_INSTRUCTIONS.md` covers signing in.

`NN` below is the team's two-digit number.

## The goal: never lose sight of it

We are building a **demonstrable product**. It centres on the **Pathway builder and Journey builder UI** in the Admin Portal, with **light front ends we can switch between** to show the result. The pathway-building logic and its UI are the USP, and they have to be fully built to demo building journeys and grouping journeys to build a pathway. (`Design.MD` D1, D2a; ADR-0003).

Before starting any task, check that it makes that demo better. If it doesn't, don't do it, or raise it with the team first. Polish on the builder beats breadth anywhere else.

### What the demo is

One Next.js web app with three faces (`Design.MD` D1, D14):

| Face | Route | Device | Weight |
| --- | --- | --- | --- |
| **Admin Portal**: Journey library and Journey builder, drag-and-drop Pathway builder, apply a Pathway to a Person, Demo controls | `/portal` | Laptop | **Primary.** Most of the effort goes here. |
| **Starter Preview** (also used by Delegates) | `/me` | Phone | Light. Shows the Applied Pathway built live from the back end. |
| **Manager and Buddy view** | `/team` | Phone | Light. What's left and acting on it. |

- A **persona switcher** replaces login, so we can flip between the three synthetic personas (branch colleague, software engineer, executive) and between faces during the demo.
- Changes made in the Admin Portal must show up live in the mobile faces. That is the key demo move: apply the same Pathway to two personas and flip between their previews.
- The mobile faces stay light: read the Applied Pathway, complete Actions, tick Tasks. Don't build anything there that the demo doesn't need.

### Build priorities

Work in the order set in `Design.MD` D15. Don't pick up a lower tier while a higher one is unfinished.

1. **P0 (no demo without these):** Pathway engine with Vitest tests; seed data; Pathway builder canvas; Journey builder form; apply a Pathway and see the Starter Preview; Demo controls; one early deploy.
2. **P1:** Manager and Buddy view, Hard Stop end to end, Timer and Hard Stop blocks on the canvas, live updates over server-sent events, chain reactions 1 to 3.
3. **P2 (only if ahead):** observability page, "Preview as…", Delegate, scripted assistant, manager "Add a Journey".

The out-of-scope list in D15 is deliberate. Don't build login, a real LLM, chat, Teams integration or real system-of-record integrations; use labelled mock-ups or mocked adapters instead.

### Source of truth

- `Design.MD`: the agreed spec. Follow it; don't redesign it. If a task needs a change to an agreed decision, update `Design.MD`, `GLOSSARY.md` and any ADR it names together.
- `GLOSSARY.md`: use its terms exactly in code, UI copy and docs (Journey, Action, Pathway, Pathway Item, Dependency, Milestone, Timer, Condition and so on). Don't use the words it lists under "Avoid".
- `docs/adr/`: decisions with lasting trade-offs. Add a new ADR for any new one.
- `Ideas.MD` holds raw ideas and `launchpadnotes.MD` holds brief and judging notes. Neither is a spec.

## How to work

### Use the skills

Check the available skills before starting each piece of work, and use every one that fits. For example: `frontend-design` for the Admin Portal canvas and the mobile faces; `phase-workflow` for multi-task phases that span sessions; `pptx` for the presentation, including the slide on the advantages of a web app; and `docx`, `xlsx` or `pdf` when a deliverable takes that form.

### Engineering standards

The stack is TypeScript on Node.js (`Design.MD` D14), so [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices) is the main standard. Any Python, such as seed or data scripts, follows [PEP 8](https://peps.python.org/pep-0008/).

**Node.js and TypeScript** (from Node.js Best Practices):

- **Structure by component.** Keep the Pathway engine as a separate module with no UI and no framework imports, behind a clear interface. The canvas and the three faces call it; they never reimplement its rules.
- **Layer the code.** Keep web and route handlers, domain logic (the engine) and data access (SQLite through Prisma or Drizzle) apart. Mocked systems sit behind adapter interfaces so they can be swapped later.
- **Handle errors properly.** Use `async`/`await`, throw `Error` objects (never strings), handle errors in one central place, and validate all input at the API boundary.
- **Configuration.** Read config from environment variables, validate it at startup, and keep secrets out of code (see Secrets below).
- **Code style.** Use TypeScript strict mode, ESLint and Prettier. Use `const` by default, `===`, and clear names (camelCase for functions and variables, PascalCase for types and components). No `any` unless justified in a comment.
- **Testing.** Write Vitest unit tests for every engine rule: Conditions, Dependencies, Milestones, Timers, Journey Status and Outcomes, Hard Stops. Name tests as "what, when, expected". All date logic uses the Demo clock, never the real clock, so tests are deterministic.
- **Dependencies.** Pin versions with a lockfile, keep the dependency list small, and run `npm audit` before deploying.
- **Logging.** Use a proper logger, not stray `console.log`. Never log personal data or secrets.

**Python** (PEP 8): 4-space indentation, lines of 79 characters or fewer, `snake_case` for functions and variables, `PascalCase` for classes, imports at the top grouped as standard library, third-party, then local, and docstrings on public functions.

**Across both:**

- Small, focused commits and pull requests with clear messages.
- Synthetic data only, in seed data, screenshots and mock-ups.
- Keep `README.md` current with how to run the demo and the list of deliberate omissions.

## Azure and Microsoft 365

- Create Azure resources only in the team's own resource group.
- Never change anything belonging to another team, or any tenant-wide setting.
- Deploy only to UK South or Italy North.

## Naming

| What | Pattern |
| --- | --- |
| Azure resources | `<type>-teamNN-<purpose>` |
| Globally unique Azure names | Same pattern with a short random suffix, for example `kv-teamNN-a91f`. Storage accounts allow only lowercase letters and numbers, for example `stteamNNdata7x2`. |
| Entra ID app registrations | `teamNN-<purpose>` |
| Test users | `teamNN-<name>` |
| Microsoft 365 groups, Teams and SharePoint sites | `TeamNN - <name>` |

## Secrets

Treat this repo as public. Never commit:

- Passwords, keys, client secrets, connection strings or tokens.
- Anything from the team sheet, including the account name and tenant domain.
- Tenant or subscription IDs, or CLI output, screenshots or logs that show them.

Keep real values in a local `.env`, which is ignored by git, and put placeholders in `.env.example`.
