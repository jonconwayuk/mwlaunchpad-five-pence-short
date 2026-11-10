'use client';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { CARD_H, CARD_W, HARD_STOP_H, LANE_H, LANE_W, TIMER_H } from './model';

const dot = '!h-3 !w-3 !border-2 !border-paper !bg-everyday';
const fixedDot = '!h-2 !w-2 !border-0 !bg-[var(--hairline)]';
// Anchors for same-lane Dependencies (bottom of one card to the top of the next); not dragged from.
const anchor = '!h-1 !w-1 !min-h-0 !min-w-0 !border-0 !bg-transparent';

function Padlock() {
  return (
    <svg aria-label="Mandatory" role="img" width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6">
      <rect x="3" y="7" width="10" height="7" rx="1.5" />
      <path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2" />
    </svg>
  );
}

export function LaneNode({ data }: NodeProps) {
  const { label, index, dropHere } = data as { label: string; index: number; dropHere?: boolean };
  const fill = dropHere ? 'bg-calm' : index % 2 ? 'bg-[var(--paper-2)]' : 'bg-paper';
  return (
    <div
      style={{ width: LANE_W, height: LANE_H }}
      className={`border-r border-[var(--hairline)] px-4 pt-3 text-[13px] ${dropHere ? 'text-racing' : 'text-[var(--muted)]'} ${fill}`}
    >
      {label}{dropHere && <span className="ml-2 font-medium">Drop here</span>}
    </div>
  );
}

export function JourneyNode({ data, selected, dragging }: NodeProps) {
  const { title, subtitle, mandatory } = data as { title: string; subtitle: string; mandatory: boolean };
  return (
    <div
      style={{ width: CARD_W, height: CARD_H }}
      className={`flex flex-col justify-center rounded-[6px] border bg-paper px-3 ${
        selected ? 'border-vibrant ring-2 ring-vibrant' : 'border-[var(--hairline)]'
      } ${dragging ? 'shadow-lg' : ''}`}
    >
      <Handle id="left" type="target" position={Position.Left} className={dot} />
      <Handle id="top" type="target" position={Position.Top} isConnectable={false} className={anchor} />
      <div className="flex items-start justify-between gap-2">
        <span className="line-clamp-2 text-[15px] font-medium leading-[1.25] text-ink" title={title}>{title}</span>
        {mandatory && <span className="shrink-0 pt-0.5 text-racing"><Padlock /></span>}
      </div>
      <span className="truncate text-[13px] leading-[1.3] text-[var(--muted)]">{subtitle}</span>
      <Handle id="right" type="source" position={Position.Right} className={dot} title="Drag to the Journey that waits for this one" />
      <Handle id="bottom" type="source" position={Position.Bottom} isConnectable={false} className={anchor} />
    </div>
  );
}

export function ContainerNode({ data }: NodeProps) {
  const { label, width, height } = data as { label: string; width: number; height: number };
  return (
    <div style={{ width, height }} className="relative rounded-[12px] border-[1.5px] border-dashed border-heritage">
      <span className="absolute -top-2.5 left-3 bg-[var(--paper-2)] px-1 text-[13px] text-heritage">{label}</span>
      <Handle type="source" position={Position.Right} isConnectable={false} className={fixedDot} />
    </div>
  );
}

export function TimerNode({ data, dragging }: NodeProps) {
  const { label } = data as { label: string };
  return (
    <div style={{ width: CARD_W, height: TIMER_H }}
      className={`flex items-center gap-2 rounded-[6px] border border-[var(--hairline)] bg-paper px-3 text-[13px] text-ink ${dragging ? 'shadow-lg' : ''}`}>
      <svg aria-hidden width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6">
        <circle cx="8" cy="8" r="6" />
        <path d="M8 4.5V8l2.5 1.5" />
      </svg>
      {label}
      <Handle type="source" position={Position.Right} isConnectable={false} className={fixedDot} />
    </div>
  );
}

export function HardStopNode({ data, dragging }: NodeProps) {
  const { label, detail } = data as { label: string; detail: string };
  return (
    <div style={{ width: CARD_W, minHeight: HARD_STOP_H }} className={`rounded-[6px] bg-charcoal px-3 py-2 text-paper ${dragging ? 'shadow-lg' : ''}`}>
      <Handle type="target" position={Position.Left} isConnectable={false} className={fixedDot} />
      <div className="text-[13px]">Hard Stop</div>
      <div className="text-[15px] font-medium leading-[1.25]">{label}</div>
      <div className="text-[13px]">{detail}</div>
    </div>
  );
}

export const nodeTypes = {
  lane: LaneNode, journey: JourneyNode, container: ContainerNode, timer: TimerNode, hardStop: HardStopNode,
};
