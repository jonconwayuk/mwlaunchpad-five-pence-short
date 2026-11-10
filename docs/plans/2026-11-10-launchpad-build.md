# Phase plan: Launchpad build (10 Nov 2026)

`BUILD-PLAN.md` (commit 1c782c8) is this phase's plan. It is agreed and executable (decision 9). Waves A to E run in order, and the tasks inside a wave run in parallel, made safe by its section 6 file ownership (decision 10). Work is on `main`, and the owner has authorised a push at the end of each green wave (decision 11).

Hard freeze is at 11:00. All work stops at 10:58. If a wave overruns, cuts come from `BUILD-PLAN.md` section 8, top first, and each cut is recorded in `docs/decisions.md`.

## Gates

The gate is `npm run check` (`tsc --noEmit && eslint . && vitest run`) at every task, plus `npm run build` at each wave gate (decision 12).

## Baseline, as actually run

| When | Command | Result |
| --- | --- | --- |
| 09:02, before wave A | `npm run check` | Not runnable. There is no `package.json` yet, so npm exits with `enoent`. Wave A creates the scripts. |
| 09:05, wave A gate | `npm run check`, `npm run build` | Green, with 0 tests (`passWithNoTests`). See `docs/evidence/launchpad-build/A1/gate.txt` |
| 09:17, wave B gate | `npm run check`, `npm run build` | Green. **Pinned: 55 Vitest tests.** See `docs/evidence/launchpad-build/wave-gates/wave-B.txt` |
| 09:34, wave C gate | `npm run check`, `npm run build` | Green, 60 tests. `wave-gates/wave-C.txt` |
| 09:53, wave D gate | `npm run check`, `npm run build` | Green, 81 tests. `wave-gates/wave-D.txt` |

The pinned Vitest count is set at the wave B gate, from B1's test total, and recorded in the evidence for each wave after that.
