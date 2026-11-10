import { describe, expect, it } from 'vitest';
import { viewOf, viewUrl } from './views';

const bob = { id: 'bob', name: 'Bob Warwick', lineManagerId: 'lm-hannah', buddyId: 'buddy-leo' };

describe('viewUrl', () => {
  it('maps each view to its route for the chosen person', () => {
    expect(viewUrl('studio', bob)).toBe('/portal');
    expect(viewUrl('joiner', bob)).toBe('/me');
    expect(viewUrl('manager', bob)).toBe('/team?viewer=lm-hannah');
    expect(viewUrl('buddy', bob)).toBe('/team?viewer=buddy-leo');
  });
  it('falls back to the default team viewer when the person has no Line Manager or Buddy', () => {
    expect(viewUrl('buddy', { id: 'C', name: 'Dana' })).toBe('/team');
  });
});

describe('viewOf', () => {
  it('reads the view back from the route', () => {
    expect(viewOf('/portal/people', null)).toBe('studio');
    expect(viewOf('/me', null)).toBe('joiner');
    expect(viewOf('/team', 'buddy-leo')).toBe('buddy');
    expect(viewOf('/team', 'lm-hannah')).toBe('manager');
  });
});
