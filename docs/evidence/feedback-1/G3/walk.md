# G3 walk (headless Chrome 1280, own instance on port 3103, own seeded db)

Driver: `docs/evidence/launchpad-build/integration/drive.mjs`, steps run in one page.

- g3-bob-0/1: `/portal/people`, typed "Bob" in "Find a person": only Bob Warwick listed.
- g3-bob-2: clicked Bob. "Infrastructure engineer E (suggested)" preselected; one primary button "Apply pathway".
- g3-bob-3: clicked Apply pathway: "Infrastructure engineer E applied.", "Applied Pathway: Infrastructure engineer E v1". Clicks: People, Bob, Apply pathway (3).
- g3-bob-4/5: Add a delegate, Save delegate: "Lena Brooks can act for this person."
- g3-bob-6/7: chose "Have you received your merch?", Send a Reminder now.
- api-checks.txt: the Reminder is in `/api/state` notifications for `as=starter` and `as=delegate`; section 9 item 2 re-apply for A and B leaves A, B and C state byte-identical; A and B get Branch colleague and Software engineer preselected.
