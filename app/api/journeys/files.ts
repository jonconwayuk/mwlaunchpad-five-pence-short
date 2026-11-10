// Server-only helpers for the builder's "Connected repository" and "View as code" panels.
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { ApiError } from '@/src/lib/apiHandler';

export const JOURNEY_ID = /^j-[a-z0-9]+(-[a-z0-9]+)*$/;
// Same folder rule as src/db/files.ts, so tests and the loader agree.
const journeysDir = () => process.env.JOURNEYS_DIR ?? join(process.cwd(), 'journeys');

/** The path of journeys/<id>.json. Refuses anything that is not a Journey slug, so no path can leave journeys/. */
export function journeyFilePath(id: string): string {
  if (!JOURNEY_ID.test(id)) throw new ApiError('That is not a Journey id.', 400);
  return join(journeysDir(), `${id}.json`);
}

/** The Journey's file exactly as it is on disk, or undefined when it has no file yet. */
export function readJourneyFile(id: string): { file: string; text: string } | undefined {
  const path = journeyFilePath(id);
  return existsSync(path) ? { file: `journeys/${id}.json`, text: readFileSync(path, 'utf8') } : undefined;
}

/** "2 added, 1 updated", or "Already up to date". */
export const syncSummary = ({ added, updated }: { added: string[]; updated: string[] }): string =>
  added.length + updated.length === 0 ? 'Already up to date' : `${added.length} added, ${updated.length} updated`;

/** The current branch from .git/HEAD; "main" when there is no checkout (a deployed build). */
export function currentBranch(): string {
  try {
    const head = readFileSync(join(process.cwd(), '.git', 'HEAD'), 'utf8').trim();
    return head.startsWith('ref: refs/heads/') ? head.slice('ref: refs/heads/'.length) : 'detached';
  } catch {
    return 'main';
  }
}
