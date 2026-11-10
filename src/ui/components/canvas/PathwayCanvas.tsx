'use client';
import '@xyflow/react/dist/style.css';
import {
  MarkerType, ReactFlow, ReactFlowProvider, applyNodeChanges, useReactFlow,
  type Connection, type Edge, type Node, type NodeChange,
} from '@xyflow/react';
import { useCallback, useEffect, useMemo, useReducer, useRef, useState, type DragEvent } from 'react';
import type { AnchorKind, DependencyRef, HardStopDef, PathwaySnapshot, StageId, Tags, TimerDef } from '@/src/engine/types';
import { LIBRARY, STAGES, TAG_LISTS, setLibrary, type LibraryJourney } from './library';
import {
  CARD_H, CARD_W, LANE_W, blockPositions, canvasReducer, cardSubtitle, dependencyKey, fitToLanes, laneExtent, laneX, loopMessage,
  nextFreeY, nextId, snapToLane, timerLabel, timerMessage, timerRemovalMessage, titleOfItem, titleOfJourney,
} from './model';
import { nodeTypes } from './nodes';

const DRAG_TYPE = 'application/x-launchpad-journey';
const STAGE_TYPE = 'application/x-launchpad-stage';
const focus = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-vibrant';
const stageLabel = (id: string) => STAGES.find((s) => s.id === id)?.label ?? id;

function buildNodes(s: PathwaySnapshot, prev: Node[]): Node[] {
  const before = new Map(prev.map((n) => [n.id, n]));
  const keep = (n: Node, keepPosition: boolean): Node => {
    const old = before.get(n.id);
    return old ? { ...n, measured: old.measured, selected: old.selected, position: keepPosition ? old.position : n.position } : n;
  };
  const fixed = { draggable: false, selectable: false, connectable: false, style: { pointerEvents: 'none' as const } };

  const lanes: Node[] = STAGES.map((st, index) => ({
    id: `lane:${st.id}`, type: 'lane', position: { x: laneX(st.id), y: 0 }, data: { label: st.label, index }, zIndex: -2, ...fixed,
  }));
  const containers: Node[] = s.containers.flatMap((c) => {
    const inside = s.items.filter((i) => c.itemIds.includes(i.id));
    if (inside.length === 0) return [];
    const x = Math.min(...inside.map((i) => i.x)) - 16;
    const y = Math.min(...inside.map((i) => i.y)) - 24;
    const width = Math.max(...inside.map((i) => i.x)) + CARD_W + 16 - x;
    const height = Math.max(...inside.map((i) => i.y)) + CARD_H + 16 - y;
    return [{ id: `container:${c.id}`, type: 'container', position: { x, y }, data: { label: c.label, width, height }, zIndex: -1, ...fixed }];
  });
  const items: Node[] = s.items.map((i) => keep({
    id: i.id, type: 'journey', position: { x: i.x, y: i.y }, extent: laneExtent(i.lane),
    data: { title: titleOfJourney(i.journeyId), subtitle: cardSubtitle(s, i) ?? stageLabel(i.lane), mandatory: i.mandatory },
  }, false));
  // Re-placed on every change, below the lowest card in their lane, so a moved or added card never ends up under one.
  const at = blockPositions(s);
  const block = { draggable: false, selectable: true, connectable: false };
  const timers: Node[] = s.timers.map((t) => keep({
    id: `timer:${t.id}`, type: 'timer', position: at.get(`timer:${t.id}`)!, ...block, data: { label: timerLabel(t) },
  }, false));
  const hardStops: Node[] = s.hardStops.map((h) => keep({
    id: `hardStop:${h.id}`, type: 'hardStop', position: at.get(`hardStop:${h.id}`)!, ...block,
    data: { label: h.label, detail: h.stops.wholePathway ? 'Stops the whole pathway' : 'Stops the work it is connected to' },
  }, false));
  return [...lanes, ...containers, ...items, ...timers, ...hardStops];
}

const dependencyTitle = (s: PathwaySnapshot, d: DependencyRef) =>
  d.kind === 'item'
    ? titleOfJourney(s.items.find((i) => i.id === d.itemId)?.journeyId ?? d.itemId)
    : d.kind === 'container'
      ? s.containers.find((c) => c.id === d.containerId)?.label ?? d.containerId
      : ((t) => (t ? timerLabel(t) : d.timerId))(s.timers.find((t) => t.id === d.timerId));

function buildEdges(s: PathwaySnapshot): Edge[] {
  const arrow = { type: MarkerType.ArrowClosed, color: 'var(--everyday)' };
  const style = { stroke: 'var(--everyday)', strokeWidth: 2 };
  const laneOf = new Map(s.items.map((i) => [i.id, i.lane]));
  const deps: Edge[] = s.items.flatMap((i) => i.dependsOn.map((d) => {
    const source = d.kind === 'item' ? d.itemId : d.kind === 'container' ? `container:${d.containerId}` : `timer:${d.timerId}`;
    // Same-lane cards stack, so the edge runs from the bottom of one to the top of the next instead of looping round.
    const sameLane = d.kind === 'item' && laneOf.get(d.itemId) === i.lane;
    return {
      id: `${source}->${i.id}`, source, target: i.id, type: 'smoothstep', markerEnd: arrow, style, selectable: false,
      sourceHandle: d.kind === 'item' ? (sameLane ? 'bottom' : 'right') : undefined,
      targetHandle: sameLane ? 'top' : 'left',
    };
  }));
  const stops: Edge[] = s.hardStops.flatMap((h) => h.trigger.kind === 'on-failed'
    ? [{ id: `${h.trigger.itemId}->hardStop:${h.id}`, source: h.trigger.itemId, target: `hardStop:${h.id}`, type: 'smoothstep',
        // Hard Stops sit in the left lane, so the edge runs back from the card's left to the block's right and its label sits on top in the gap.
        sourceHandle: 'back', targetHandle: 'right', label: 'If Failed', zIndex: 1000, labelBgPadding: [6, 3] as [number, number], labelBgBorderRadius: 4,
        labelBgStyle: { fill: 'var(--paper)', stroke: 'var(--charcoal)', strokeWidth: 1 }, labelStyle: { fill: 'var(--charcoal)', fontSize: 12, fontWeight: 600 },
        style: { stroke: 'var(--charcoal)', strokeWidth: 1.5, strokeDasharray: '4 4' }, selectable: false }]
    : []);
  return [...deps, ...stops];
}

function Library({ onAdd, onDragStage }: { onAdd: (journeyId: string) => void; onDragStage: (stage: StageId | null) => void }) {
  const [query, setQuery] = useState('');
  const [tag, setTag] = useState('');
  const allTags = useMemo(() => [...new Set(LIBRARY.flatMap((j) => Object.values(j.tags)))].sort(), []);
  const shown = LIBRARY.filter((j) =>
    j.title.toLowerCase().includes(query.trim().toLowerCase()) && (!tag || Object.values(j.tags).includes(tag)));
  return (
    <aside className="flex w-[260px] shrink-0 flex-col border-r border-[var(--hairline)] bg-paper">
      <div className="space-y-2 border-b border-[var(--hairline)] p-3">
        <h2 className="text-[18px] font-semibold text-racing">Library</h2>
        <input
          type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search journeys"
          aria-label="Search journeys" className={`w-full rounded-[4px] border border-[var(--hairline)] px-2 py-1.5 text-[15px] ${focus}`}
        />
        <select value={tag} onChange={(e) => setTag(e.target.value)} aria-label="Filter by tag"
          className={`w-full rounded-[4px] border border-[var(--hairline)] px-2 py-1.5 text-[15px] ${focus}`}>
          <option value="">All tags</option>
          {allTags.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <p className="text-[13px] text-[var(--muted)]">Drag a journey onto its lane. Then drag from the dot on its right edge to the journey that waits for it.</p>
      </div>
      <ul className="flex-1 space-y-2 overflow-y-auto p-3">
        {shown.map((j) => (
          <li key={j.id} draggable onDragEnd={() => onDragStage(null)}
            onDragStart={(e) => {
              e.dataTransfer.setData(DRAG_TYPE, j.id); e.dataTransfer.setData(STAGE_TYPE, j.stage);
              e.dataTransfer.effectAllowed = 'move'; onDragStage(j.stage);
            }}
            className="cursor-grab rounded-[6px] border border-[var(--hairline)] bg-paper p-2.5 active:cursor-grabbing">
            <div className="flex items-start justify-between gap-2">
              <span className="text-[15px] font-medium text-ink">{j.title}</span>
              <button type="button" onClick={() => onAdd(j.id)} aria-label={`Add ${j.title} to the pathway`}
                className={`rounded-[4px] px-1.5 text-[13px] text-heritage hover:underline ${focus}`}>Add</button>
            </div>
            <div className="text-[13px] text-[var(--muted)]">{stageLabel(j.stage)}</div>
            <div className="mt-1 flex flex-wrap gap-1">
              {Object.values(j.tags).map((t) => (
                <span key={t} className="rounded-[4px] bg-[var(--paper-2)] px-1.5 text-[13px] text-[var(--muted)]">{t}</span>
              ))}
            </div>
          </li>
        ))}
        {shown.length === 0 && <li className="text-[13px] text-[var(--muted)]">No journeys match.</li>}
      </ul>
    </aside>
  );
}

const field = `w-full rounded-[4px] border border-[var(--hairline)] px-2 py-1 text-[13px] text-ink ${focus}`;
const panel = 'absolute inset-y-0 right-0 z-10 w-[264px] space-y-4 overflow-y-auto border-l border-[var(--hairline)] bg-paper p-4';
const removeButton = `w-full rounded-[4px] border border-charcoal px-3 py-1.5 text-charcoal ${focus}`;
const saveButton = `w-full rounded-[4px] bg-heritage px-3 py-1.5 text-paper ${focus}`;

/** Edits one Timer; keyed by its id so the form resets when another is selected. */
function TimerPanel({ snapshot, timer, onSave, onRemove }: {
  snapshot: PathwaySnapshot; timer: TimerDef; onSave: (t: TimerDef) => string | null; onRemove: () => void;
}) {
  const [label, setLabel] = useState(timer.label);
  const [anchor, setAnchor] = useState(timer.anchor.kind === 'item-done' ? `item:${timer.anchor.itemId ?? ''}` : timer.anchor.kind);
  const [days, setDays] = useState(String(timer.offsetDays));
  const [message, setMessage] = useState<string | null>(null);
  const toTimer = (): TimerDef => ({
    ...timer, label: label.trim(), offsetDays: Number(days),
    anchor: anchor.startsWith('item:') ? { kind: 'item-done', itemId: anchor.slice(5) } : { kind: anchor as AnchorKind },
  });
  return (
    <aside className={panel} aria-label="Timer">
      <h2 className="text-[18px] font-semibold text-racing">Timer</h2>
      <label className="grid gap-0.5 text-[13px] text-[var(--muted)]">Label
        <input value={label} onChange={(e) => setLabel(e.target.value)} className={field} />
      </label>
      <label className="grid gap-0.5 text-[13px] text-[var(--muted)]">Anchor
        <select value={anchor} onChange={(e) => setAnchor(e.target.value)} className={field}>
          <option value="offer-accepted">Offer accepted</option>
          <option value="start-date">Start date</option>
          {snapshot.items.map((i) => <option key={i.id} value={`item:${i.id}`}>When {titleOfItem(snapshot.items, i.id)} is done</option>)}
          {timer.anchor.kind === 'container-complete' && <option value="container-complete">When a Container is complete</option>}
        </select>
      </label>
      <label className="grid gap-0.5 text-[13px] text-[var(--muted)]">Offset in days (below 0 counts back from the start date)
        <input type="number" step={1} value={days} onChange={(e) => setDays(e.target.value)} className={field} />
      </label>
      {message && <p role="alert" className="text-[13px] text-charcoal">{message}</p>}
      <button type="button" onClick={() => setMessage(onSave(toTimer()) ?? 'Timer saved.')} className={saveButton}>Save Timer</button>
      <button type="button" onClick={() => { const m = timerRemovalMessage(snapshot, timer.id); if (m) setMessage(m); else onRemove(); }}
        className={removeButton}>Remove Timer</button>
    </aside>
  );
}

/** Edits one Hard Stop: its label, the Journey whose Failed Outcome sets it off, and what it stops. */
function HardStopPanel({ snapshot, hardStop, onSave, onRemove }: {
  snapshot: PathwaySnapshot; hardStop: HardStopDef; onSave: (h: HardStopDef) => void; onRemove: () => void;
}) {
  const save = (patch: Partial<HardStopDef>) => onSave({ ...hardStop, ...patch });
  const stops = hardStop.stops;
  return (
    <aside className={panel} aria-label="Hard Stop">
      <h2 className="text-[18px] font-semibold text-racing">Hard Stop</h2>
      <label className="grid gap-0.5 text-[13px] text-[var(--muted)]">Label
        <input defaultValue={hardStop.label} onBlur={(e) => { if (e.target.value.trim()) save({ label: e.target.value.trim() }); }} className={field} />
      </label>
      {hardStop.trigger.kind === 'on-failed' && (
        <label className="grid gap-0.5 text-[13px] text-[var(--muted)]">On Failed of (a Journey whose Hidden automation sets the Outcome)
          <select value={hardStop.trigger.itemId} onChange={(e) => save({ trigger: { kind: 'on-failed', itemId: e.target.value } })} className={field}>
            {snapshot.items.map((i) => <option key={i.id} value={i.id}>{titleOfItem(snapshot.items, i.id)}</option>)}
          </select>
        </label>
      )}
      <fieldset className="space-y-1 text-[13px]">
        <legend className="text-[var(--muted)]">Stops</legend>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={stops.wholePathway} onChange={() => save({ stops: { ...stops, wholePathway: !stops.wholePathway } })}
            className={`accent-[var(--heritage)] ${focus}`} />The whole pathway
        </label>
        {!stops.wholePathway && snapshot.items.map((i) => (
          <label key={i.id} className="flex items-center gap-2">
            <input type="checkbox" checked={stops.itemIds.includes(i.id)} className={`accent-[var(--heritage)] ${focus}`}
              onChange={() => save({ stops: { ...stops, itemIds: stops.itemIds.includes(i.id) ? stops.itemIds.filter((x) => x !== i.id) : [...stops.itemIds, i.id] } })} />
            {titleOfItem(snapshot.items, i.id)}
          </label>
        ))}
      </fieldset>
      <button type="button" onClick={onRemove} className={removeButton}>Remove Hard Stop</button>
    </aside>
  );
}

/** Sends the draft or publishes it; returns the API's data or throws its plain-English error. */
async function call<T>(url: string, method: 'PUT' | 'POST', body?: unknown): Promise<T> {
  const res = await fetch(url, { method, headers: { 'content-type': 'application/json' }, body: body === undefined ? undefined : JSON.stringify(body) });
  const json = (await res.json().catch(() => ({ ok: false, error: 'The server did not answer.' }))) as { ok: boolean; data: T; error?: string };
  if (!json.ok) throw new Error(json.error ?? 'Could not save.');
  return json.data;
}

function Builder({ draft }: { draft: PathwaySnapshot }) {
  // The whole Pathway lives in this one PathwaySnapshot, PUT as-is to save the draft.
  const [snapshot, dispatch] = useReducer(canvasReducer, draft, fitToLanes);
  const [nodes, setNodes] = useState<Node[]>(() => buildNodes(snapshot, []));
  const [version, setVersion] = useState(draft.version); // outside the snapshot, so publishing does not trigger an autosave
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const [dragStage, setDragStage] = useState<StageId | null>(null);
  const { screenToFlowPosition, getViewport, setViewport } = useReactFlow();
  const paneRef = useRef<HTMLDivElement>(null);

  // A Timer or Hard Stop just added from the header opens selected; React Flow reports node selection, so it is set on the node.
  const pendingSelect = useRef<string | null>(null);
  useEffect(() => {
    const id = pendingSelect.current;
    pendingSelect.current = null;
    setNodes((prev) => {
      const next = buildNodes(snapshot, prev);
      return id ? next.map((n) => ({ ...n, selected: n.id === id })) : next;
    });
  }, [snapshot]);
  const url = `/api/pathways/${snapshot.pathwayId}`;
  const published = useRef<PathwaySnapshot | null>(null);
  const saveDraft = useCallback(async (s: PathwaySnapshot) => {
    if (s === published.current) return; // publish already saved it; keep "Published as version N" until the next edit
    try { await call(url, 'PUT', s); setSaved('Draft saved'); } catch (e) { setSaved(e instanceof Error ? e.message : 'Could not save.'); }
  }, [url]);
  const publish = async () => {
    try {
      await call(url, 'PUT', snapshot);
      const { version } = await call<{ version: number }>(`${url}/publish`, 'POST');
      setVersion(version + 1); // the draft is now the next version
      published.current = snapshot;
      setSaved(`Published as version ${version}`);
    } catch (e) { setSaved(e instanceof Error ? e.message : 'Could not publish.'); }
  };
  // Autosave the draft one second after the last change; the loaded draft itself is not re-saved.
  const loaded = useRef(snapshot);
  useEffect(() => {
    if (snapshot === loaded.current) return;
    setSaved(null);
    const t = setTimeout(() => void saveDraft(snapshot), 1000);
    return () => clearTimeout(t);
  }, [snapshot, saveDraft]);
  // While a library card is dragged, its own Stage lane is tinted so HR sees where it will land.
  const shownNodes = useMemo(() => dragStage
    ? nodes.map((n) => (n.id === `lane:${dragStage}` ? { ...n, data: { ...n.data, dropHere: true } } : n))
    : nodes, [nodes, dragStage]);
  // Fit all four lanes across the pane's width, lanes top-aligned; the height pans.
  const fitLanes = useCallback(() => {
    const width = paneRef.current?.clientWidth ?? LANE_W * STAGES.length;
    setViewport({ x: 8, y: 0, zoom: Math.min(1.2, (width - 16) / (LANE_W * STAGES.length)) });
  }, [setViewport]);
  // When a new card lands off screen, pan to it so the snap into its lane is visible; the zoom and lanes stay put.
  const showCard = (y: number) => {
    const v = getViewport();
    const top = y * v.zoom + v.y;
    const height = paneRef.current?.clientHeight ?? 0;
    if (top >= 0 && top + CARD_H * v.zoom <= height) return;
    setViewport({ ...v, y: Math.min(0, 160 - y * v.zoom) }, { duration: 400 });
  };
  const edges = useMemo(() => buildEdges(snapshot), [snapshot]);
  const itemIds = useMemo(() => new Set(snapshot.items.map((i) => i.id)), [snapshot]);
  const selected = snapshot.items.find((i) => i.id === selectedId);
  const selectedTimer = snapshot.timers.find((t) => `timer:${t.id}` === selectedId);
  const selectedHardStop = snapshot.hardStops.find((h) => `hardStop:${h.id}` === selectedId);
  const select = (nodeId: string) => { pendingSelect.current = nodeId; setSelectedId(nodeId); };
  const addTimer = () => {
    const timer: TimerDef = { id: nextId('t', snapshot.timers), label: 'New Timer', anchor: { kind: 'start-date' }, offsetDays: 0 };
    dispatch({ type: 'saveTimer', timer });
    select(`timer:${timer.id}`);
  };
  const addHardStop = () => {
    const first = snapshot.items[0];
    if (!first) { setNotice('Add a Journey first: a Hard Stop needs a Journey that can fail.'); return; }
    const hardStop: HardStopDef = { id: nextId('hs', snapshot.hardStops), label: 'New Hard Stop', trigger: { kind: 'on-failed', itemId: first.id },
      stops: { wholePathway: true, itemIds: [], containerIds: [] } };
    dispatch({ type: 'saveHardStop', hardStop });
    select(`hardStop:${hardStop.id}`);
  };

  const onNodesChange = useCallback((changes: NodeChange[]) => setNodes((ns) => applyNodeChanges(changes, ns)), []);
  const isValidConnection = useCallback((c: Connection | Edge) => itemIds.has(c.source) && itemIds.has(c.target), [itemIds]);
  const onConnect = useCallback((c: Connection) => {
    const refusal = loopMessage(snapshot.items, c.source, c.target);
    setNotice(refusal);
    if (!refusal) dispatch({ type: 'connect', sourceId: c.source, targetId: c.target });
  }, [snapshot.items]);

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragStage(null);
    const journeyId = e.dataTransfer.getData(DRAG_TYPE);
    const stage = LIBRARY.find((j) => j.id === journeyId)?.stage;
    if (!stage) return;
    const p = screenToFlowPosition({ x: e.clientX, y: e.clientY });
    dispatch({ type: 'add', journeyId, x: p.x - CARD_W / 2, y: p.y - CARD_H / 2 });
    showCard(snapToLane(stage, p.x - CARD_W / 2, p.y - CARD_H / 2).y);
  };
  const addToLane = (journeyId: string) => {
    const stage = LIBRARY.find((j) => j.id === journeyId)?.stage;
    if (!stage) return;
    const lowest = nextFreeY(snapshot, stage);
    dispatch({ type: 'add', journeyId, x: laneX(stage), y: lowest });
    showCard(snapToLane(stage, laneX(stage), lowest).y);
  };
  const setTag = (key: keyof Tags, value: string) => {
    const tags: Tags = { ...snapshot.tags };
    if (value) tags[key] = value; else delete tags[key];
    dispatch({ type: 'tags', tags });
  };

  return (
    <div className="flex h-[calc(100vh-27px)] flex-col bg-paper text-[15px] leading-[1.45] text-ink">
      <header className="flex items-center gap-4 border-b border-[var(--hairline)] px-4 py-3">
        <h1 className="min-w-0 truncate text-[21.6px] font-semibold text-racing">Pathway: {snapshot.title}</h1>
        <span className="shrink-0 text-[13px] text-[var(--muted)]">{version > 1 ? `Live version ${version - 1}` : 'Not published yet'}</span>
        {saved && <span role="status" className="min-w-0 truncate text-[13px] text-[var(--muted)]" title={saved}>{saved}</span>}
        <div className="flex-1" />
        <details className="relative shrink-0">
          <summary className={`cursor-pointer list-none rounded-[4px] border border-[var(--hairline)] px-3 py-1.5 text-[13px] ${focus}`}>
            Tags{Object.keys(snapshot.tags).length > 0 && <span className="text-[var(--muted)]"> ({Object.keys(snapshot.tags).length})</span>}
          </summary>
          <div className="absolute right-0 top-full z-20 mt-1 grid w-[240px] gap-2 rounded-[6px] border border-[var(--hairline)] bg-paper p-3">
            {TAG_LISTS.map((list) => (
              <label key={list.key} className="grid gap-0.5 text-[13px] text-[var(--muted)]">
                {list.label}
                <select value={snapshot.tags[list.key] ?? ''} onChange={(e) => setTag(list.key, e.target.value)}
                  className={`rounded-[4px] border border-[var(--hairline)] px-2 py-1 text-[13px] text-ink ${focus}`}>
                  <option value="">Any</option>
                  {list.values.map((v) => <option key={v} value={v}>{v}</option>)}
                </select>
              </label>
            ))}
          </div>
        </details>
        <button type="button" onClick={addTimer}
          className={`shrink-0 rounded-[4px] border border-[var(--hairline)] px-3 py-1.5 text-[13px] ${focus}`}>Add a Timer</button>
        <button type="button" onClick={addHardStop}
          className={`shrink-0 rounded-[4px] border border-[var(--hairline)] px-3 py-1.5 text-[13px] ${focus}`}>Add a Hard Stop</button>
        <button type="button" onClick={() => void saveDraft(snapshot)}
          className={`shrink-0 rounded-[4px] border border-heritage px-3 py-1.5 text-heritage ${focus}`}>Save draft</button>
        <button type="button" onClick={() => void publish()}
          className={`shrink-0 rounded-[4px] bg-heritage px-3 py-1.5 text-paper ${focus}`}>Publish</button>
      </header>
      <div className="relative flex min-h-0 flex-1">
        <Library onAdd={addToLane} onDragStage={setDragStage} />
        <div ref={paneRef} className="relative flex-1 bg-[var(--paper-2)]" onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; }} onDrop={onDrop}>
          {notice && (
            <div role="alert" className="absolute left-1/2 top-4 z-10 flex max-w-[560px] -translate-x-1/2 items-center gap-4 rounded-[6px] bg-ink px-4 py-3 text-paper">
              <span>{notice}</span>
              <button type="button" onClick={() => setNotice(null)} className={`shrink-0 rounded-[4px] text-vibrant underline ${focus}`}>Got it</button>
            </div>
          )}
          <ReactFlow
            nodes={shownNodes} edges={edges} nodeTypes={nodeTypes} onInit={fitLanes}
            onNodesChange={onNodesChange} onConnect={onConnect} isValidConnection={isValidConnection}
            onNodeDragStop={(_, n) => { if (itemIds.has(n.id)) dispatch({ type: 'move', itemId: n.id, x: n.position.x, y: n.position.y }); }}
            onSelectionChange={({ nodes: sel }) => setSelectedId(sel.length === 1 && sel[0] && (itemIds.has(sel[0].id) || /^(timer|hardStop):/.test(sel[0].id)) ? sel[0].id : null)}
            deleteKeyCode={null} connectionLineStyle={{ stroke: 'var(--everyday)', strokeWidth: 2 }}
            translateExtent={[[-200, -200], [LANE_W * STAGES.length + 200, 1600]]}
            minZoom={0.4} maxZoom={1.5}
          />
        </div>
        {selected && (
          // An overlay, so opening it never squeezes the lanes off the screen.
          <aside className={panel} aria-label="Pathway Item">
            <div>
              <h2 className="text-[18px] font-semibold text-racing">{titleOfJourney(selected.journeyId)}</h2>
              <p className="text-[13px] text-[var(--muted)]">{stageLabel(selected.lane)}</p>
            </div>
            <label className="flex items-center justify-between gap-3">
              <span>Mandatory</span>
              <input type="checkbox" role="switch" checked={selected.mandatory} aria-checked={selected.mandatory}
                onChange={() => dispatch({ type: 'toggleMandatory', itemId: selected.id })}
                className={`h-5 w-5 accent-[var(--heritage)] ${focus}`} />
            </label>
            <div>
              <h3 className="text-[15px] font-medium text-ink">Dependencies</h3>
              {selected.dependsOn.length === 0 && <p className="text-[13px] text-[var(--muted)]">Waits for nothing.</p>}
              <ul className="space-y-1">
                {selected.dependsOn.map((d) => (
                  <li key={dependencyKey(d)} className="flex items-center justify-between gap-2 text-[13px]">
                    <span>Waits for {dependencyTitle(snapshot, d)}</span>
                    <button type="button" onClick={() => dispatch({ type: 'removeDependency', itemId: selected.id, dependency: d })}
                      aria-label={`Remove the Dependency on ${dependencyTitle(snapshot, d)}`}
                      className={`shrink-0 rounded-[4px] px-1.5 text-heritage hover:underline ${focus}`}>Remove</button>
                  </li>
                ))}
              </ul>
              {snapshot.timers.length > 0 && (
                <select value="" aria-label="Wait for a Timer" className={`mt-2 ${field}`}
                  onChange={(e) => {
                    const after = canvasReducer(snapshot, { type: 'waitForTimer', itemId: selected.id, timerId: e.target.value });
                    setNotice(after === snapshot ? 'That would make a loop: the Timer already waits for this Journey.' : null);
                    if (after !== snapshot) dispatch({ type: 'waitForTimer', itemId: selected.id, timerId: e.target.value });
                  }}>
                  <option value="">Wait for a Timer…</option>
                  {snapshot.timers.filter((t) => !selected.dependsOn.some((d) => d.kind === 'timer' && d.timerId === t.id))
                    .map((t) => <option key={t.id} value={t.id}>{t.label} ({timerLabel(t)})</option>)}
                </select>
              )}
            </div>
            <button type="button" onClick={() => { dispatch({ type: 'remove', itemId: selected.id }); setSelectedId(null); }}
              className={removeButton}>Remove from pathway</button>
          </aside>
        )}
        {selectedTimer && (
          <TimerPanel key={selectedTimer.id} snapshot={snapshot} timer={selectedTimer}
            onSave={(t) => {
              const m = timerMessage(t);
              if (m) return m;
              if (canvasReducer(snapshot, { type: 'saveTimer', timer: t }) === snapshot) return 'That would make a loop: something this Timer waits for already waits for it.';
              dispatch({ type: 'saveTimer', timer: t });
              return null;
            }}
            onRemove={() => { dispatch({ type: 'removeTimer', timerId: selectedTimer.id }); setSelectedId(null); }} />
        )}
        {selectedHardStop && (
          <HardStopPanel key={selectedHardStop.id} snapshot={snapshot} hardStop={selectedHardStop}
            onSave={(h) => dispatch({ type: 'saveHardStop', hardStop: h })}
            onRemove={() => { dispatch({ type: 'removeHardStop', hardStopId: selectedHardStop.id }); setSelectedId(null); }} />
        )}
      </div>
    </div>
  );
}

export function PathwayCanvas({ draft, library }: { draft: PathwaySnapshot; library: LibraryJourney[] }) {
  setLibrary(library);
  return <ReactFlowProvider><Builder draft={draft} /></ReactFlowProvider>;
}
