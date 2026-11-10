# Wave G follow-ups, workstream 2
Ran: `npx vitest run` (all pass), `npx eslint` on the owned paths with `--max-warnings 0`, and tsc scoped to those paths (empty).
New tests: unknown person is 404; laptop phrasings route to the IT setup helper; syncSummary shows skipped; cancelled item gives "Plan stopped.".
The Teams-card failure path and the "Add a reason to choose" hint are UI-only and were not browser-tested.
