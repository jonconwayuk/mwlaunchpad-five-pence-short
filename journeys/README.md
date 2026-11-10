# Journeys as code

Every library Journey is one JSON file in this folder, named after its id (`j-payroll.json` holds `"id": "j-payroll"`). The folder has no imports from the app, so it can be lifted into its own repository as it is; `connectors/` beside it describes the systems a Journey can call.

## Add or change a Journey

1. Drop a new file here, or edit one and raise its `semver`.
2. Press **Sync from repository** in the Journey library, or run `npm run seed` (which also resets the demo).
3. A new file becomes version 1. A changed file (new `semver` or new content) becomes the next version; Applied Pathways keep the version they pinned.

Publishing in the Journey builder writes the file back here, so the folder and the library stay in step.

## Schema

Validated with zod on load (`src/db/files.ts`); a bad file stops the load with its file name and the reason.

| Field | Rule |
| --- | --- |
| `id` | `j-` then lowercase letters, digits and hyphens; must match the file name |
| `semver` | `MAJOR.MINOR.PATCH`: patch for a fix, minor for new content, major for a breaking change |
| `title`, `description`, `ownerTeam` | Non-empty text |
| `stage` | `pre-contract`, `pre-employment`, `onboarding` or `first-30-days` |
| `tags` | Optional `jobFamily`, `role`, `grade` (A to G), `platform`, `location`, each from the fixed lists in `SEED-DATA.md` section 1. For browsing and filtering only |
| `whileYouWait` | Optional message shown while a Hidden automation runs |
| `declaresOutcome` | `true` if the Journey ends Passed or Failed |
| `actions` | At least one: `id`, `type` (`read`, `notification`, `task`, `automation`, `choose`, `provide`), `label`, and optional `owner`, `starterOnly`, `options`, `flagAtOrBelow`, `setsOutcome` |
| `actions[].connector`, `actions[].operation` | Optional, together, Hidden automation only: a connector id and one of its operations from `connectors/` |
