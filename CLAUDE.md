# Launchpad team project

This is a team's project for the Launchpad hackathon. The event site, https://mwlaunchpad.com/, has the brief and event details; fetch it when you need hackathon context. All teams share one Azure and Microsoft 365 tenant and one subscription, so a mistake here can affect other teams. `M365_AZURE_INSTRUCTIONS.md` has the full rules, and `CLAUDE_CODE_INSTRUCTIONS.md` covers signing in.

`NN` below is the team's two-digit number.

## Azure and Microsoft 365

- Create Azure resources only in the team's own resource group.
- Never change anything belonging to another team, or any tenant-wide setting.
- Deploy only to UK South or Italy North.

## Naming

| What | Pattern |
| --- | --- |
| Azure resources | `<type>-teamNN-<purpose>` |
| Globally unique Azure names | Same pattern with a short random suffix, for example `kv-teamNN-a91f`. Storage accounts allow only lowercase letters and numbers, for example `stteamNNdata7x2`. |
| Entra ID app registrations | `teamNN-<purpose>` |
| Test users | `teamNN-<name>` |
| Microsoft 365 groups, Teams and SharePoint sites | `TeamNN - <name>` |

## Secrets

Treat this repo as public. Never commit:

- Passwords, keys, client secrets, connection strings or tokens.
- Anything from the team sheet, including the account name and tenant domain.
- Tenant or subscription IDs, or CLI output, screenshots or logs that show them.

Keep real values in a local `.env`, which is ignored by git, and put placeholders in `.env.example`.
