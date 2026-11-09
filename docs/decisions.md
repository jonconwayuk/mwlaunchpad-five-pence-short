# Compliance record and decision log

This file tracks acceptance against the spec (`Design.MD`) and carries the decision log, as the phase workflow requires (`docs/workflow/phase-workflow.md`).

Open items waiting on the owner carry the pending marker. The grep command in the `CLAUDE.md` orientation table gives the authoritative list (this paragraph deliberately doesn't spell the token, so it never counts as an item). **Open count: 2.** This is the only place the count is kept. When an item resolves, rewrite its marker to the resolved form, "was" followed by the token.

## Acceptance against the spec

One row per `Design.MD` P0 and P1 item (D15), updated as each phase lands. Status is one of: Not started, In progress, Accepted (with evidence path), or Deviation (with decision number).

| Spec item | Status | Evidence or decision |
| --- | --- | --- |
| D15 P0.1 Pathway engine and Vitest tests | Not started | |
| D15 P0.2 Seed data | Not started | |
| D15 P0.3 Pathway builder canvas | Not started | |
| D15 P0.4 Journey builder UI | Not started | |
| D15 P0.5 Apply a Pathway; Starter Preview | Not started | |
| D15 P0.6 Demo controls | Not started | |
| D15 P0.7 Deploy once | Not started | |
| D15 P1 Manager and Buddy view | Not started | |
| D15 P1 Hard Stop end to end; Timer and Hard Stop blocks | Not started | |
| D15 P1 Live updates over server-sent events | Not started | |
| D15 P1 Chains 1 to 3 | Not started | |

## Decision log

Numbered once, in order, never renumbered or deleted. A reversed decision gets a new entry that points back at the old one. Each entry says what was decided, why, and what evidence backs it.

### 1. Design.MD version 1.0 is the spec

- **Decided:** `Design.MD` as agreed on 9 Nov 2026 is the binding spec, version 1.0. Its D-numbered sections are what plans, briefs and decisions cite.
- **Why:** The phase workflow needs one spec with numbered sections that changes only by logged amendment.
- **Evidence:** Merge commit e6affb7 (Journey builder moved into P0) is the last agreed change before adoption.

### 2. Adopt the phase workflow, with everything stored in the repo

- **Decided:** All substantive work follows the phase workflow. A copy of the skill is kept at `docs/workflow/phase-workflow.md`. Every artefact the workflow produces (plans, evidence, the delegation ledger, decisions, feedback sheets and history, generated content, the presentation) lives in this repo, not in scratch folders or anywhere outside it.
- **Why:** Owner's instruction, 9 Nov 2026. Keeping everything in the repo means the whole team and every agent session see the same record.
- **Evidence:** This entry; `CLAUDE.md` "How we work: the phase workflow".

### 3. Enforcement hooks are not yet wired - `OWNER-PENDING`

- **Decided (provisionally):** Until the hooks exist, the push guard and delegation ledger are followed by hand. No `git push` or `gh pr merge` without a recorded owner say, and every subagent spawn is appended manually to `docs/evidence/delegation-ledger.log`.
- **Why:** The workflow expects hooks from `~/Github/skills/phase-workflow/hooks/`, but that folder is not on this machine; only the skill's instructions are available.
- **Question for the owner:** How should the hooks be provided?
  - (a) Copy the published hooks into `tools/phase-workflow/hooks/` in this repo and wire them in `.claude/settings.json`. **Recommended.** This keeps them in the repo, like everything else.
  - (b) Install them at `~/Github/skills/phase-workflow/hooks/` on each team member's machine.
  - (c) Run the hackathon without hooks and rely on the manual rule above.
- **Note:** `.gitignore` currently ignores all of `.claude/`. Option (a) needs `.claude/settings.json` un-ignored so the wiring is committed.

### 4. Work is planned and run sequentially

- **Decided:** Plans list tasks in one ordered sequence and run them one at a time (implement, review, gate, then the next). There are no parallel waves or parallel worktrees. This is a deliberate deviation from the workflow's "Run what can run" and its wave schedule. Every other workflow rule stands, including a fresh implementer and an independent reviewer per task.
- **Why:** Owner's instruction, 9 Nov 2026. Running one task at a time means each one is checked against the goal in `CLAUDE.md` and goes through the phase-workflow, engineering and ponytail skills before the next starts.
- **Evidence:** This entry; `CLAUDE.md` "How we work: the phase workflow".

### 5. Always use the engineering and ponytail skills - `OWNER-PENDING`

- **Decided:** Every task uses the owner's installed engineering and ponytail skills alongside phase-workflow (`CLAUDE.md` "Always use the installed skills").
- **Why:** Owner's instruction, 9 Nov 2026.
- **Open:** These skills were not visible in the session that wrote this entry, so their exact names are not yet recorded in `CLAUDE.md`. **Question for the owner:** What are the exact skill names (as shown in the skills list, for example `plugin:skill`)?
  - (a) The owner lists them, and they are added to the `CLAUDE.md` skills table. **Recommended.**
  - (b) Leave the table generic, and each session discovers them from the installed list.
