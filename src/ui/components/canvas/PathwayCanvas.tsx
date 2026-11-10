'use client';
import '@xyflow/react/dist/style.css';
import {
  MarkerType, ReactFlow, ReactFlowProvider, applyNodeChanges, useReactFlow,
  type Connection, type Edge, type Node, type NodeChange,
} from '@xyflow/react';
import { useCallback, useEffect, useMemo, useReducer, useRef, useState, type DragEvent } from 'react';
import { demoState } from '@/src/engine/fixtures';
import type { DependencyRef, PathwaySnapshot, StageId, Tags } from '@/src/engine/types';
import { LIBRARY, STAGES, TAG_LISTS } from './library';
import {
  CARD_H, CARD_W, LANE_W, canvasReducer, dependencyKey, laneExtent, laneX, loopMessage,
  snapToLane, snapshotFromFixture, timerLabel, titleOfJourney,
} from './model';
import { nodeTypes } from './nodes';

const DRAG_TYPE = 'application/x-launchpad-journey';
const STAGE_TYPE = 'application/x-launchpad-stage';
const focus = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-vibrant';
const stageLabel = (id: string) => STAGES.find((s) => s.id === id)?.label ?? id;

// Timers and Hard Stops have no canvas position in PathwaySnapshot, so their first spot is fixed here.
const blockStart = (kind: 'timer' | 'hardStop', index: number) =>
  kind === 'timer'
    ? index === 0 ? { x: laneX('pre-employment') + 24, y: 620 } : { x: laneX('onboarding') + 24, y: 72 }
    : { x: laneX('onboarding') + 16, y: 480 + index * 110 };

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
    data: { title: titleOfJourney(i.journeyId), stage: stageLabel(i.lane), mandatory: i.mandatory },
  }, false));
  const timers: Node[] = s.timers.map((t, index) => keep({
    id: `timer:${t.id}`, type: 'timer', position: blockStart('timer', index), selectable: false, connectable: false,
    data: { label: timerLabel(t) },
  }, true));
  const hardStops: Node[] = s.hardStops.map((h, index) => keep({
    id: `hardStop:${h.id}`, type: 'hardStop', position: blockStart('hardStop', index), selectable: false, connectable: false,
    data: { label: h.label, detail: h.stops.wholePathway ? 'Stops the whole pathway' : 'Stops the work it is connected to' },
  }, true));
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
    ? [{ id: `${h.trigger.itemId}->hardStop:${h.id}`, source: h.trigger.itemId, sourceHandle: 'right', target: `hardStop:${h.id}`, type: 'smoothstep', label: 'If Failed',
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

function Builder({ pathwayId, title }: { pathwayId: string; title: string }) {
  // The whole Pathway lives in this one PathwaySnapshot so wave D2 can PUT it as-is.
  const [snapshot, dispatch] = useReducer(canvasReducer, undefined, () => snapshotFromFixture(demoState, pathwayId, title));
  const [nodes, setNodes] = useState<Node[]>(() => buildNodes(snapshot, []));
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const [dragStage, setDragStage] = useState<StageId | null>(null);
  const { screenToFlowPosition, getViewport, setViewport } = useReactFlow();
  const paneRef = useRef<HTMLDivElement>(null);

  useEffect(() => setNodes((prev) => buildNodes(snapshot, prev)), [snapshot]);
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
    const lowest = Math.max(0, ...snapshot.items.filter((i) => i.lane === stage).map((i) => i.y + CARD_H + 32));
    dispatch({ type: 'add', journeyId, x: laneX(stage), y: lowest });
    showCard(snapToLane(stage, laneX(stage), lowest).y);
  };
  const setTag = (key: keyof Tags, value: string) => {
    const tags: Tags = { ...snapshot.tags };
    if (value) tags[key] = value; else delete tags[key];
    dispatch({ type: 'tags', tags });
  };

  return (
    <div className="flex h-[calc(100vh-27px)] min-w-[1280px] flex-col bg-paper text-[15px] leading-[1.45] text-ink">
      <header className="flex items-center gap-4 border-b border-[var(--hairline)] px-4 py-3">
        <h1 className="text-[21.6px] font-semibold text-racing">Pathway: {snapshot.title}</h1>
        <span className="text-[13px] text-[var(--muted)]">v{snapshot.version}</span>
        <div className="flex flex-1 flex-wrap items-center gap-2">
          {TAG_LISTS.map((list) => (
            <select key={list.key} value={snapshot.tags[list.key] ?? ''} onChange={(e) => setTag(list.key, e.target.value)}
              aria-label={list.label} className={`rounded-[4px] border border-[var(--hairline)] px-2 py-1 text-[13px] ${focus}`}>
              <option value="">{list.label}: any</option>
              {list.values.map((v) => <option key={v} value={v}>{v}</option>)}
            </select>
          ))}
        </div>
        {saved && <span role="status" className="text-[13px] text-[var(--muted)]">{saved}</span>}
        {/* NEEDS: wave D2 wires Save draft and Publish to the API; local state only this wave */}
        <button type="button" onClick={() => setSaved('Draft saved')}
          className={`rounded-[4px] border border-heritage px-3 py-1.5 text-heritage ${focus}`}>Save draft</button>
        <button type="button" onClick={() => { dispatch({ type: 'publish' }); setSaved(`Published as version ${snapshot.version + 1}`); }}
          className={`rounded-[4px] bg-heritage px-3 py-1.5 text-paper ${focus}`}>Publish</button>
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
            onSelectionChange={({ nodes: sel }) => setSelectedId(sel.length === 1 && sel[0] && itemIds.has(sel[0].id) ? sel[0].id : null)}
            deleteKeyCode={null} connectionLineStyle={{ stroke: 'var(--everyday)', strokeWidth: 2 }}
            translateExtent={[[-200, -200], [LANE_W * STAGES.length + 200, 1600]]}
            minZoom={0.4} maxZoom={1.5}
          />
        </div>
        {selected && (
          // An overlay, so opening it never squeezes the lanes off the screen.
          <aside className="absolute inset-y-0 right-0 z-10 w-[264px] space-y-4 overflow-y-auto border-l border-[var(--hairline)] bg-paper p-4" aria-label="Pathway Item">
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
            </div>
            <button type="button" onClick={() => { dispatch({ type: 'remove', itemId: selected.id }); setSelectedId(null); }}
              className={`w-full rounded-[4px] border border-charcoal px-3 py-1.5 text-charcoal ${focus}`}>Remove from pathway</button>
          </aside>
        )}
      </div>
    </div>
  );
}

export function PathwayCanvas(props: { pathwayId: string; title: string }) {
  return <ReactFlowProvider><Builder {...props} /></ReactFlowProvider>;
}
