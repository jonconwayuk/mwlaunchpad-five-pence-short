import type { OracleAdapter } from './types';

// Synthetic cost centres only.
const COST_CENTRES: Record<string, string> = {
  Branch: 'CC-1001', 'Software engineering': 'CC-2001', Executive: 'CC-3001', 'Modern Workplace': 'CC-4001',
};

export const mockOracle: OracleAdapter = {
  async getCostCentre(jobFamily) {
    const cc = COST_CENTRES[jobFamily];
    if (!cc) throw new Error(`No cost centre on the mock finance system for ${jobFamily}`);
    return cc;
  },
};
