# Journeys, connectors and agents are config as code in this repo

Journeys, connectors (Workday, ServiceNow, Oracle) and agents are JSON files in the `journeys/`, `connectors/` and `agents/` folders of this repository. Each file is validated when it is loaded, and a file that fails validation is rejected with an error that names the file. The database is a cache: Reset demo reseeds it from the files, and a runtime sync reloads changed files into it. Publishing a Journey in the Journey builder writes its file back to `journeys/`.

Mentor feedback 1 asked for builder modules and Journeys to live as code so that everything is consumable (DevOps practice), and for the Journey builder to show it can connect to a repo (decisions 31 and 34). A Hidden automation Action may name a connector and one of its Operations; the builder lists the Operations a connector file offers.

Trade-offs:
- **One repo, not several.** The feedback asks for Journeys in their own repo. For the hackathon there is no second git repo: it would add a second deploy and a second set of permissions for no demo value. The folders have no code dependencies on the app, so they can move to their own repo later.
- **The integer version stays the pin.** Applied Pathways still pin the integer Journey version (ADR-0001, ADR-0002 unchanged). The semantic version is a label on top of it.
- **The "Connected repository" panel is honest.** It points at these folders and says the connection is simulated. It does not reach a remote repo.
- **Files can drift from the database.** The sync is the only way files reach the database, and the database never wins over a file on sync.

Rejected:
- **Database as the source of truth with export to files**: the files would be a copy, and the repo would not be what the builder consumes.
- **A second git repo now**: see above.
- **Real connectors to Workday, ServiceNow and Oracle**: out of scope (Design.MD D15); the connector files describe them and the adapters are mocked.
