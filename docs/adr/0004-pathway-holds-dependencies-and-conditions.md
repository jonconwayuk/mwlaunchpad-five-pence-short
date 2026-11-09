# The Pathway holds Dependencies and Conditions, resolved when applied

A Journey is a discrete, self-contained set of instructions that never refers to another Journey. All logic between Journeys lives in the Pathway, on Pathway Items: Dependencies (which Pathway Items must be Done first) and Conditions (which Person attributes a Pathway Item applies to). Keeping Journeys free of dependencies lets one Journey be reused in any Pathway, by owners who do not know each other's Journeys.

Dependencies form a graph, so one rule gives both sequence and parallel work: a Pathway Item with no unmet Dependencies is available. We chose this over an ordered list because a list forces a separate Pathway for every variation of job family, location, grade and platform, which undercuts running onboarding at scale.

Conditions are resolved once, when the Pathway is applied to a Person, and the Applied Pathway keeps only the matching Pathway Items. A Dependency on a Pathway Item that was left out counts as met. We chose this over evaluating branches while the starter works through the Pathway because it is a simple filter, it fits ADR-0001 (the Applied Pathway is fixed when the starter begins), and it is enough to show one Pathway giving different packs to different starters.

The cost is that Conditions cannot react to events mid-journey: a Pathway cannot route a starter to a different Journey part-way through. That is a production-path item, not part of the demo.

**Amended 9 Nov 2026:** the Pathway can now react to two kinds of mid-journey event, but only to *stop* work, never to reroute it. A Hard Stop fires when a Pathway Item ends with a Failed Outcome (such as failed vetting), or when a Timer deadline passes and the Pathway Item it watches is not Done. A Hard Stop never acts on its own: a person must Confirm, Extend (deadlines only) or Dismiss it, with a recorded reason. We added this because a bank cannot keep progressing a starter who has failed vetting, and we kept a person in the loop because withdrawing an offer automatically would be indefensible. Conditions are still resolved only at apply time.
