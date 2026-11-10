Recipe: `DATABASE_URL=file:./b2test.db npm run seed` (twice), then `sqlite3 b2test.db .dump | shasum` after each run.
`seed-determinism.txt` shows both hashes equal; `engine-input-person-a.json` is `inspect.ts` output (trimmed `buildEngineInput('person-a')`
plus the Usual Range of Pre-employment checks, 21 to 35). Delete `b2test.db*` afterwards; no .db file is committed.
