Run: `DATABASE_URL=file:/tmp/c2.db npm run seed`, then `DATABASE_URL=file:/tmp/c2.db NEXT_DIST_DIR=.next-c2 npx next dev -p 3042`.
Proof: proof-1.txt and proof-2.txt are curl outputs (apply, backward clock rejected, Simulate passed unlocks ID creation, Reset restores the seeded state).
Screenshot: `node shoot.mjs http://localhost:3042/portal/people/person-a people-person-a-1280.png` (headless Chrome, 1280 wide).
