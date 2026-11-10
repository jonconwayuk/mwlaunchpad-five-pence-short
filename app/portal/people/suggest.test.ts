import { describe, expect, it } from 'vitest';
import { suggestPathway } from './suggest';

const PATHWAYS = [
  { id: 'pw-branch', tags: { jobFamily: 'Branch', platform: 'Retail', grade: 'B' } },
  { id: 'pw-engineer', tags: { jobFamily: 'Software engineering', platform: 'Technology', grade: 'C' } },
  { id: 'pw-infra-e', tags: { jobFamily: 'Modern Workplace', role: 'Infrastructure engineer', platform: 'Technology', grade: 'E' } },
];

describe('suggestPathway', () => {
  it('picks Infrastructure engineer E for Bob, when job family, role and grade all match', () => {
    expect(suggestPathway({ jobFamily: 'Modern Workplace', role: 'Infrastructure engineer', grade: 'E', platform: 'Technology' }, PATHWAYS)?.id).toBe('pw-infra-e');
  });
  it('picks Branch colleague for Persona A, when the Pathway has no role tag', () => {
    expect(suggestPathway({ jobFamily: 'Branch', role: 'Customer service colleague', grade: 'B' }, PATHWAYS)?.id).toBe('pw-branch');
  });
  it('skips a Pathway whose tag contradicts the person, even when others match', () => {
    expect(suggestPathway({ jobFamily: 'Modern Workplace', role: 'Line manager', grade: 'E' }, PATHWAYS)).toBeUndefined();
  });
  it('suggests nothing, when no tag matches', () => {
    expect(suggestPathway({ jobFamily: 'HR' }, PATHWAYS)).toBeUndefined();
  });
});
