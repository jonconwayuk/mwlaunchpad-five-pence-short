<!-- Copy of the anthropic-skills:phase-workflow skill, stored in the repo so the team and every agent work from the same rules. Refresh it from the skill if the skill changes, and record the refresh in docs/decisions.md. -->

# The phase workflow

Binding instructions for any agent working in a project that adopts this
workflow. A project adopts it by referencing this skill from its CLAUDE.md or
AGENTS.md and wiring the hooks under `~/Github/skills/phase-workflow/hooks/` into its
`.claude/settings.json` (see "What is enforced"). It is language- and domain-agnostic: "tests" means
whatever the project's test runner is, "build" means whatever its build is,
"art" or "content" means any generated deliverable that is not code.

The human running the project is the owner. Two things in this workflow are
his alone: verdicts a ruling explicitly reserves for him, and the say on
merges and pushes. Everything else is executed by agents, end to end.

## The documents

Each project maintains a small set of documents with one job each. Nothing is
recorded twice; every question has exactly one place its answer lives.

**AGENTS.md** is the next agent's onboarding, not a changelog. The file may
be called AGENTS.md or CLAUDE.md, whichever the project has; look for both.
Where both exist, AGENTS.md is the onboarding and CLAUDE.md points at it.
"AGENTS.md" below means that file. It opens with an orientation table
answering three questions, each in one place:

| Question | Where the answer lives |
|---|---|
| Where have we been? | `git log`, plus the feedback history |
| What is outstanding? | One named index, plus the greppable pending marker |
| What is next? | The current plan file, named explicitly |

Keep AGENTS.md current in the same change as any edit it describes - code,
config, tests, tooling, docs, dependencies. If a change makes a statement in
it stale, fixing that statement is part of the change, not a follow-up.

**The spec** is the binding statement of what is being built, with numbered
sections so briefs and decisions can cite them. It changes only by explicit
amendment, each amendment logged with a version bump. Where a spec section
and the code disagree, that is a finding to record, never something to
silently reconcile in either direction.

**The compliance record** tracks acceptance against the spec and carries the
decision log: a single numbered list, monotonically increasing, no
collisions, recording every deviation and judgment call with its reasoning.
A decision entry says what was decided, why, and what evidence backs it.
Decisions are never renumbered and never deleted; a decision later reversed
gets a new entry pointing back at the old one.

**The pending marker** is one greppable token (e.g. `OWNER-PENDING`) marking
every item waiting on the owner. `grep -n "OWNER-PENDING" <file>` is the
authoritative open-items list, and the count is maintained in exactly one
place. When an item resolves, the marker text is rewritten to a resolved
form ("was `OWNER-PENDING`") so the history stays readable without the item
counting as open.

**The feedback history** is the condensed durable record of every executed
phase: findings, rulings, lessons. Live feedback sheets and executed plan
files are condensed into it and then deleted from the tree - git log keeps
the originals.

**The plans directory** (`docs/plans/`) holds at most the current phase's
plan, named `YYYY-MM-DD-<name>.md`. Executed plans are deleted after merge
as their own commit.

**The evidence directories** (`docs/evidence/<phase>/`) hold the committed
proof for every claim a phase makes: captures, logs, verifier scripts,
and a recipe per task saying how to reproduce each item. Beside them,
`docs/evidence/delegation-ledger.log` is appended by the ledger hook - one
line per subagent spawned, with its type, model and brief - so the record of
who did what on which model is machine-written, not recalled.

## How change phases are executed

Every substantive piece of work is a phase, and every phase follows this
pattern. No exceptions for phases that look small.

1. **A plan file, written before any change.** Per-task briefs carrying
   exact values, verbatim subagent prompts, expected outputs, and STOP
   conditions, under one Global Constraints block. Facts are verified
   DURING planning and pinned into the plan - no assumption survives into
   execution. The executed plan is deleted from the tree after merge as its
   own commit; git log keeps it.
2. **A branch per phase** (or per PR, when a phase ships several). Merged
   with `--no-ff` only on the owner's explicit say, branch deleted after,
   executed-plan removal commit follows. NEVER push without his say. A plan
   may pre-authorize merges on green; then each PR merges itself the moment
   its final review passes and every gate is green.
3. **Subagent-driven execution, complexity-based models.** A FRESH
   implementer subagent per task. Tasks that don't depend on each other run
   at the same time, each in its own git worktree on its own PR branch.
   Tasks that do depend on each other run one after the other. Two tasks
   can run together when they touch different files, neither one uses
   something the other is building (an API and the thing that calls it,
   for example - build the API first, review it, then the caller), neither
   one changes a test count or fixture the other's brief relies on, and
   neither one is a spec change. If the plan can't say for sure, treat
   them as dependent. Work that's genuinely unrelated should run together;
   there's no reason to queue it. Each brief names the tasks it waits on,
   and the plan groups the rest into waves. A branch that ran alongside
   others rebases onto main and re-runs its gates before its final review,
   since main may have moved. Models are chosen by the kind of work:

   | Work | Model |
   |---|---|
   | Reading: files, web pages, logs, anything brought back as context | Sonnet |
   | Straightforward code implementation, where the plan already contains the code or the exact commands | Sonnet |
   | Judgment: derivation, visual QA, anything with unknowns, anything touching the spec | Opus |
   | Review | Opus |
   | Testing | Opus |
   | Scrutiny: verification, re-deriving claims, attack-surface checks | Opus |
   | Hard code implementation | Opus |

   Fable is the orchestrator, never an agent. Always pass a `model` of
   sonnet or opus when spawning; leaving it blank inherits the
   orchestrator's model. If a phase is being orchestrated by anything other
   than Fable, warn the owner once before starting, and continue only if
   he says to. Each task then gets an INDEPENDENT reviewer subagent that
   re-verifies claims against the actual repo rather than trusting the
   implementer's report, with scoped fix loops on findings. The reviewer's
   brief sets its stance: it does not praise or summarise the work
   favourably - its value is in what is wrong or unproven. It checks first
   for drift from the brief, then re-derives every claim, and each finding
   cites the spec section or brief line it fails. For tasks the plan marks
   as touching auth, secrets, payments or untrusted input, the brief also
   covers attack surface: injection, authorisation, secrets handling, trust
   of inputs. Reviews and tests EVERY task, no exceptions, including trivial
   ones. Generated content (art, data, copy) is phase work too: commissioned
   entries are produced by the phase's own agents, staged, and gated by a
   committed verifier - never handed back to the owner to produce. The only
   things that go back to him are verdicts a ruling reserves and the merge
   say, batched into as few asks as the phase allows.
4. **A final whole-branch review on opus**, against the plan
   itself, triaging every deferred or parked ledger item, followed by at
   most ONE fix wave and ONE scoped re-review of that wave.
5. **Gates.** All test suites green at their pinned counts, builds clean at
   zero warnings (any false positive is documented by name, everything
   else is real), and - wherever a claim can be checked mechanically - a
   committed verifier script calibrated against KNOWN results before it is
   trusted. Running is always preferred to reading. If a claim can only be
   run with an environment the agent lacks (a device, a platform,
   credentials, a paid or destructive apply, a third-party service), the
   plan asks the owner for it up front as a ruling, before the phase
   starts. Only his decline allows the fallback to read-only verification
   (see "Evidence"); a claim never silently becomes untested.
6. **Hygiene.** Commits as the owner, no Co-Authored-By trailer, one commit
   per task using the plan's message. No emojis anywhere. Out-of-scope
   findings are RECORDED - decision log or evidence recipe - rather than
   silently fixed. Every doc a change makes stale is updated in the same
   phase, AGENTS.md included.

## Writing the plan

The plan is written for an executing orchestrator who has read AGENTS.md and
nothing else about the phase. Where the plan is silent, AGENTS.md governs;
where they conflict, the orchestrator raises it rather than picking. A good
plan has:

- **An orchestrator prompt up front**: pacing expectations, the agent and
  model rules restated, the phase's specific traps, and the authorization
  state for merges and pushes, naming the decision-log entry any
  pre-authorisation lives in.
- **The owner's input section**: his rulings quoted with their answers, his
  requested changes, and a record of what remains open. Rulings are put to
  him as numbered questions with lettered options and a recommendation;
  his answers become decision-log entries.
- **Task briefs** grouped by PR, each carrying everything the implementer
  needs so it consults nothing outside its brief: exact values, file paths,
  the commit message, the expected test delta, which other tasks it waits
  on (or none), and STOP conditions naming what failure hands back to the
  orchestrator. If two briefs list the same file, they wait on each other.
- **A wave schedule** saying which tasks run together and which wait,
  worked out from the briefs, so the orchestrator isn't deciding this
  mid-run.
- **A global constraints block** restating the standing rules that bind
  every task, and naming which tasks touch auth, secrets, payments or
  untrusted input and so get the attack-surface review.
- **A baseline table** of the gate values as freshly RUN during planning -
  never copied from a document - so the executing agent knows what green
  looked like before its first change.
- **Pinned facts with a drift warning.** Every file path, line number and
  count was true when written and may have moved; the orchestrator
  re-verifies them in its own planning pass before any change.

## Orchestrator conduct during a phase

**Pace for the length of the run.** There is no prize for finishing early,
and every shortcut lands as a defect the owner finds later. Do not skip a
per-task review because the task looked trivial, do not batch several tasks
into one implementer to save time, do not thin the evidence because a change
"obviously" works. The phase is done when it is done.

**Run what can run.** Pacing doesn't mean doing everything one at a time.
If the plan says tasks can run together, start them together. Running
unrelated work in sequence just wastes the owner's time. Everything else
stays the same: each task still gets its own implementer, reviewer,
evidence directory and commit, and two implementers never share a
worktree.

**Show your work.** Maintain a visible task list from the first minute and
keep it current - one entry per task, marked in progress when its
implementer starts and completed only when its reviewer has passed it, not
when the implementer claims done. Announce each task as it starts and each
merge as it lands, with the sha. A silent run is a failed run even if the
code is right.

**Never pause on a blocker.** If something arises only the owner could rule
on - a genuine spec conflict, a gate failure that survives its fix loops, a
generated batch that fails its gate three times - PARK it with a complete
record (what it is, why it stopped, the evidence, and the exact question he
must answer) and continue with every task that does not depend on it. A park
is a paragraph in the report, not a halt. Judgment calls that are not spec
conflicts are the orchestrator's: make them, record them in the decision log
with the reasoning, and move on.

**The one hard stop is moving origin.** Merges and pushes happen on the
owner's say or a pre-authorization the plan records - nothing else. The say
is recorded as a decision-log entry before the push, and the push is run
prefixed `OWNER_SAY=<entry>`; the push guard blocks any push without it. The
prefix is a claim the transcript preserves, not a key: never prefix a push
whose say does not exist.

**Fix loops are bounded.** A reviewer's findings get a scoped fix loop; a
generated batch gets three attempts at its gate and is then parked while the
phase continues. Never grind on one item.

## Evidence

A claim without committed evidence is not done. Every task that changes
something observable produces proof under the phase's evidence directory,
with a recipe section saying how it was produced. The rules that exist
because their absence has cost real phases:

- **Run it if it can be run.** Evidence is the output of exercising the
  change. Where exercising it needs an environment the agent lacks, the
  plan names the claim and asks the owner for the environment as a ruling
  during planning, with what it would take. Only his decline allows the
  fallback below; the agent never decides on its own that a claim cannot
  be run. An ask still unanswered when the phase starts counts as declined
  for that phase, and the ask stays open. A need found mid-phase is put to
  him the same way and the claim is verified by review until he answers.
  Never simulate a run, and never report one that did not happen.
- **Read-only verification is the fallback, not a choice.** For a claim the
  owner has declined to make runnable, the reviewer verifies by reading:
  it traces the change against the spec section it serves and against the
  upstream documentation the brief pins by URL and version, and states the
  behaviour the code would produce. The recipe records it as "verified by
  review, not run": what could not run, the ruling that declined it, the
  docs used, what was traced, and the residual risk. The phase report lists
  every such claim in one place. A claim verified by review stays marked
  that way until something runs it.
- **A BEFORE capture comes off a pure-HEAD build** (stash, rebuild,
  capture, pop - or capture before the edit exists). Once the edit lands,
  the old state is not reconstructible.
- **Never eyeball a measurable claim.** Sample the actual output - the
  pixel, the byte, the number - against the pinned value. Looking right
  proves nothing about what was produced.
- **Capture on a fresh, clean environment.** Persisted state (defaults,
  caches, saves) makes show-once behavior fire in the BEFORE run and
  vanish in the AFTER run, which reads as a regression and is not one.
- **Resolve paths from the toolchain, not by guessing** conventional
  locations.
- **Transient states need burst capture or video**, plus an independent
  confirmation that the mechanism fired (a flag, a log line) - one
  sleep-then-screenshot misses them.
- **Wherever a claim can be checked mechanically, commit a verifier
  script** - and calibrate it against known-good AND known-bad inputs
  before trusting it. A verifier that has never failed on anything has
  proven nothing.

## Generated content

When a phase commissions non-code deliverables (art, datasets, fixtures,
copy), they follow the same discipline as code:

- **Derive the frame before producing the content.** If the deliverable
  depends on dimensions, schemas or transforms still being decided, settle
  those first as their own task. Content produced against a frame in flux
  is content produced twice.
- **Stage first, gate before adoption.** Batches land in a staging area,
  a committed verifier is written and calibrated, and only a passing batch
  is adopted into the live tree.
- **Adopt by file-drop** where possible, leaving manifests and project
  files untouched, and verify adopted copies byte-for-byte against staging.
- **Three attempts per batch, then park it** and carry on.

## Owner input between phases

The owner communicates through a pre-structured feedback sheet the phase
prepares for him: sections for impressions, a tuning table listing every
knob with its shipped value and space for "felt" and "suggested", per-surface
one-liners, and numbered ruling slots with lettered options and a
recommendation each. Blank means nothing to say. Writing an answer in the
sheet is enough - no other channel is needed. When the next phase executes,
the sheet is condensed into the feedback history and deleted.

Distinguish three kinds of ask, and batch them:

- **Rulings** - a decision that shapes work, presented with options and a
  recommendation.
- **Ratifications** - cheap yes/no confirmations of calls already made and
  disclosed.
- **Reserved verdicts** - judgments the owner explicitly kept (an aesthetic
  call, a device pass); the phase stages everything so his verdict is the
  only missing input.

## The traps list

Each project's AGENTS.md keeps a list of things that bite: commands that
destroy state, gates that pass while missing coverage, false-positive
warnings, facts a reader would assume wrongly. Entries are earned - each one
exists because a phase got it wrong - and each states the failure it
prevents, not just the rule. When a phase trips on something new, adding it
to the list is part of the phase.

## What is enforced

Most of this document is prose the agent is trusted to follow. Two things
are enforced mechanically, by the hooks under `~/Github/skills/phase-workflow/hooks/`
wired into the project's `.claude/settings.json` (`hooks/README.md` there has
the wiring and the exact rules):

- **Moving origin.** `git push` and `gh pr merge` - chained, quoted,
  through `git -C`, however written - are blocked unless
  `OWNER_SAY=<decision-log entry>` precedes the command. A guard cannot tell
  a real say from an invented one; what it does is make the rule impossible
  to forget and put the claimed authority in the transcript beside the push.
  Fails closed.
- **The delegation ledger.** Every subagent spawn is appended to
  `docs/evidence/delegation-ledger.log` with its type, model and brief.
  Never blocks; fails open with a note.

The guard is a tripwire over the command text, not a sandbox: indirection
(a script, a Makefile target, `xargs`) is not chased. They catch an agent forgetting a rule,
not one trying to evade it. Each hook states its degraded behaviour (no
python3, unreadable input) in its header, and `hooks/test.sh` runs every
guard against inputs it must block and inputs it must allow - a guard that
has never been seen to block has proven nothing. The hooks are for Claude
Code; a project on another agent tool keeps the rules and loses the guards.
Everything not on this list - per-task reviews, evidence, pinned counts, one
commit per task - is enforced only by the agent reading this document and
the plan.

## Bootstrapping a new project

Do not create the full document set on day one; ceremony without history is
noise. Start with:

1. **AGENTS.md** (or CLAUDE.md) with the orientation table, pointing at
   what exists.
2. **A spec**, however short, with numbered sections.
3. **`docs/plans/`** and the first plan file.
4. **A decision log** (in the compliance record or standalone), started at 1.
5. **The hooks**, wired into `.claude/settings.json` from
   `hooks/settings.example.json`, before the first phase runs.

Add the feedback sheet when the owner first has something to try, the
evidence directory when the first phase makes its first claim, the pending
marker when the first item waits on the owner, and the feedback history when
the first sheet is executed. The traps list starts empty and stays empty
until something bites.

