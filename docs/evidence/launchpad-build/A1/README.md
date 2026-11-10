# A1 evidence

Recipe: `npm run check; npm run build` from the repo root, output in `gate.txt` (run by the orchestrator at 09:05).
Contract check: `diff` of the `types.ts` and `loops.ts` blocks in BUILD-PLAN.md sections 4.2 and 4.4 against the files: identical, apart from the three bodiless signatures (decision 14).
`curl localhost:3000/api/state` returned the fixture under `next dev` (reported by the implementer, re-checked by the A1 reviewer).
