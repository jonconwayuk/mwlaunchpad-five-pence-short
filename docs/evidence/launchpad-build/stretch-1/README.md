Stretch 1 (Timer and Hard Stop authoring on the canvas): `drive.mjs` is final-fix/drive.mjs plus section 10 (add a Timer, refuse a negative offset off the start date, make Payroll wait for it, autosave, reload, refuse removal); run on a freshly seeded db at port 3088.
`drive-result.txt`: 25 PASS, 0 FAIL (all 20 existing checks plus 5 new); `timer-1280.png` shows the Timer side panel at 1280; the other PNGs are the existing checks' captures.
`check.txt`: `npm run check` (tsc, eslint ., vitest) green, 102 tests; model.test.ts adds 8 reducer tests for Timers and Hard Stops.
