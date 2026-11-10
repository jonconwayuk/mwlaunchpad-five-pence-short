# H2 fixes, for the orchestrator to assign

Found walking items 17 to 19 on 10 Nov at about 11:40 to 11:46, on HEAD 08a5e93 (item 18 and its follow-ups included). None blocks the demo. All new steps passed. Listed in order of how much each matters on stage.

## 1. The manager's reply says "I will reply here" just after the chat says it went to Teams

- **Where:** `src/ui/components/chat/HelpChat.tsx:150`
- **Failure:** The handover card says "Handing this to Hannah Price in Microsoft Teams" and "Sent to Hannah Price in Microsoft Teams.", then Hannah's reply bubble says "Thanks, I have your question: "...". I will reply here." "Here" contradicts item 19: the conversation has moved to Teams.
- **Suggested fix:** Change the line to "Thanks, I have your question: "{m.question}". I will reply in Teams." One string, no test change expected. Grep the tests for "I will reply here" first.

## 2. Demo controls start on Alex Morgan, not the Person chosen in the top strip

- **Where:** `src/ui/components/demo-controls/DemoControls.tsx:12` (`useState(data.starters[0]?.id ?? '')`)
- **Failure:** With Person set to Bob Warwick in the top strip, Demo controls still show Alex Morgan, and the button reads "Complete Alex's inputs". The presenter has to choose Bob in Demo controls before Plus 3 weeks, "Complete Bob's inputs" and "ServiceNow: request complete" (ServiceNow is disabled for Alex). It's easy to press the wrong person's control on stage. The script now tells the presenter to choose Bob first.
- **Suggested fix:** Start the Demo controls person on the strip's `persona` cookie (`src/lib/persona.ts:12`) when that Person is in `data.starters`, falling back to `data.starters[0]`. Pass it from `app/portal/layout.tsx:28`.

## 3. On an open Joiner view the banner can take nearly the full 3 seconds

- **Where:** `src/lib/useLiveState.ts:34` (`setInterval(tick, 2500)`)
- **Failure:** Not a failure as walked: switching View to Joiner fetches at once, and the banner showed 616 ms after the press. But when ServiceNow completes while Bob's view is already open (the same request sent from outside the page), the banner took 2,546 ms. The worst case is the 2.5 s poll plus one request, which can go over the 3 s promise on a slow laptop or network.
- **Suggested fix:** Poll every 1500 ms (B1 allows polling), or also refetch on `visibilitychange` and `focus`. Check `useTeam.ts:38` (3000 ms) for the same reason.

## 4. The "I'm not sure" reply doesn't name an agent

- **Where:** `src/ui/components/chat/HelpChat.tsx:135` (`case 'none'`)
- **Failure:** Item 19 asks to "see which agent answers". A scripted answer shows "Answered by IT setup helper". The fallback shows no agent, and the handover then says "Handed over by Handover agent". Fine for the demo, because the script asks the laptop question first, but the two lines don't match.
- **Suggested fix:** Optional. Add "Answered by Handover agent" under the fallback bubble, so the same agent answers and hands over.

## Not reproduced (dev server only, no fix)

- Once, a View switch to Joiner from `/portal/people/person-bob` didn't navigate within 15 s. In two retries it navigated in 250 ms. Another agent's edits were recompiling the dev server at the time.
- Once, a synthetic `el.click()` on the Pathways nav link from the Journey builder didn't navigate. A real mouse click did. The walk uses real mouse events for Studio navigation (`steps/rc.mjs`).
