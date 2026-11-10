# E1 sweeps

## 1. npm audit --omit=dev (full output: audit-prod.txt)
Result: 2 vulnerabilities (1 moderate, 1 high, 0 critical). The high is postcss <=8.5.22 (four advisories: XSS via unescaped style end tag, and sourceMappingURL file reads), bundled at node_modules/next/node_modules/postcss. The moderate is next, which pulls it in. Runtime path: yes by listing, but postcss only processes CSS at build time here (no attacker-controlled CSS), so it is not reachable at runtime. The only fix is next@16.4.6, a breaking change.
Verdict: one high, no critical. Needs an exception in docs/decisions.md (not edited by me).

## 2. npm audit (full output: audit-all.txt)
Result: 8 vulnerabilities (7 moderate, 1 high, 0 critical). The high is the same postcss. The extra moderates are the @typescript-eslint chain (dev tooling, not in the runtime path).
Verdict: same single high exception; dev-only moderates need no action.

## 3. grep -rn "console.log\|new Date()\|: any\|as any" src app (excluding src/lib/clock.ts, src/db/seed.ts)
Result: one hit, src/ui/components/canvas/PathwayCanvas.tsx:212, which is UI text (`{list.label}: any`), not a type.
Verdict: clean. No console.log, no real clock, no any types.

## 4. grep -rniE "lloyds|@[a-z0-9.-]+\.(com|co\.uk|net|org)" src app docs README.md
Result: no hits.
Verdict: clean.

## 5. GUID scan of tracked files (package-lock.json excluded)
Result: no hits.
Verdict: clean.

## 6. Ignore rules
`git check-ignore .env launchpad.db` printed both names (both ignored). `git ls-files | grep -E "\.db$|\.env$"` printed nothing.
Verdict: clean.
