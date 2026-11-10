# Demo script: Bob's first weeks

For whoever runs the demo on stage. One laptop, **one browser window**. The black strip at the top of every page is the switcher: **View** (Onboarding Studio, Joiner, Manager, Buddy), **Person** and **Layout** (Phone or Desktop). Next to it, "Simulated date" is the Demo clock, not today. Our story is Bob Warwick, a Modern Workplace infrastructure engineer at grade E.

## Before you start

1. In the repo: `npm run seed && npm run build && npm start`, then open `http://localhost:3000/portal` (the Onboarding Studio).
2. Keep a terminal open in the repo. Step 1 adds a file to it.
3. Set Person to **Bob Warwick** and Layout to **Phone**, so the joiner, manager and buddy views show in a phone frame.
4. Click **Reset demo** (left panel, at the bottom of Demo controls) just before you go on.

**If anything goes wrong:** click **Reset demo**, set View to Onboarding Studio and carry on from the step you were on. Reset doesn't remove a Journey file you added, so a Journey added in step 1 stays (see step 8).

## The eight steps

**1. Journeys live in the repo.** Studio > **Journeys** > **New journey**.
- Point at **Connected repository**: this repository, branch main, folder `journeys/`.
- In the terminal, copy one in: `cp docs/demo/j-h-demo.json journeys/` ("Service desk tools access"). Click **Sync from repository**. You see "Last sync ... 1 added". Open **Journeys**: it's in the library (22 Journeys).
- Open it. On the Hidden automation Action "Service desk tools request", set Connector to **ServiceNow** and Operation to **requestAccessPackage**. Click **Publish** > **New content**. **View as code** shows the file with `"semver": "1.1.0"` and the connector.

**2. Build Bob's Pathway.** Studio > **Pathways** > **Infrastructure engineer E**.
- In the canvas Library, set **Any stage** to Onboarding and **Any grade** to Grade E. "Service desk tools access" is listed. Journeys with no grade tag are for everyone, so they stay listed.
- Drag it onto its lane (or click its **Add**). Drag from the dot on the right of **Lab environment** to the new card: that's a Dependency.
- Now drag from the new card's dot to **Privileged access request**. It's refused in plain English: "... already waits for ..., so ... cannot wait for ...". Click **Got it**.
- Click **Publish** > **New content**. The header shows "Live version 1.1.0".

**3. HR applies it.** Studio > **People**. Type "Bob" in Find a person and open **Bob Warwick**.
- "Infrastructure engineer E (suggested)" is already chosen. Click **Apply pathway**. The heading shows "version 1.1.0".
- **Add a delegate** > Lena Brooks > **Save delegate**: "Lena Brooks can act for this person."

**4. Bob's view.** Switch View to **Joiner**.
- His pack runs from Contracting to the Pulse checks, and includes the new Journey.
- Switch View to **Onboarding Studio**. In Demo controls choose Bob Warwick and click **Plus 3 weeks**. Switch back to **Joiner**. The card says "Privileged access request ... Day 14 ... Usually 19 to 28 days": an honest wait, with nothing for Bob to do.
- **Need help?** > "When will my laptop arrive?" gets a scripted answer from the IT setup helper. Type "Can I talk to someone about my lab budget?" > **Ask**, then **Talk to a person**. You get the Simulated Teams handover: "Hannah Price will pick this up in Teams."

**5. Hannah, his manager.** Switch View to **Manager** (Person stays Bob; that's Hannah Price's view).
- Her progress line for Bob, and his help question in her To-do.
- Click **Add a journey**, choose "Modern Workplace team access package", Unlock "After Cleared to start", then **Add journey**. Switch to **Joiner**: it's there, "Added by Hannah Price". Left open, Bob's view updates within about 3 seconds; we measured 2.4 seconds.
- Back on **Manager**: pick "Have a look at the company car scheme" > **Send a Reminder now**. You see "Reminder sent to Bob Warwick", and Bob sees it on Joiner.
- On **Joiner**, Bob does his paperwork: Contracting **Got it**, type a name in Sign your contract > **Submit**, type anything in Pre-employment checks > **Submit**. The card reads "with our vetting partner".
- **Onboarding Studio** > Demo controls: choose "Bob Warwick: Pre-employment checks" > **Simulate failed**. Bob's view doesn't change. On **Manager**, Hannah has a **Needs decision**, "Pre-employment checks failed". Type a reason (it's required) and click **Dismiss**. Bob's checks show Done, and he moves on to ID creation.

**6. Leo, his buddy.** Switch View to **Buddy**. Leo sees only that Bob is in Pre-employment, "Nothing to do right now", and a note box. He doesn't see the failure, the help question or the Reminders.

**7. Insights.** **Onboarding Studio** > **Insights**.
- How long each Pathway takes, across 80 past starters (synthetic).
- Which Pathways take longer, and where: "Managing director starters in Executive take longest".
- Switch **Business area**, **Role**, **Grade**. Click **Pre-employment checks** to drill down: "usually 21 to 35 days". Click a Stage button to filter.

**8. Reset.** Delete the step 1 file in the terminal (`rm journeys/j-h-demo.json`), then click **Reset demo**. Everything goes back to the start: 10 Nov, version 1.0.0, Bob with no Pathway and no Delegate.

## Avoid on stage

- **The Needs decision's Confirm.** Sam Okafor (Chris Lee's starter) has one seeded at reset. Leave it alone. In step 5 use **Dismiss** with a reason, not Confirm, unless you mean to stop Bob's Pathway.
- **Reset demo doesn't change the Person.** Set Person back to Bob Warwick after a Reset if you switched to someone else.
- **Resetting before deleting the step 1 file.** If you forget, "Service desk tools access" stays in the library at 1.1.0. It's harmless, but run `git checkout journeys/ && git clean -f journeys/` afterwards.
- **Saying "drag" is tested with a mouse.** Our automated runs used synthetic drag events. Try the real drag on the demo laptop first (flaky until someone has).
- **Plus 3 weeks** is three weeks from Bob's offer (3 Nov), so it lands on 24 Nov, and the card says Day 14 of the wait. Say "two weeks into a three-to-four week wait", not "three weeks".
- Don't call anything live AI, a real Teams chat or a real ServiceNow call. They're scripted or mocked, and the screens say "Simulated".
