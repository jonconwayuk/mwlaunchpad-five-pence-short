# Demo script

This is for whoever runs the demo on stage. It needs three people: **HR** on the laptop, and **Phone A** and **Phone B**, each holding a phone. Every page shows a "Simulated date" strip, which is the Demo clock, not today.

## Before you start

1. On the laptop, in the repo, run `npm run seed && npm run build && npm start`.
2. Put both phones on the same wifi as the laptop. Find the laptop's address and use it wherever this script says `<laptop-ip>` (for example `10.198.169.84`).
3. Open these:
   - Laptop: `http://<laptop-ip>:3000/portal` (the Admin Portal)
   - Phone A: `http://<laptop-ip>:3000/persona/A`, which opens Alex Morgan's view (branch colleague)
   - Phone B: `http://<laptop-ip>:3000/persona/B`, which opens Sam Okafor's view (software engineer)
   - Spare persona: `/persona/C` is Dana Whitfield (executive)
   - Line Manager view: `/team?viewer=lm-chris` (Chris Lee, Sam's manager) or `/team?viewer=lm-priya` (Priya Shah, Alex's manager)
4. Click **Reset demo** in the Admin Portal header. Do this just before you go on.

**If anything goes wrong at any point:** click Reset demo in the Admin Portal header, refresh both phones and carry on from the beat you were on.

## The beats

**1. Build a Pathway** *(after wave D lands)*. HR, on the laptop.
- Open `/portal/pathways` and click a Pathway to open the canvas.
- Drag a Journey from the library onto its lane, then draw a Dependency from one Journey to another. Next, try to draw one back the other way: the canvas refuses it in plain English. Set one Journey as mandatory, then click Publish.
- The audience sees the Pathway built by hand, and the loop refused.
- If it goes wrong: skip ahead to beat 2. Nothing later in the demo depends on this beat.

**2. Filter and apply.** HR, on the laptop.
- On `/portal/pathways`, filter by Job family to show "Branch colleague", then by "Software engineering".
- Open People (`/portal/people`), click Alex Morgan, and show that the Applied Pathway is Branch colleague. Then do the same for Sam Okafor, whose Applied Pathway is Software engineer.
- **Do not click Apply again for Alex or Sam.** Reset demo has already applied these Pathways. Applying again today wipes Alex's progress, and that breaks beats 5 and 6. To show the apply step, apply a Pathway to Dana (C) instead.
- If it goes wrong: Reset demo.

**3. Two phones, two packs.** Phone A and Phone B, held up side by side.
- The audience sees two different packs built from the same Journey library: Alex has Branch device and Uniform, and Sam has Developer device and Engineering community intro.
- If it goes wrong: open `/persona/A` or `/persona/B` again on that phone.

**4. The Line Manager adds a Journey.** Laptop or a third phone, plus Phone B.
- Open `/team?viewer=lm-chris`. Under Sam Okafor, click **Add a journey**, choose "Payments squad access package", set it to unlock after "Cleared to start" and make it mandatory. Save.
- Phone B shows the new Journey within about three seconds. The "Added by Chris Lee" label shows on the phone only *(after wave D lands)*.
- Chris's view may already show a Needs decision for Sam ("Pre-employment checks not done in time"). Ignore it for now, or explain that it's a Hard Stop.
- If it goes wrong: refresh Phone B.

**5. The honest wait.** Phone A.
- Alex's phone shows "Day 18 of your wait" against "Usually 21 to 35 days", with nothing needed from Alex.
- If it goes wrong: Reset demo, then refresh Phone A. Beat 2 may have re-applied the Pathway.

**6. A failed vetting.** HR on the laptop, Phone A, and `/team?viewer=lm-priya`.
- In the Demo controls in the Admin Portal header, choose "Alex Morgan: Pre-employment checks" and click **Simulate failed**.
- Priya's view and Alex's people page both show a Needs decision. Click Confirm on Alex's people page and give a reason.
- The audience sees the Journeys that stop marked as Cancelled on Phone A *(after wave D lands)*. Today Alex's phone changes before you confirm, and the stopped Journeys say "Stopped", so don't point at Phone A until you have clicked Confirm.
- If it goes wrong: Reset demo.

**7. Day 14 Pulse check.** HR on the laptop, Phone B, and `/team?viewer=lm-chris`.
- Reset demo first if you ran beat 6. In the Demo controls, choose Sam Okafor and click **Day 14**.
- Phone B shows a Pulse check. Answer 2 to each question.
- Chris's view shows a Task: "Sam scored 2 ... Have a chat." The Simulated date strip shows the same date on all three faces.
- If it goes wrong: Reset demo, then click Day 14 again.

**8. Reset.** HR, on the laptop.
- Click **Reset demo**. Both phones go back to where they were at the start within a few seconds.
