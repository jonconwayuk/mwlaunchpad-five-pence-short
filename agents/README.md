# Agents

The Agent library. One JSON file per agent. The Onboarding Studio reads this folder at runtime, so a new file shows up in the Agent library on the next page load, with no reseed.

Agents are **scripted, not an LLM**. Each one holds pre-written answers, and a question is matched to an answer by its words (`routeQuestion` in `src/agents/index.ts`). This is a simulation for the demo; nothing is sent to a live AI service.

## Add an agent

Drop a file named `<id>.json` in this folder:

| Field | Required | What it is |
| --- | --- | --- |
| `id` | yes | Lowercase slug, for example `payroll-helper` |
| `name` | yes | The name people see |
| `description` | yes | What it does, in plain words |
| `ownerTeam` | yes | The team that owns its answers |
| `journeyIds` | yes | The Journeys it supports (may be empty) |
| `connectors` | no | Systems it talks to: `workday`, `servicenow`, `oracle` |
| `intents` | yes | At least one `{ "id", "examples": [...], "answer" }` |
| `handsOverTo` | no | Who it hands over to: `line-manager`. The Agent library shows "Hands over to: Line Manager, in Microsoft Teams" |
| `handover` | no | `true` if it passes the question to a person (a simulated Teams chat) |

A file that fails validation stops the load with an error naming the file. Run `npx vitest run src/agents` after adding one.

Synthetic content only.
