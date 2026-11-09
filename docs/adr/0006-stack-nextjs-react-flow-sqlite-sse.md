# Stack: one Next.js app, React Flow canvas, a separate Pathway engine, SQLite, server-sent events

We build one TypeScript Next.js app with three route groups: `/portal` (Admin Portal, laptop), `/me` (Starter Preview, also used by a Delegate) and `/team` (Manager and Buddy view). One codebase and one deploy serve all three faces (ADR-0003).

The Pathway builder canvas uses React Flow, the standard open-source node-and-edge editor. It gives us dragging, connecting, grouping (for Milestones) and custom nodes, which we could not build ourselves in the time. It is the main reason for choosing React.

All Pathway logic lives in a separate TypeScript module, the Pathway engine, with no UI. It resolves Conditions when a Pathway is applied, unlocks Dependencies, Milestones and Timers, raises Hard Stops, and works out Journey Status, Outcomes and the Usual Range, all against the Demo clock. Keeping it apart from the UI lets us unit-test it with Vitest: loops refused, Dependencies on excluded Pathway Items counted as met, Milestone hit rules, Timer firing order, and Hard Stops waiting for a person.

Data is in SQLite, seeded from synthetic data and reseeded by Reset demo. It holds only what ADR-0005 allows. Internal systems (Workday, vetting, IT provisioning, merch) are adapter interfaces with mock implementations; a production build replaces the adapters and keeps the engine.

Live updates use server-sent events: the server tells every open page that something changed, and the page refetches. If that misbehaves, pages poll every 3 seconds.

The app is hosted on Azure App Service in UK South, named to the team convention, with secrets in app settings and never in the repo. If deployment fails, we run locally and open it on phones over the same network.

Rejected:
- **WebSockets**: we only need the server to push, so server-sent events are simpler.
- **A separate API service**: a second deploy for no demo value; Next.js route handlers are enough.
- **A native app**: a second codebase, and the web app already runs on a phone.
- **Building the canvas by hand**: too slow; React Flow does it.
