# C3 evidence: Manager and Buddy view, Additions, Needs decision

1. `rm -f /tmp/c3.db && DATABASE_URL=file:/tmp/c3.db npm run seed`, then `DATABASE_URL=file:/tmp/c3.db NEXT_DIST_DIR=.next-c3 npx next dev -p 3043`.
2. Run the curl calls shown in `curl-output.txt` (Addition by lm-chris, Buddy filter check, hs-deadline confirm); output is saved there.
3. `node docs/evidence/launchpad-build/B3/shoot.mjs "http://localhost:3043/team?viewer=lm-chris" team-lm-390.png` (and `viewer=buddy-jo`), taken after step 2.
