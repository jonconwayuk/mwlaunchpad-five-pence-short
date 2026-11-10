# F1 evidence: config as code, grades and Bob

All captures were run against a throwaway database and dev server (port 3091), both deleted afterwards.

| Claim | Evidence | Run or reviewed |
| --- | --- | --- |
| Every seeded Journey is a validated file in `journeys/` (21 files), seed reads them | `src/db/files.test.ts` "loads every file", whole suite 111 passing (was 102) | Run |
| A bad file is rejected (bad grade, unknown connector operation, id not matching file name) | `files.test.ts` "rejects the folder" | Run |
| Sync adds a new file and versions a changed one; builder publish writes a file back | `files.test.ts` sync and write tests | Run |
| Reseed is deterministic | Two `npm run seed` runs gave the same `sqlite3 .dump` hash; `files.test.ts` "identical data, when run twice" | Run |
| Persona A unchanged: Pre-employment checks waiting 18 days, Usual Range 21 to 35 | `person-a-starter-state.txt` | Run |
| Bob: apply `pw-infra-e`, advance 21 days, line-manager view shows the headline moments | `apply-bob.txt`, `clock.txt`, `bob-line-manager-after-21-days.json`; `files.test.ts` "Bob's story" | Run |

## Grade mapping (old to A to G)

| Old grade | New | Who |
| --- | --- | --- |
| Colleague | B | Persona A, Tom Evans, Branch colleague Pathway |
| Colleague (software engineer, executive assistant) | C | Persona B, Jo Patel, Lena Brooks, Software engineer Pathway |
| Manager | D | Priya Shah, Chris Lee, HR Partner, Leo Grant (new) |
| Senior manager | E | Bob Warwick (new), Infrastructure engineer E Pathway |
| (new) | F | Hannah Price |
| Executive | G | Persona C, Ruth King, Mark Allen, Executive Pathway |

A is unused by the seeded people but in the fixed list. History samples use grades B to F.

Business area in history and `insightsData()` is the past starter's job family (the Pathway's `jobFamily` tag).
