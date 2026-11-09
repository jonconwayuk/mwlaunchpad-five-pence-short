# The app keeps Outcomes and choices, not personal data; Journeys share nothing

The app database keeps only what orchestration needs: Person attributes from the fixed tag lists, Applied Pathways, Journey Statuses, each Journey's Outcome with timestamps, and Choose results. Anything a starter submits through a Provide Action (forms, documents, bank details) passes straight through to the system of record and is not stored; the app keeps only a receipt of who submitted what, and when. Personal details such as home address are fetched from the system of record by a Hidden automation when a Journey needs them, and are not recorded.

Journeys never share data with each other. Where two Journeys seemed to need the same data, we either merged them (Right to work, Proof of address and Vetting became Pre-employment checks) or had each fetch it from the system of record (delivery address for devices and merch).

We chose this over a shared data store between Journeys because it keeps each Journey discrete and reusable in any Pathway, and because an onboarding app holding bank details, identity documents and addresses would be a needless second copy of sensitive data. The system of record already owns it.

The cost is more calls to the system of record, and a Journey that needs data held elsewhere must reach it through a Hidden automation. In the demo every system of record is a mocked adapter behind an interface.
