# Demo script: Bob's first weeks

For whoever runs the demo on stage. One laptop, **one browser window**. The black strip at the top of every page is the switcher: **View** (Onboarding Studio, Joiner, Manager, Buddy), **Person** and **Layout** (Phone or Desktop). Next to it, "Simulated date" is the Demo clock, not today. Our story is Bob Warwick, a Modern Workplace infrastructure engineer at grade E.

## Before you start

1. In the repo: `npm run seed && npm run build && npm start`, then open `http://localhost:3000/portal` (the Onboarding Studio).
2. Keep a terminal open in the repo. Step 1 adds a file to it.
3. Set Person to **Bob Warwick** and Layout to **Phone**, so the joiner, manager and buddy views show in a phone frame.
4. Click **Reset demo** (left panel, at the bottom of Demo controls) just before you go on.

**Demo controls have their own person list**, and it starts on Alex Morgan, not on the Person in the top strip. Choose **Bob Warwick** there before pressing any Demo control. The button labels then read "Bob" ("Complete Bob's inputs").

**If anything goes wrong:** click **Reset demo**, set View to Onboarding Studio and carry on from the step you were on. Reset doesn't remove a Journey file you added, so a Journey added in step 1 stays (see step 9).

## The nine steps

**1. Journeys live in the repo.** Studio > **Journeys** > **New journey**.
- Point at **Connected repository**: this repository, branch main, folder `journeys/`.
- In the terminal, copy one in: `cp docs/demo/j-h-demo.json journeys/` ("Service desk tools access"). Click **Sync from repository**. You see "Last sync ... 1 added". Open **Journeys**: it's in the library (23 Journeys).
- Open it. On the Hidden automation Action "Service desk tools request", set Connector to **ServiceNow** and Operation to **Request a team access package**. Click **Publish** > **New content**. **View as code** shows the file with `"semver": "1.1.0"` and the connector.

**2. Build Bob's Pathway.** Studio > **Pathways** > **Infrastructure engineer E**.
- In the canvas Library, set **Any stage** to Onboarding and **Any grade** to Grade E. "Service desk tools access" is listed. Journeys with no grade tag are for everyone, so they stay listed.
- Drag it onto its lane (or click its **Add**). Drag from the dot on the right of **Lab environment** to the new card: that's a Dependency.
- Now drag from the new card's dot to **Privileged access request**. It's refused in plain English: "... already waits for ..., so ... cannot wait for ...". Click **Got it**.
- Click **Publish** > **New content**. The header shows "Live version 1.1.0".

**3. HR applies it.** Studio > **People**. Type "Bob" in Find a person and open **Bob Warwick**.
- "Infrastructure engineer E (suggested)" is already chosen. Click **Apply pathway**. The heading shows "version 1.1.0".
- **Add a delegate** > Lena Brooks > **Save delegate**: "Lena Brooks can act for this person."
- *Optional, to skip Bob's form-filling and go straight to the agents:* in Demo controls choose **Bob Warwick**, then click **Complete Bob's inputs**. You see "Completed 5 Actions": everything waiting on Bob, done with synthetic answers through the normal rules. It never touches automations, other people's Tasks or a Needs decision. If you do this, skip Bob's paperwork in step 5.

**4. Bob's view, and his help chat.** Switch View to **Joiner**.
- His pack runs from Contracting to the Pulse checks, and includes the new Journey and **Equipment request** (waiting on ServiceNow). **Need help?** is on his first screen, whatever he still has to do.
- Switch View to **Onboarding Studio**. In Demo controls choose Bob Warwick and click **Plus 3 weeks**. Switch back to **Joiner**. The card says "Privileged access request ... Day 14 ... Usually 19 to 28 days": an honest wait, with nothing for Bob to do. Equipment request now says "This is taking longer than usual" (it usually takes 5 to 11 days). That's expected.
- **Need help?** > "When will my laptop arrive?" gets a scripted answer, and underneath it says which agent answered: "Answered by IT setup helper".
- Type "Can I talk to someone about my lab budget?" > **Ask**. The answer is "I'm not sure. Would you like to talk to a person?" Click **Talk to a person**. The chat says "**Handing this to Hannah Price in Microsoft Teams**", "Handed over by Handover agent" with what Bob asked, then "Sent to Hannah Price in Microsoft Teams." The small text says it's simulated: no message is sent to Teams.

**5. Hannah, his manager.** Switch View to **Manager** (Person stays Bob; that's Hannah Price's view).
- In her To-do: "Bob Warwick asked for help: Can I talk to someone about my lab budget?", marked "**From a Teams chat**, handed over by Handover agent". Her progress line for Bob is below.
- Click **Add a journey**, choose "Modern Workplace team access package", Unlock "After Cleared to start", then **Add journey**. Switch to **Joiner**: it's there, "Added by Hannah Price". We measured 1.5 seconds, including the switch.
- Back on **Manager**: pick "Have a look at the company car scheme" > **Send a Reminder now**. You see "Reminder sent to Bob Warwick", and Bob sees it on Joiner.
- On **Joiner**, Bob does his paperwork (skip this if you used Complete Bob's inputs): Contracting **Got it**, type a name in Sign your contract > **Submit**, type anything in Pre-employment checks > **Submit**. The card reads "with our vetting partner".
- **Onboarding Studio** > Demo controls: choose "Bob Warwick: Pre-employment checks" > **Simulate failed**. Bob's view doesn't change. On **Manager**, Hannah has a **Needs decision**, "Pre-employment checks failed". Type a reason (it's required) and click **Dismiss**. Bob's checks show Done, and he moves on to ID creation.

**6. Leo, his buddy.** Switch View to **Buddy**. Leo sees only that Bob is in Pre-employment, "Nothing to do right now", and a note box. He doesn't see the failure, the help question or the Reminders.

**7. ServiceNow tells Bob his equipment is ready.** **Onboarding Studio** > **Journeys** > **Equipment request**.
- The **Integrations (simulated)** section: Connector **ServiceNow**, Operation **Raise an equipment request**, and in plain words: "When ServiceNow reports the request complete, notify the joiner." The second Action is the Notification that does it.
- In Demo controls, with **Bob Warwick** chosen, click **ServiceNow: request complete**. Switch View to **Joiner**. At the top of Bob's screen, with no scrolling: "New for you ... Your equipment request is complete. ServiceNow has confirmed it (simulated)." Equipment request shows Done. We measured 0.6 seconds from the click, including the switch.

**8. Insights.** **Onboarding Studio** > **Insights**.
- How long each Pathway takes, across 80 past starters (synthetic).
- Which Pathways take longer, and where: "Managing director starters in Executive take longest".
- Switch **Business area**, **Role**, **Grade**. Click **Pre-employment checks** to drill down: "usually 21 to 35 days". Click a Stage button to filter.

**9. Reset.** Delete the step 1 file in the terminal (`rm journeys/j-h-demo.json`), then click **Reset demo**. Everything goes back to the start: 10 Nov, version 1.0.0, 22 Journeys, Bob with no Pathway, no Delegate and no completed inputs.

## Avoid on stage

- **The Needs decision's Confirm.** Sam Okafor (Chris Lee's starter) has one seeded at reset. Leave it alone. In step 5 use **Dismiss** with a reason, not Confirm, unless you mean to stop Bob's Pathway.
- **Pressing a Demo control for the wrong person.** Demo controls start on Alex Morgan. Check the person list says Bob Warwick, and that the button reads "Complete Bob's inputs", before you click. "ServiceNow: request complete" is greyed out for anyone with nothing waiting on ServiceNow.
- **Doing Bob's paperwork after Complete Bob's inputs.** There's nothing left to fill in, so go straight to Simulate failed.
- **Reset demo doesn't change the Person.** Set Person back to Bob Warwick after a Reset if you switched to someone else.
- **Resetting before deleting the step 1 file.** If you forget, "Service desk tools access" stays in the library at 1.1.0. It's harmless, but run `rm journeys/j-h-demo.json` afterwards.
- **Saying "drag" is tested with a mouse.** Our automated runs used synthetic drag events. Try the real drag on the demo laptop first (flaky until someone has).
- **Plus 3 weeks** is three weeks from Bob's offer (3 Nov), so it lands on 24 Nov, and the card says Day 14 of the wait. Say "two weeks into a three-to-four week wait", not "three weeks".
- **Leaving Bob's view open and waiting for ServiceNow.** Switching to Joiner after the click shows the message at once. Left open, it can take up to about 3 seconds.
- **Hannah's reply in the chat says "I will reply here".** The handover went to Teams. Talk over it, or say "in Teams" (a fix is listed).
- Don't call anything live AI, a real Teams chat or a real ServiceNow call. The help chat is scripted. The Microsoft Teams handover and the ServiceNow request are simulated: nothing is sent to Teams or ServiceNow, and the screens say "Simulated".
