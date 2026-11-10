# Demo script

This is for whoever runs the demo on stage. It needs three people: **HR** on the laptop, and **Phone A** and **Phone B**, each holding a phone. Every page shows a "Simulated date" strip, which is the Demo clock, not today.

## Before you start

1. On the laptop, in the repo, run `npm run seed && npm run build && npm start`.
2. Put both phones on the same wifi as the laptop. Use the laptop's address wherever this says `<laptop-ip>`.
3. Open these:
   - Laptop: `http://<laptop-ip>:3000/portal` (the Onboarding Studio)
   - Phone A: `http://<laptop-ip>:3000/persona/A` (Alex Morgan, branch colleague)
   - Phone B: `http://<laptop-ip>:3000/persona/B` (Sam Okafor, software engineer)
   - Line Manager: `/team?viewer=lm-chris` (Chris Lee, Sam's manager) or `/team?viewer=lm-priya` (Priya Shah, Alex's manager)
4. Click **Reset demo** in the Onboarding Studio just before you go on.

**If anything goes wrong:** click Reset demo, refresh both phones and carry on from the beat you were on.

## The beats

**1. Build a Pathway.** HR, laptop.
- Open `/portal/pathways`, click "Software engineer". Drag a Journey from the library onto its lane (or click its **Add**). Draw a Dependency, then try one back the other way: the canvas refuses it in plain English. Set one Journey mandatory, click **Publish**: the header shows the new live version.
- Known: the two Pulse check cards say "Day 13" and "Day 29"; they are Day 14 and Day 30. Don't read those labels out.
- If it goes wrong: skip to beat 2. Nothing later depends on it, and Reset demo undoes the edits.

**2. Filter and apply.** HR, laptop.
- On `/portal/pathways`, filter Job family to "Branch", then "Software engineering".
- Open People, click Alex Morgan, click **Apply pathway** on "Branch colleague". Do the same for Sam Okafor with "Software engineer". Applying again keeps their progress.

**3. Two phones, two packs.** Hold Phone A and Phone B up side by side: Alex has Branch device and Uniform, Sam has Developer device and Engineering community intro.

**4. The Line Manager adds a Journey.** `/team?viewer=lm-chris`, plus Phone B.
- Chris already has a Needs decision for Sam, "Pre-employment checks not done in time". Say it's a Hard Stop and leave it; don't click its **Confirm**.
- Under Sam Okafor, click **Add a journey**, choose "Payments squad access package", Unlock "After Cleared to start", tick Mandatory, click the **Confirm** at the bottom of that form.
- Phone B shows it within about a second, labelled "Added by Chris Lee".

**5. The honest wait.** Phone A shows "Day 18 of your wait" against "Usually 21 to 35 days", with nothing needed from Alex.

**6. A failed vetting.** HR, Phone A, `/team?viewer=lm-priya`.
- In Demo controls choose "Alex Morgan: Pre-employment checks", click **Simulate failed**.
- Priya's view and Alex's people page show a Needs decision. Point at Phone A: nothing has changed for Alex.
- On Alex's people page type a reason (required), click **Confirm**. Phone A now says only "Your recruiter will be in touch." The portal lists the stopped Journeys as "Stopped" (the glossary word is Cancelled).
- Optional: Reset demo, fail again, type a reason and click **Dismiss**: Alex moves on to ID creation.

**7. Day 14 Pulse check.** HR, Phone B, `/team?viewer=lm-chris`.
- Reset demo first if you ran beat 6. In Demo controls choose Sam Okafor, click **Day 14**. Give the strip a moment to update.
- Phone B shows a Pulse check. Answer 2 to each question. Chris's view shows "Sam scored 2 ... Have a chat." Sam never sees it. All faces show the same Simulated date.

**8. Reset.** Click **Reset demo**. Both phones and the canvas go back to the start within a few seconds.
