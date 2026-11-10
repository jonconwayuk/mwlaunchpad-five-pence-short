Recipe: `DATABASE_URL=file:/tmp/c1.db npm run seed`, then `DATABASE_URL=file:/tmp/c1.db NEXT_DIST_DIR=.next-c1 npx next dev -p 3041`.
Run `curl "localhost:3041/api/state?personId=person-a&as=starter|buddy|line-manager"`, then POST /api/actions (see post-ok.txt, post-bad.txt).
Outputs here are trimmed; the filter tests are in src/lib/roleFilter.test.ts.
