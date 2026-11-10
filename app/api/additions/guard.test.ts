import { describe, expect, it } from 'vitest';
import type { PathwayItem } from '@/src/engine';
import { assertNoLoop } from './guard';

const mk = (id: string, dependsOn: PathwayItem['dependsOn'] = []): PathwayItem => ({
  id, journeyId: id, journeyVersion: 1, mandatory: false, dependsOn, lane: 'onboarding', x: 0, y: 0,
});

describe('assertNoLoop', () => {
  it('refuses an Addition that unlocks after itself', () => {
    expect(() => assertNoLoop([mk('a')], mk('add-j', [{ kind: 'item', itemId: 'add-j' }]), (id) => id)).toThrow(/loop/);
  });
  it('accepts an Addition that unlocks after an existing item or a Container', () => {
    expect(() => assertNoLoop([mk('a')], mk('add-j', [{ kind: 'item', itemId: 'a' }, { kind: 'container', containerId: 'c' }]), (id) => id)).not.toThrow();
  });
});
