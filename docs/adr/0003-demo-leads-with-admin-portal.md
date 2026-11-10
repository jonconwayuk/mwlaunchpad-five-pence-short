# Demo leads with the Admin Portal; one web app, laptop-first for admins, mobile for everyone else

_Since Design.MD 1.2 the Admin Portal is named the Onboarding Studio; the route `/portal` is unchanged._

The demo centres on the back end and pathway-building logic, with a front end over them: the Journey library and builder, the Pathway builder, applying a Pathway to a Person, and observability. This is our USP. The brief's problem is running many onboarding journeys at scale, not polishing one centrally owned app, and the Admin Portal is where that value is created.

We build one web app with three faces:

- **Admin Portal**, laptop-first. Journey owners and HR Partners build on a laptop, so we don't spend effort making graph editing work on a phone.
- **Starter Preview**, mobile. The starter is the consumer, so this is the face that must work on a phone.
- **Manager and Buddy view**, mobile, for seeing what is left and acting on it.

Changes made in the Admin Portal show up live in the mobile faces. One web app meets the "demo must run on a phone" rule with one codebase, and its advantages go on a slide in the presentation.

We rejected leading with the starter's phone app because it would put our effort into the part least different from other teams, and hide the orchestration model that makes each starter's pack different. We rejected making the Admin Portal mobile-friendly because admins build Pathways at a desk, and it would cost build time for no demo value.

The cost is weaker evidence for Best UX ("an intuitive mobile journey") and Best Demo ("show what a joiner can complete now"), because both are judged from the joiner's side. We recover some of it with a live Starter Preview, and the mobile Manager and Buddy view.
