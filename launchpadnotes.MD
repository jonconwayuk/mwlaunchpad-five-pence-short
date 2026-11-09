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

### Problem-space prompts (as captured)

Eleven of the twelve prompts were captured. The twelfth and the names of the six reference journey stages still need to be pulled.

- A warm handover: what makes the handover to the app feel like a welcome, not another login?
- Honest progress: what does honest progress look like when there is no news to share during vetting?
- Where am I?: how does someone know where they are in the journey, and what is still between them and day one?
- Earned, not withheld: which moments should unlock what, so content feels earned?
- Not the same pack: how do job family, location and system access shape what someone sees?
- Early choices: which choices (laptop, benefits, pay and rewards, learning) can be made before day one, and what happens after they are made?
- Meet before you meet: how does a joiner get to know their manager and buddy before they have met, and what makes that feel human?
- What's left?: how does a manager know what is left (checks, buddy, kit, access, badge, goals), and what happens when it slips?
- Chain reactions: what other moments should one person's action set off for someone else?
- Guide, don't nag: how does the app guide without becoming a to-do list?
- 9pm on a Sunday: who, or what, answers a question at that time, and when does it need a person?
- Did it work?: how would anyone know someone feels connected and confident by Day 30, and what happens if they don't?

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

Six optional angles on the problem space, each feeding a category. Examples captured so far: SQ-01 "The Manager's View", a companion for hiring managers with checks to complete and a buddy to assign. The full list of six still needs to be pulled.

## Gaps still to capture

- Twelfth problem-space prompt and the six reference journey stage names.
- Full text of the six side quests.
- The "kinds of evidence" mentors note against each category, from the judging page.
- Kit and prep pages in full.
- Day 1 and Day 2 detail on the schedule page, including the sessions in between.
