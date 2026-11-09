# One live version per Pathway; applying snapshots it; one-off changes live only on the starter

_Rewritten 9 Nov 2026. The first version said reuse "links to the original" but also that an owner's change reaches only Pathways reused after it, which contradict each other._

Each Pathway has exactly one live version. That is the only version HR can apply. The Pathway keeps a recorded version history and a count of how many times it has been applied. Only the Pathway's owner can publish a new live version.

Applying a Pathway to a Person snapshots the live version, together with the Journey versions it uses (ADR-0001), and records the snapshot against that Person as their Applied Pathway. So an owner's improvement reaches every starter the Pathway is applied to afterwards, and never changes a starter already under way.

If HR needs a one-off change for one starter, the change is made in that starter's Applied Pathway only. It is not saved as a new Pathway, cannot be applied to anyone else, and never appears in the library. The snapshot records exactly what that starter was given.

We rejected live links, because the owner's later changes would alter a starter's journey part-way through and break ADR-0001. We rejected saving forks as new library Pathways, because they would multiply near-identical Pathways and undo the point of Conditions (ADR-0004), which is one Pathway serving many similar starters.

The cost is that a useful one-off change does not spread on its own. If HR finds they keep making the same change, they ask the owner to publish it in the live version.
