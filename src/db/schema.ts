import { integer, primaryKey, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import type {
  ActionDef, ActionProgress, ContainerDef, HardStopDecision, HardStopDef, ItemOverride,
  PathwayItem, PathwaySnapshot, TimerDef, Tags,
} from '../engine/types';

// JSON columns hold the engine's own shapes, so no mapping layer is needed.
// Keep DDL in client.ts in step with this file.
export const persons = sqliteTable('persons', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  role: text('role').notNull(), // starter | line-manager | buddy | delegate | hr
  tags: text('tags', { mode: 'json' }).$type<Tags>().notNull(),
  offerAcceptedDate: text('offer_accepted_date'),
  startDate: text('start_date'),
  lineManagerId: text('line_manager_id'),
  buddyId: text('buddy_id'),
  delegateId: text('delegate_id'),
});

export const journeys = sqliteTable('journeys', {
  id: text('id').notNull(),
  version: integer('version').notNull(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  ownerTeam: text('owner_team').notNull(),
  stage: text('stage').notNull(),
  tags: text('tags', { mode: 'json' }).$type<Tags>().notNull(),
  whileYouWait: text('while_you_wait'),
  declaresOutcome: integer('declares_outcome', { mode: 'boolean' }).notNull(),
  semver: text('semver'),
}, (t) => [primaryKey({ columns: [t.id, t.version] })]);

export const actions = sqliteTable('actions', {
  journeyId: text('journey_id').notNull(),
  journeyVersion: integer('journey_version').notNull(),
  position: integer('position').notNull(),
  def: text('def', { mode: 'json' }).$type<ActionDef>().notNull(),
}, (t) => [primaryKey({ columns: [t.journeyId, t.journeyVersion, t.position] })]);

export const pathways = sqliteTable('pathways', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  tags: text('tags', { mode: 'json' }).$type<Tags>().notNull(),
  liveVersion: integer('live_version'), // null until published
  draftVersion: integer('draft_version').notNull(), // version the next publish will create
});

export const pathwayVersions = sqliteTable('pathway_versions', {
  pathwayId: text('pathway_id').notNull(),
  version: integer('version').notNull(),
  snapshot: text('snapshot', { mode: 'json' }).$type<PathwaySnapshot>().notNull(),
  semver: text('semver'), // layered on the integer version that Applied Pathways pin
}, (t) => [primaryKey({ columns: [t.pathwayId, t.version] })]);

// The draft canvas: one row per element, replaced wholesale on save.
const draftTable = <T>(name: string) =>
  sqliteTable(name, {
    pathwayId: text('pathway_id').notNull(),
    id: text('id').notNull(),
    position: integer('position').notNull(),
    def: text('def', { mode: 'json' }).$type<T>().notNull(),
  }, (t) => [primaryKey({ columns: [t.pathwayId, t.id] })]);
export const pathwayItems = draftTable<PathwayItem>('pathway_items');
export const containers = draftTable<ContainerDef>('containers');
export const timers = draftTable<TimerDef>('timers');
export const hardStops = draftTable<HardStopDef>('hard_stops');

export const appliedPathways = sqliteTable('applied_pathways', {
  id: text('id').primaryKey(),
  personId: text('person_id').notNull().unique(),
  snapshot: text('snapshot', { mode: 'json' }).$type<PathwaySnapshot>().notNull(),
  appliedOn: text('applied_on').notNull(),
});

export const actionProgress = sqliteTable('action_progress', {
  personId: text('person_id').notNull(),
  itemId: text('item_id').notNull(),
  actionId: text('action_id').notNull(),
  data: text('data', { mode: 'json' }).$type<ActionProgress>().notNull(),
}, (t) => [primaryKey({ columns: [t.personId, t.itemId, t.actionId] })]);

export const itemOverrides = sqliteTable('item_overrides', {
  personId: text('person_id').notNull(),
  itemId: text('item_id').notNull(),
  data: text('data', { mode: 'json' }).$type<ItemOverride>().notNull(),
}, (t) => [primaryKey({ columns: [t.personId, t.itemId] })]);

export const hardStopDecisions = sqliteTable('hard_stop_decisions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  personId: text('person_id').notNull(),
  data: text('data', { mode: 'json' }).$type<HardStopDecision>().notNull(),
});

export const durationHistory = sqliteTable('duration_history', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  pathwayId: text('pathway_id').notNull(),
  pathwayVersion: integer('pathway_version').notNull(),
  journeyId: text('journey_id').notNull(),
  journeyVersion: integer('journey_version').notNull(),
  days: integer('days').notNull(),
  businessArea: text('business_area'), // the past starter's job family
  role: text('role'),
  grade: text('grade'),
});

export const demoClock = sqliteTable('demo_clock', {
  id: integer('id').primaryKey(), // always 1
  today: text('today').notNull(),
});

export const notes = sqliteTable('notes', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  personId: text('person_id').notNull(),
  authorId: text('author_id').notNull(),
  body: text('body').notNull(),
  at: text('at').notNull(),
});

export const manualReminders = sqliteTable('manual_reminders', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  personId: text('person_id').notNull(),
  message: text('message').notNull(),
  at: text('at').notNull(),
});

export const handovers = sqliteTable('handovers', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  personId: text('person_id').notNull(),
  question: text('question').notNull(),
  at: text('at').notNull(),
  agentName: text('agent_name'),
  summary: text('summary'),
});
