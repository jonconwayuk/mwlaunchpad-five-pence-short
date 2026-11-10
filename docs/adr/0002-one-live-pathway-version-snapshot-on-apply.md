# One live version per Pathway; applying snapshots it; Additions live only on the starter

Each Pathway has exactly one live version. That is the only version HR can apply. The Pathway keeps a recorded version history and a count of how many times it has been applied. Only the Pathway's owner can publish a new live version.

Applying a Pathway to a Person snapshots the live version, together with the Journey versions it uses (ADR-0001), and records the snapshot against that Person as their Applied Pathway. So an owner's improvement reaches every starter the Pathway is applied to afterwards, and never changes a starter already under way.

The only per-starter change is an Addition: a Journey added to that starter's Applied Pathway by an HR Partner or their Line Manager (Design.MD D4a). No one can change or remove the Pathway's own items. An Addition is not saved as a new Pathway, cannot be applied to anyone else, and never appears in the library. The snapshot plus its Additions records exactly what that starter was given.

We rejected live links, because the owner's later changes would alter a starter's journey part-way through and break ADR-0001. We rejected saving a starter's changed Pathway as a new library Pathway (a fork), because forks would multiply near-identical Pathways that no one owns. When a different kind of starter needs a different Pathway, HR builds and publishes one deliberately (ADR-0004).

The cost is that a useful Addition does not spread on its own. When many starters get the same Addition, observability flags it to the Pathway owner, who can publish it in the live version.
