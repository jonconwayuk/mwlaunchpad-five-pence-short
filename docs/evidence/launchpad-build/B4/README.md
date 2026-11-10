1. `NEXT_DIST_DIR=.next-b4 npx next dev -p 3014`, then `curl -s -o /dev/null -w "%{http_code}" http://localhost:3014/portal/pathways/branch-colleague` returns 200.
2. `node docs/evidence/launchpad-build/B4/drive.mjs http://localhost:3014/portal/pathways/branch-colleague` drives headless Chrome over DevTools and writes `drive-result.txt` (six PASS lines) and `after-drive.png`.
3. `npx vitest run src/ui/components/canvas` runs the pure helper tests (lane snap, loop message, reducer, fixture snapshot); `canvas.png` is the first render.
