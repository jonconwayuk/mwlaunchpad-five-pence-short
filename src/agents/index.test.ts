import { mkdtempSync, readdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { loadAgents, routeQuestion } from './index';

const agents = loadAgents(path.join(__dirname, '../../agents'));

describe('loadAgents', () => {
  it('loads every agent file, when the folder is valid, sorted by name', () => {
    const files = readdirSync(path.join(__dirname, '../../agents')).filter((f) => f.endsWith('.json'));
    expect(agents).toHaveLength(files.length);
    expect(agents.map((a) => a.name)).toEqual([...agents.map((a) => a.name)].sort((a, b) => a.localeCompare(b)));
  });

  it('throws an error naming the file, when a file is invalid', () => {
    const dir = mkdtempSync(path.join(tmpdir(), 'agents-'));
    writeFileSync(path.join(dir, 'broken.json'), JSON.stringify({ id: 'broken', name: 'Broken' }));
    expect(() => loadAgents(dir)).toThrow(/agents\/broken\.json/);
  });
});

describe('routeQuestion', () => {
  it('routes to the Payroll helper, when asked when pay arrives', () => {
    expect(routeQuestion('when do I get paid', agents)?.agent.id).toBe('payroll-helper');
  });

  it('routes to the Handover agent, when asked for a person', () => {
    expect(routeQuestion('Can I speak to a real person please?', agents)?.agent.handover).toBe(true);
  });

  it('routes every example to its own intent, when asked word for word', () => {
    for (const a of agents) for (const i of a.intents) for (const e of i.examples) {
      expect(routeQuestion(e, agents)?.intent.id, e).toBe(i.id);
    }
  });

  it('returns undefined, when no agent knows the question', () => {
    expect(routeQuestion('what is the weather on mars', agents)).toBeUndefined();
  });
});
