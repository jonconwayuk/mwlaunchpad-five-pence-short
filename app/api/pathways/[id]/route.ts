import { z } from 'zod';
import { wouldCreateLoop } from '@/src/engine';
import type { PathwayItem } from '@/src/engine/types';
import { getPathwayDraft, listJourneys, savePathwayDraft } from '@/src/db/queries';
import { ApiError, apiHandler } from '@/src/lib/apiHandler';
import { TAG_LISTS } from '@/src/ui/components/canvas/library';

export const dynamic = 'force-dynamic';

type Ctx = { params: Promise<{ id: string }> };
const id = z.string().min(1).max(100);
const role = z.enum(['starter', 'line-manager', 'buddy', 'hr']);
const stage = z.enum(['pre-contract', 'pre-employment', 'onboarding', 'first-30-days']);
const coord = z.number().finite().min(-5000).max(5000);
const tagOf = (k: (typeof TAG_LISTS)[number]['key']) =>
  z.enum(TAG_LISTS.find((l) => l.key === k)!.values as [string, ...string[]]).optional();
const Dependency = z.discriminatedUnion('kind', [
  z.strictObject({ kind: z.literal('item'), itemId: id }),
  z.strictObject({ kind: z.literal('container'), containerId: id }),
  z.strictObject({ kind: z.literal('timer'), timerId: id }),
]);
const Snapshot = z.object({
  title: z.string().trim().min(1).max(200),
  tags: z.strictObject({
    jobFamily: tagOf('jobFamily'), role: tagOf('role'), grade: tagOf('grade'), platform: tagOf('platform'), location: tagOf('location'),
  }),
  items: z.array(z.strictObject({
    id, journeyId: id, journeyVersion: z.number().int().min(1), mandatory: z.boolean(),
    dependsOn: z.array(Dependency).max(50), containerId: id.optional(), lane: stage, x: coord, y: coord,
    addedBy: z.strictObject({ personId: id, name: z.string().max(200) }).optional(),
  })).max(200),
  containers: z.array(z.strictObject({ id, label: z.string().trim().min(1).max(200), itemIds: z.array(id) })).max(50),
  timers: z.array(z.strictObject({
    id, label: z.string().trim().min(1).max(200),
    anchor: z.strictObject({
      kind: z.enum(['offer-accepted', 'start-date', 'item-done', 'container-complete']), itemId: id.optional(), containerId: id.optional(),
    }),
    offsetDays: z.number().int().min(-365).max(365),
    reminder: z.strictObject({ to: role, aboutItemId: id, message: z.string().trim().min(1).max(500) }).optional(),
  })).max(50),
  hardStops: z.array(z.strictObject({
    id, label: z.string().trim().min(1).max(200),
    trigger: z.discriminatedUnion('kind', [
      z.strictObject({ kind: z.literal('on-failed'), itemId: id }),
      z.strictObject({ kind: z.literal('on-deadline'), timerId: id, watchesItemId: id }),
    ]),
    stops: z.strictObject({ wholePathway: z.boolean(), itemIds: z.array(id), containerIds: z.array(id) }),
  })).max(50),
});
type Snapshot = z.infer<typeof Snapshot>;

/** Every id a snapshot mentions must exist inside it, and no Dependency may loop. */
function checkRefs(s: Snapshot): void {
  const unique = (ids: string[], what: string) => {
    if (new Set(ids).size !== ids.length) throw new ApiError(`Two ${what} share an id.`);
    return new Set(ids);
  };
  const items = unique(s.items.map((i) => i.id), 'Pathway Items');
  const containers = unique(s.containers.map((c) => c.id), 'Containers');
  const timers = unique(s.timers.map((t) => t.id), 'Timers');
  unique(s.hardStops.map((h) => h.id), 'Hard Stops');
  const journeys = new Map(listJourneys().map((j) => [j.id, j]));
  const need = (ok: boolean, msg: string) => { if (!ok) throw new ApiError(msg); };
  for (const i of s.items) {
    const j = journeys.get(i.journeyId);
    need(j !== undefined, `Journey ${i.journeyId} is not in the library.`);
    need(j?.stage === i.lane, `${j?.title ?? i.journeyId} belongs in its own Stage lane.`);
    need(i.containerId === undefined || containers.has(i.containerId), `A Pathway Item points at a Container that is not on this Pathway.`);
    for (const d of i.dependsOn) {
      need(d.kind === 'item' ? items.has(d.itemId) : d.kind === 'container' ? containers.has(d.containerId) : timers.has(d.timerId),
        'A Dependency points at something that is not on this Pathway.');
    }
  }
  for (const c of s.containers) need(c.itemIds.every((x) => items.has(x)), `Container ${c.label} holds a Journey that is not on this Pathway.`);
  for (const t of s.timers) {
    need((t.anchor.itemId === undefined || items.has(t.anchor.itemId)) && (t.anchor.containerId === undefined || containers.has(t.anchor.containerId))
      && (t.reminder === undefined || items.has(t.reminder.aboutItemId)), `Timer ${t.label} points at something that is not on this Pathway.`);
  }
  for (const h of s.hardStops) {
    const tr = h.trigger;
    need((tr.kind === 'on-failed' ? items.has(tr.itemId) : timers.has(tr.timerId) && items.has(tr.watchesItemId))
      && h.stops.itemIds.every((x) => items.has(x)) && h.stops.containerIds.every((x) => containers.has(x)),
    `Hard Stop ${h.label} points at something that is not on this Pathway.`);
  }
  // Re-add each item Dependency one at a time, refusing the first one that closes a loop.
  const titleOf = (itemId: string) => journeys.get(s.items.find((i) => i.id === itemId)?.journeyId ?? '')?.title ?? itemId;
  const built: PathwayItem[] = s.items.map((i) => ({ ...i, dependsOn: [] }));
  for (const i of s.items) {
    for (const d of i.dependsOn) {
      if (d.kind !== 'item') continue;
      const r = wouldCreateLoop(built, d.itemId, i.id, titleOf);
      if (r.loops) {
        const [source, target] = [titleOf(d.itemId), titleOf(i.id)];
        throw new ApiError(source === target ? `${source} cannot wait for itself.` : `${source} already waits for ${target}, so ${target} cannot wait for ${source}.`);
      }
      built.find((b) => b.id === i.id)!.dependsOn.push(d);
    }
  }
}

export const GET = apiHandler(async (_req: Request, { params }: Ctx) => {
  const snap = getPathwayDraft((await params).id);
  if (!snap) throw new ApiError('That Pathway was not found.', 404);
  return snap;
});

export const PUT = apiHandler(async (req: Request, { params }: Ctx) => {
  const pathwayId = (await params).id;
  if (!getPathwayDraft(pathwayId)) throw new ApiError('That Pathway was not found.', 404);
  const parsed = Snapshot.safeParse(await req.json().catch(() => null));
  if (!parsed.success) throw new ApiError(parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; '));
  checkRefs(parsed.data);
  savePathwayDraft(pathwayId, parsed.data);
  return getPathwayDraft(pathwayId);
});
