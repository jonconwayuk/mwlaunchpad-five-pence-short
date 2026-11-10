import { describe, expect, it, vi } from 'vitest';
import { demoState } from '@/src/engine/fixtures';
import type { ActionDef, EngineState, ItemState } from '@/src/engine/types';
import { MAX_ROUNDS, completeInputs, countMessage, selectInputs, serviceNowCall } from './inputs';

const act = (o: Partial<ActionDef> & Pick<ActionDef, 'id' | 'type'>): ActionDef => ({ label: o.id, ...o });
const item = (itemId: string, currentAction?: ActionDef, status: ItemState['status'] = 'action-required'): ItemState =>
  ({ ...demoState.items[0]!, itemId, status, currentAction });
const state = (items: ItemState[], hold?: string): EngineState => ({
  ...demoState, items,
  needsDecisions: hold ? [{ hardStopId: 'h', label: 'x', reason: 'r', stopsItemIds: [], wholePathway: false, raisedOn: demoState.today, extendAllowed: false, triggerItemId: hold }] : [],
});

describe('selectInputs', () => {
  it('picks starter-owned read, provide, choose and task Actions with synthetic values, when they are waiting', () => {
    const s = state([
      item('i1', act({ id: 'a1', type: 'read' })),
      item('i2', act({ id: 'a2', type: 'provide' })),
      item('i3', act({ id: 'a3', type: 'choose', options: ['1', '5'] })),
      item('i4', act({ id: 'a4', type: 'task', owner: 'starter' })),
    ]);
    expect(selectInputs(s)).toEqual([
      { itemId: 'i1', actionId: 'a1' },
      { itemId: 'i2', actionId: 'a2', value: 'Demo value (synthetic)' },
      { itemId: 'i3', actionId: 'a3', value: '5' },
      { itemId: 'i4', actionId: 'a4' },
    ]);
  });
  it('skips automation, notification, other owners, done items, no Action and held Needs decisions, when mixed in', () => {
    const s = state([
      item('i1', act({ id: 'a1', type: 'automation' })),
      item('i2', act({ id: 'a2', type: 'task', owner: 'line-manager' })),
      item('i3', act({ id: 'a3', type: 'task', owner: 'buddy' })),
      item('i4', act({ id: 'a4', type: 'notification', owner: 'starter' })),
      item('i5', act({ id: 'a5', type: 'read' }), 'done'),
      item('i6', undefined, 'not-started'),
      item('i7', act({ id: 'a7', type: 'read' }), 'in-progress'),
    ], 'i7');
    expect(selectInputs(s)).toEqual([]);
  });
});

describe('countMessage', () => {
  it('says the count in plain words, including none and one', () => {
    expect(countMessage(0)).toBe('Completed 0 Actions');
    expect(countMessage(1)).toBe('Completed 1 Action');
    expect(countMessage(4)).toBe('Completed 4 Actions');
  });
});

describe('completeInputs', () => {
  it('posts each waiting Action to the Actions API as the person and counts the accepted ones', async () => {
    const s = state([item('i1', act({ id: 'a1', type: 'read' })), item('i2', act({ id: 'a2', type: 'read' }))]);
    let reads = 0;
    const f = vi.fn(async (url: string, init?: RequestInit) => {
      if (url.startsWith('/api/state')) return new Response(JSON.stringify({ ok: true, data: { engineState: reads++ ? state([]) : s } }));
      return new Response('{}', { status: JSON.parse(String(init?.body)).itemId === 'i2' ? 400 : 200 });
    });
    expect(await completeInputs('p1', f as unknown as typeof fetch)).toBe(1);
    expect(JSON.parse(String(f.mock.calls[1]![1]!.body))).toMatchObject({ itemId: 'i1', actionId: 'a1', actorPersonId: 'p1', personId: 'p1' });
  });
});

describe('completeInputs rounds', () => {
  const reply = (s: EngineState) => new Response(JSON.stringify({ ok: true, data: { engineState: s } }));
  it('picks up an Action revealed by the first round, then stops when none are left', async () => {
    const rounds = [state([item('i1', act({ id: 'a1', type: 'read' }))]), state([item('i1', act({ id: 'a2', type: 'provide' }))]), state([])];
    let n = 0;
    const f = vi.fn(async (url: string) => (url.startsWith('/api/state') ? reply(rounds[n++]!) : new Response('{}')));
    expect(await completeInputs('p1', f as unknown as typeof fetch)).toBe(2);
  });
  it('stops at the round cap when Actions keep appearing', async () => {
    const f = vi.fn(async (url: string) => (url.startsWith('/api/state') ? reply(state([item('i1', act({ id: 'a', type: 'read' }))])) : new Response('{}')));
    expect(await completeInputs('p1', f as unknown as typeof fetch)).toBe(MAX_ROUNDS);
  });
});

describe('serviceNowCall', () => {
  const w = (personId: string, itemId: string, actionId: string) => ({ personId, personName: 'n', itemId, actionId, title: 't', setsOutcome: false });
  it('is the returned call when the equipment Item waits on its ServiceNow Action for that person', () => {
    expect(serviceNowCall([w('p1', 'i-equipment', 'j-equipment-request-a1')], 'p1'))
      .toEqual({ personId: 'p1', itemId: 'i-equipment', actionId: 'j-equipment-request-a1', result: 'returned' });
  });
  it('is undefined for another person, another Item or nothing waiting', () => {
    expect(serviceNowCall([w('p2', 'i-equipment', 'j-equipment-request-a1')], 'p1')).toBeUndefined();
    expect(serviceNowCall([w('p1', 'i-other', 'x')], 'p1')).toBeUndefined();
    expect(serviceNowCall([], 'p1')).toBeUndefined();
  });
});
