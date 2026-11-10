# E1 shortcut debt ledger (ponytail-debt)

Scope: `app/` and `src/` at HEAD. Scan: `git grep --no-index --exclude-standard -nE '(#|//|/[*]) ?(shortcut|ponytail):' -- app src`.

## Ledger

### src/ui/components/starter/StarterPreview.tsx

- `src/ui/components/starter/StarterPreview.tsx:15`: Provide receipts are held in page state only. ceiling: they are lost on reload. upgrade: when `/api/state` returns Provide receipts.

## Recorded in docs/decisions.md but not marked in code

These decisions say a `shortcut:` comment exists. None is in `app/` or `src/` now:

- Decision 16: "available from Offer accepted". Reversed by decision 20 (`appliedOn`), so it is correctly gone.
- Decision 21: the static canvas library with inferred tags. Wave D2 loads the library from the database, so it is correctly gone.
- Decision 26: after a Dismiss, `/me` still shows the Failed item as a wait. The decision names `src/ui/components/starter/format.ts`, but the file has no marker. The stopped copy now lives in `StarterPreview.tsx:38-42`. **This is a missing marker:** the limit is real and still in the code, but it is not tagged.

1 marker, 0 with no trigger.
