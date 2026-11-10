import { describe, expect, it } from 'vitest';
import { defaultPersonId } from './DemoControls';

const starters = [{ id: 'person-a' }, { id: 'person-bob' }];

describe('defaultPersonId', () => {
  it('picks the top-strip Person, when the persona cookie names someone in the list', () => {
    expect(defaultPersonId(starters, 'x=1; persona=bob')).toBe('person-bob');
  });
  it('keeps the first starter, when there is no cookie or the Person is not listed', () => {
    expect(defaultPersonId(starters, '')).toBe('person-a');
    expect(defaultPersonId(starters, 'persona=C')).toBe('person-a');
  });
});
