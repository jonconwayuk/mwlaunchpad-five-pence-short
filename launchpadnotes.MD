# LaunchPad '26 notes

Captured from https://mwlaunchpad.com/ (extracted from the site's script bundle, 9 Nov 2026). Source of truth for the event is the site, so re-check it if anything here looks out of date.

## Event

- LaunchPad '26, Modern Workplace Engineering hackathon at Lloyds Banking Group, Edition 02.
- 9–10 November 2026, Floor 10 Event Space, Wellington Place, Leeds. Enter through the building 12 reception and take the lifts; floor 10 is not reachable from building 11.
- Teams of 3–5, self-organising. A captain is optional but recommended and is the single contact for the mentor.
- Each mentor covers two teams across both days. Mentors support and assess but do not build.

## Challenge

Design and build a mobile-first companion that takes a new joiner from unconditional offer to feeling connected and confident by Day 30.

The brief is a problem space, not a spec. The reference journey and prompts give context. Good solutions address some of them; great solutions might reframe them.

Why the site says this matters: vetting and screening mean weeks or months between offer and first day, and the first 30 days decide whether someone settles or drifts. Workday records the joining process but does not guide anyone through it.

### Reference journey: six stages

A reference journey, not a spec. Chatbot support runs throughout.

| # | When | Stage | What happens | Who |
| --- | --- | --- | --- | --- |
| 01 | Offer | Offer | Recruiter delivers the unconditional offer, gives feedback and sets expectations. Warm handover to the app. | Recruiter, Joiner |
| 02 | Before day one | Unlock & choose | Content unlocks as milestones are hit, by job family, location and software. Pick kit, benefits, pay and rewards, learning. | Joiner |
| 03 | Before day one | Meet your people | Introduced to their line manager and a buddy, with chat. Site, transport and community info for their location. | Joiner, Manager, Buddy |
| 04 | Before day one | Manager ready | Checks done, buddy assigned, device, access and ID badge requested. Three-month goals set: welcome pack sent. | Line manager |
| 05 | From day one | Day 1 to Week 1 | Guided prompts: book stakeholder intros, start mandatory training, find the comms channels. 1:1 with their manager at the end of week one. | Joiner, Manager, Buddy |
| 06 | From day one | Day 30 | Feels well connected and confident in their role. | Joiner |

### Problem-space prompts

Twelve prompts across four groups. Context, not requirements.

**Offer and handover**
1. A warm handover: the recruiter has just delivered good news. What makes the handover to the app feel like a welcome, not another login?
2. Honest progress: vetting takes as long as it takes. What does honest progress look like when there's no news to share?
3. Where am I?: how does someone know where they are in the journey, and what's still between them and day one?

**Before day one**
4. Earned, not withheld: content can unlock as milestones are hit. Which moments should unlock what, so it feels earned rather than withheld?
5. Not the same pack: an engineer in Leeds and a contact centre colleague in Cardiff shouldn't get the same pack. How do job family, location and system access shape what someone sees?
6. Early choices: laptop, benefits, pay and rewards, learning. Which choices can someone make before day one, and what happens once they've made them?

**Manager and buddy**
7. Meet before you meet: how does a new joiner get to know their manager and buddy before they've met, and what makes that chat feel human?
8. What's left?: checks, a buddy, kit, access, a badge, goals. How does a manager know what's left, and what happens when it slips?
9. Chain reactions: setting goals sends the welcome pack. What other moments should one person's action set off for someone else?

**The first 30 days**
10. Guide, don't nag: intro calls, mandatory training, comms channels, a week-one 1:1. How does the app guide without becoming a to-do list?
11. 9pm on a Sunday: a question at 9pm on a Sunday. Who, or what, answers it, and when does it need a person?
12. Did it work?: by Day 30 someone should feel connected and confident. How would anyone know, and what happens if they don't?

## Judging

Five equally weighted categories, each scored 1–10 by mentors against one shared rubric, for a total out of 50.

- **Best Demo:** A working journey, clearly demonstrated.
- **Best Technical Approach:** Defensible architecture, testing and a credible production path.
- **Best UX:** An intuitive mobile journey with useful feedback.
- **Best Feature Fit:** Deliberate choices that address the problem.
- **Most Innovative:** An unexpected approach with demonstrated user value.

Scoring principles from the site:
- Evidence, not volume. Confidence, lines of code, or the amount of AI used do not earn points on their own. What you show and explain does.
- Mentors score evidence of what you built and why.
- Side quests give no automatic bonus. Each one can strengthen evidence in the category it feeds.
- Choosing an unfamiliar stack or using AI earns no bonus.

Kinds of evidence mentors look for, and the question they ask:

| Category | Evidence | Mentor asks |
| --- | --- | --- |
| Best Demo | A working journey shown end to end; tests run; faults found and fixed; what's real and what's simulated made clear. | Show what a joiner can complete now. What is simulated or unfinished? |
| Best Technical Approach | Options and trade-offs explained; data and secrets handled deliberately; tests and AI-generated code checked; integration choices understood. | Why this approach? What alternative did you reject, and how have you checked it? |
| Best UX | Tested on a phone; role and location considered; confusing steps spotted; feedback, errors or accessibility improved. | Where could a joiner become confused? Show what you changed. |
| Best Feature Fit | A specific pain point prioritised; scope choices justified; omissions explained; changes keep the core outcome for the joiner. | What matters most for the joiner? What did you leave out, and why? |
| Most Innovative | An unexpected idea tested and its value demonstrated. | What is different about your approach, and how does it help? |

### Route 1: category awards

Every team is in the running for all five category awards, whether or not it reaches the final. Mentors agree one final score per team at the selection panel (13:30–14:00 on Day 2), and the highest score in each category wins. Category winners are only revealed at 15:30.

Ties are settled on evidence first, then by a panel vote, with reasons recorded.

### Route 2: Best in Show

The top three mentor totals qualify for the final. Finalists are named at 14:00. The final runs from 14:30: each finalist presents for 10 minutes, then answers 3 minutes of judge questions, live or recorded. Judges can ask to inspect the frozen build.

Three judges score the finalists afresh across all five categories and average each one across the panel. Mentor scores do not carry forward. Judges do not see mentor scores or ranks.

### Mentor checkpoints and walkthrough

- D1 12:00: checkpoint 1, problem and approach.
- D1 15:30: checkpoint 2, progress and decisions.
- D2 10:15: checkpoint 3, working journey.
- Each checkpoint is 10 minutes per team. Checkpoint scores are provisional and are not added or averaged.
- Likely finalists and close cut-offs get a second mentor's review on Day 2 morning.
- D2 13:00–13:30: private 15-minute walkthrough. 10 minutes showing the working build on a phone, then 5 minutes of questions. The final mentor score follows this.

Support and assessment are kept separate. Asking the mentor for help is never a penalty.

### Prizes

- Best in Show: £50 per team member.
- Each category award: £20 per team member.
- Awards are paid in Game Changer points. A team can win more than one award.

## Build rules

- Mobile-first. The demo must run on a phone (web app, PWA or native, our choice). Tested on a real device, with the link or install steps in the README.
- Public APIs only. Any external API must be publicly accessible. No internal LBG systems.
- Synthetic data only, everywhere in the repo, including test files and screenshots. No real organisation data at any stage.
- No keys in the repo. Team API key and Azure credentials stay out of commits and go in environment variables.
- Everything lives in the team's fork of the LaunchPad repo. That is the submission. Check the fork on GitHub, not just the laptop. If it is not pushed, it does not count.
- Build freeze: 13:00 on Day 2. What is on the branch then is what gets demoed. No separate form. Demo prep only after freeze.
- README must cover: team name, what it does, which part of the challenge it tackles, and how to run it. A demo recording is optional.
- Deployment is optional. Azure credentials are provided if wanted. The only hard requirement is that the demo runs on a phone.

## Assets and setup

- Private starter repo forked from the LaunchPad base repo. Invites go out once teams are confirmed.
- Claude Platform workspace and API key per team, credited with $240, issued on the day.
- Azure credentials, issued on the day.
- Synthetic data pack.
- Participants bring a personal device (laptop), a personal GitHub account, and an IDE such as VS Code with the Claude Code CLI installed.
- Nothing is issued before the event.

## Schedule (Day 2 and Day 1 key points)

- Day 1 10:00: welcome, format and judging.
- Day 1 10:10: product owner brief and intro to LLM-assisted development (repo setup support follows).
- Day 1 10:45: build begins.
- Day 1 12:00: checkpoint 1.
- Day 1 13:00: working pizza lunch, company paid.
- Day 1 15:30: checkpoint 2.
- Day 1 18:00: optional drinks. Dinner at 19:00 is own tab.
- Day 2 10:15: checkpoint 3.
- Day 2 12:30: lunch, own tab.
- Day 2 13:00: build freeze.
- Day 2 13:00–13:30: private walkthrough.
- Day 2 13:30–14:00: selection panel.
- Day 2 14:00: finalists announced and private feedback.
- Day 2 14:30: Best in Show final.
- Day 2 15:30: category winners revealed.
- Day 2 16:00: close.

## Conduct

- Respect the room: different backgrounds and experience levels.
- Share mentor time fairly. Mentors cover two teams.
- Escalate blockers over 30 minutes to the mentor early.
- Attend the three-team final with laptops closed and full attention.
- Photography and recording happen for internal and promotional use. The three finalist presentations are recorded for post-event sharing.

## Side quests

Six optional angles. Pick any, all or none. No automatic bonus; each strengthens evidence in the category it feeds. None feeds Best Demo or Most Innovative.

| ID | Name | Summary | Feeds |
| --- | --- | --- | --- |
| SQ-01 | The Manager's View | A companion for hiring managers: checks to complete, a buddy to assign, kit, access and an ID badge to request, three-month goals to set. What does a manager need to see, and what's none of their business? What should a finished task set off? How does a great joiner experience survive a busy manager? | Best Feature Fit |
| SQ-02 | Buddy Up | The buddy side: who gets matched with whom, what the buddy sees, when they step in, what stays private, how they hand over after Day 30. | Best UX |
| SQ-03 | Always-On Answers | An assistant grounded in synthetic policies and joining info that answers honestly, knows what to refuse, stays grounded in what's true and knows when to hand over to a person. | Best Technical Approach |
| SQ-04 | Unlock the Journey | Model the journey as events (offer accepted, checks cleared, kit chosen, goals set). What unlocks when, by job family, location and software? How do choices feed back? What belongs in their pocket, and what never leaves the building? | Best Technical Approach |
| SQ-05 | Your First 30 Days | Guide through intro calls, mandatory training, comms channels and a week-one 1:1 without a to-do list, and know by Day 30 if it worked. What happens when someone is quietly struggling at Day 20? | Best Feature Fit |
| SQ-06 | When Plans Change | Start dates slip, checks stall, a manager goes on leave. How does the journey reshape itself, who finds out first, what happens to unlocked content and choices, and who steps in? | Best UX |

## Kit

- A-01: starter repo, a private fork of the LaunchPad base repo.
- A-02: synthetic data, published Fri 6 Nov. "Use it as the source of truth for the people, policies and events your app works with." The site gives no schema; the pack is hosted elsewhere.
- A-03: Claude Platform workspace and API key per team, $240 credit, issued Mon 9 Nov.
- A-04: Azure credentials on a card at the team table.
- The product owner brief (Day 1 10:10, 15 minutes) is spoken only; the site has no written brief.

## Gaps still to capture

- Schema of the synthetic data pack (A-02), once we have it.
- Anything said in the product owner brief that the site doesn't cover.
