import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema';

const DDL = `
CREATE TABLE IF NOT EXISTS persons (id TEXT PRIMARY KEY, name TEXT NOT NULL, role TEXT NOT NULL, tags TEXT NOT NULL,
  offer_accepted_date TEXT, start_date TEXT, line_manager_id TEXT, buddy_id TEXT, delegate_id TEXT);
CREATE TABLE IF NOT EXISTS journeys (id TEXT NOT NULL, version INTEGER NOT NULL, title TEXT NOT NULL, description TEXT NOT NULL,
  owner_team TEXT NOT NULL, stage TEXT NOT NULL, tags TEXT NOT NULL, while_you_wait TEXT, declares_outcome INTEGER NOT NULL,
  PRIMARY KEY (id, version));
CREATE TABLE IF NOT EXISTS actions (journey_id TEXT NOT NULL, journey_version INTEGER NOT NULL, position INTEGER NOT NULL,
  def TEXT NOT NULL, PRIMARY KEY (journey_id, journey_version, position));
CREATE TABLE IF NOT EXISTS pathways (id TEXT PRIMARY KEY, title TEXT NOT NULL, tags TEXT NOT NULL, live_version INTEGER,
  draft_version INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS pathway_versions (pathway_id TEXT NOT NULL, version INTEGER NOT NULL, snapshot TEXT NOT NULL,
  PRIMARY KEY (pathway_id, version));
CREATE TABLE IF NOT EXISTS pathway_items (pathway_id TEXT NOT NULL, id TEXT NOT NULL, position INTEGER NOT NULL, def TEXT NOT NULL, PRIMARY KEY (pathway_id, id));
CREATE TABLE IF NOT EXISTS containers (pathway_id TEXT NOT NULL, id TEXT NOT NULL, position INTEGER NOT NULL, def TEXT NOT NULL, PRIMARY KEY (pathway_id, id));
CREATE TABLE IF NOT EXISTS timers (pathway_id TEXT NOT NULL, id TEXT NOT NULL, position INTEGER NOT NULL, def TEXT NOT NULL, PRIMARY KEY (pathway_id, id));
CREATE TABLE IF NOT EXISTS hard_stops (pathway_id TEXT NOT NULL, id TEXT NOT NULL, position INTEGER NOT NULL, def TEXT NOT NULL, PRIMARY KEY (pathway_id, id));
CREATE TABLE IF NOT EXISTS applied_pathways (id TEXT PRIMARY KEY, person_id TEXT NOT NULL UNIQUE, snapshot TEXT NOT NULL, applied_on TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS action_progress (person_id TEXT NOT NULL, item_id TEXT NOT NULL, action_id TEXT NOT NULL, data TEXT NOT NULL,
  PRIMARY KEY (person_id, item_id, action_id));
CREATE TABLE IF NOT EXISTS item_overrides (person_id TEXT NOT NULL, item_id TEXT NOT NULL, data TEXT NOT NULL, PRIMARY KEY (person_id, item_id));
CREATE TABLE IF NOT EXISTS hard_stop_decisions (id INTEGER PRIMARY KEY AUTOINCREMENT, person_id TEXT NOT NULL, data TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS duration_history (id INTEGER PRIMARY KEY AUTOINCREMENT, pathway_id TEXT NOT NULL, pathway_version INTEGER NOT NULL,
  journey_id TEXT NOT NULL, journey_version INTEGER NOT NULL, days INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS demo_clock (id INTEGER PRIMARY KEY, today TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS notes (id INTEGER PRIMARY KEY AUTOINCREMENT, person_id TEXT NOT NULL, author_id TEXT NOT NULL, body TEXT NOT NULL, at TEXT NOT NULL);
`;

const open = () => {
  const path = (process.env.DATABASE_URL ?? './launchpad.db').replace(/^file:/, '');
  const sqlite = new Database(path);
  sqlite.pragma('journal_mode = WAL');
  sqlite.exec(DDL);
  return { sqlite, db: drizzle(sqlite, { schema }) };
};

// One shared connection, cached so Next dev hot reload does not reopen it.
const g = globalThis as unknown as { __launchpadDb?: ReturnType<typeof open> };
const conn = (g.__launchpadDb ??= open());
export const sqlite = conn.sqlite;
export const db = conn.db;
