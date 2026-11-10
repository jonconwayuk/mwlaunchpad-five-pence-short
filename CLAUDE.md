# Launchpad team project

This is a team's project for the Launchpad hackathon. The event site, https://mwlaunchpad.com/, has the brief and event details; fetch it when you need hackathon context. All teams share one Azure and Microsoft 365 tenant and one subscription, so a mistake here can affect other teams. `M365_AZURE_INSTRUCTIONS.md` has the full rules, and `CLAUDE_CODE_INSTRUCTIONS.md` covers signing in.

`NN` below is the team's two-digit number.

This file is the onboarding for the next agent. It is not a changelog. Keep it current in the same change as any edit it describes.

## Orientation

| Question | Where the answer lives |
| --- | --- |
| Where have we been? | `git log`, plus `docs/feedback-history.md` (created when the first feedback sheet is executed) |
| What is outstanding? | `docs/decisions.md` (acceptance table and decision log), plus `grep -n "OWNER-PENDING" docs/decisions.md` |
| What is next? | Current plan: `docs/plans/2026-11-10-launchpad-build.md`, which points at `BUILD-PLAN.md` waves A to E (decision 9). |

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
- Changes made in the Admin Portal must show up live in the mobile faces. That is the key demo move (`Design.MD` D2): HR filters the Pathway library and applies "Branch colleague" to Persona A and "Software engineer" to Persona B, we flip phones to show two different packs, then B's Line Manager adds a Journey and it appears live on B's phone.
- The mobile faces stay light: read the Applied Pathway, complete Actions, tick Tasks. Don't build anything there that the demo doesn't need.

### Build priorities

Work in the order set in `BUILD-PLAN.md`, which is agreed and executable (decision 9). Its closed decisions B1 to B17 override the tiers below where they differ: for example polling instead of server-sent events (B1), local network instead of a deploy (B13), and Add a Journey in wave C (B2).

1. **P0 (no demo without these):** Pathway engine with Vitest tests; seed data (`SEED-DATA.md`); Pathway builder canvas; Journey builder form; Pathway library with tag filters, applying a Pathway and the Starter Preview; Demo controls; one early deploy.
2. **P1:** Manager and Buddy view, Hard Stop end to end, Timer and Hard Stop blocks on the canvas, live updates over server-sent events, chain reactions 1 to 3.
3. **P2 (only if ahead):** observability page, Delegate, scripted assistant, "Add a Journey" (Additions) by HR and Line Manager.

The deliberate omissions in `Design.MD` D15 are out of scope. Don't build login, a real LLM, chat, Teams integration or real system-of-record integrations; use labelled mock-ups or mocked adapters instead.

### Source of truth

- `Design.MD`: the agreed spec, version 1.1. Follow it; don't redesign it. It changes only by explicit amendment: bump its version, add a line to its amendment log, record a decision in `docs/decisions.md`, and update `GLOSSARY.md` and any ADR it names in the same change. Where the spec and the code disagree, record it as a finding; never quietly change either to match.
- `GLOSSARY.md`: use its terms exactly in code, UI copy and docs (Journey, Action, Pathway, Pathway Item, Dependency, Container, Timer, Addition and so on). Don't use the words it lists under "Avoid": for example, it's Container, not Milestone. Nothing matches Journeys or Pathways to a Person automatically (ADR-0004), so there are no Conditions; tags are only for browsing and filtering.
- `BUILD-PLAN.md`: the agreed waves, briefs, file ownership and closed decisions B1 to B17 (decision 9).
- `SEED-DATA.md`: the synthetic data the demo and the engine tests use (draft, for team review). Reset demo reseeds exactly this.
- `docs/adr/`: decisions with lasting trade-offs. Add a new ADR for any new one.
- `Ideas.MD` is an early raw log, superseded by Design.MD, and `launchpadnotes.MD` holds brief and judging notes. Neither is a spec.

## How we work: the phase workflow

**Always use the `anthropic-skills:phase-workflow` skill.** Every substantive piece of work is a phase and follows it, however small it looks. Load the skill at the start of every session before planning or changing anything. A copy is kept in the repo at `docs/workflow/phase-workflow.md`, so the whole team works from the same rules; if the copy and the skill differ, raise it and record the outcome in `docs/decisions.md`.

The workflow governs plans, branches, subagent models, per-task review, gates, evidence and merges. This section only records where its documents live in this project:

| Workflow document | Location in this repo |
| --- | --- |
| Onboarding (AGENTS.md role) | `CLAUDE.md` (this file) |
| Spec | `Design.MD`, with numbered D sections and an amendment log |
| Compliance record and decision log | `docs/decisions.md` |
| Pending marker | `OWNER-PENDING`, counted only in `docs/decisions.md` |
| Plans | `docs/plans/`, at most the current phase's plan |
| Evidence | `docs/evidence/<phase>/`, created by the first phase that makes a claim |
| Delegation ledger | `docs/evidence/delegation-ledger.log` |
| Feedback sheets and history | `docs/feedback/` for live sheets, `docs/feedback-history.md` for the condensed record |
| Workflow rules | `docs/workflow/phase-workflow.md` |

**Store everything in the repo.** Every artefact a phase produces goes in this repo: plans, evidence, ledger, decisions, feedback, generated content and seed data, mock-ups, and the presentation. Nothing is kept in scratch folders or anywhere outside it. Because the repo is public, the Secrets rules below apply to all of it, evidence captures and logs included.

**Gates for this project:** `npm run check` (`tsc --noEmit && eslint . && vitest run`) for every task, plus `npm run build` at each wave gate, with zero warnings (decision 12). The baseline and the pinned test count are in the current plan.

**Merges and pushes need the owner's say**, recorded as a decision in `docs/decisions.md` first. For the Launchpad build phase, `git push origin main` is pre-authorised at each green wave gate (decision 11). The enforcement hooks are not wired yet (decision 3), so follow the push rule by hand and append every subagent spawn to the delegation ledger yourself.

**Waves in order, tasks in a wave in parallel.** For the Launchpad build phase, the tasks inside a wave run at the same time, one fresh implementer each, made safe by the file ownership table in `BUILD-PLAN.md` section 6 (decision 10, which supersedes decision 4 for this phase). Waves still run in order. Before each task starts, check it against the goal above and the build priorities, and load the skills it needs. Every task still gets a fresh implementer and an independent reviewer.

### Always use the installed skills

Every task uses these skills, loaded at the point in the sequence where they apply:

| Skill set | When to use it |
| --- | --- |
| `anthropic-skills:phase-workflow` | Every session and every phase: planning, execution, review, gates, evidence. |
| **Engineering skills** (`engineering-skills:*`) | Every code task: design, implementation, testing, review and debugging. Use them alongside the engineering standards below; where a skill and the standards disagree, record it in `docs/decisions.md` rather than picking one silently. The ones this project uses most: `senior-frontend`, `senior-backend`, `senior-fullstack`, `senior-architect`, `senior-qa`, `tdd-guide`, `red-green-proof`, `code-reviewer`, `adversarial-reviewer`, `senior-devops` and `azure-cloud-architect`. |
| **Ponytail skills** (`ponytail:*`) | Every task they cover. Check them before each task: `ponytail` (always on), `ponytail-review` for each task review, `ponytail-audit` and `ponytail-debt` at phase end. |
| **Matt Pocock skills** (`mattpocock-skills:*`) | `tdd` for engine rules, `domain-modeling` for `GLOSSARY.md` and ADRs, `codebase-design` for module seams, `diagnosing-bugs`, `code-review`, `pr` and `writing-for-agents` (for edits to this file). |
| **Taste skill** (`taste-skill:design-taste-frontend`) | Visual polish on the Admin Portal canvas and the mobile faces. |

At the start of each session, check these are still in the installed skills list. If one is missing, stop and tell the owner rather than carrying on without it.

Also use any other installed skill that fits, for example `dataviz` for any chart on the observability page. If skills for the presentation (`pptx`) or documents (`docx`, `xlsx`, `pdf`) are installed, use them when a deliverable takes that form.

### Engineering standards

The stack is TypeScript on Node.js (`Design.MD` D14), so [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices) is the main standard. Any Python, such as seed or data scripts, follows [PEP 8](https://peps.python.org/pep-0008/).

**Node.js and TypeScript** (from Node.js Best Practices):

- **Structure by component.** Keep the Pathway engine as a separate module with no UI and no framework imports, behind a clear interface. The canvas and the three faces call it; they never reimplement its rules.
- **Layer the code.** Keep web and route handlers, domain logic (the engine) and data access (SQLite through Prisma or Drizzle) apart. Mocked systems sit behind adapter interfaces so they can be swapped later.
- **Handle errors properly.** Use `async`/`await`, throw `Error` objects (never strings), handle errors in one central place, and validate all input at the API boundary.
- **Configuration.** Read config from environment variables, validate it at startup, and keep secrets out of code (see Secrets below).
- **Code style.** Use TypeScript strict mode, ESLint and Prettier. Use `const` by default, `===`, and clear names (camelCase for functions and variables, PascalCase for types and components). No `any` unless justified in a comment.
- **Testing.** Write Vitest unit tests for every engine rule: Dependencies, Containers, Timers, Additions, Journey Status and Outcomes, Hard Stops. Name tests as "what, when, expected". All date logic uses the Demo clock, never the real clock, so tests are deterministic.
- **Dependencies.** Pin versions with a lockfile, keep the dependency list small, and run `npm audit` before deploying.
- **Logging.** Use a proper logger, not stray `console.log`. Never log personal data or secrets.

**Python** (PEP 8): 4-space indentation, lines of 79 characters or fewer, `snake_case` for functions and variables, `PascalCase` for classes, imports at the top grouped as standard library, third-party, then local, and docstrings on public functions.

**Across both:**

- One commit per task, using the plan's commit message, with no Co-Authored-By trailer and no emojis.
- Synthetic data only, in seed data, screenshots and mock-ups.
- Keep `README.md` current with how to run the demo and the list of deliberate omissions.

## Traps

Things that have bitten a phase here, each with the failure it prevents. This list stays empty until something bites; adding an entry is part of the phase that hit it.

- None yet.

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
