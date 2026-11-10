# B1 Pathway engine evidence
Run `npx vitest run src/engine > vitest.txt` (36 tests pass) and the two greps in `grep.txt`.
The literal grep only matches the contract field `nextUp` and a loop variable `next`; the import grep is empty.
