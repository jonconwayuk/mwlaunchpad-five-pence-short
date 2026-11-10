// Mocked systems of record. Each mock returns pending until Demo controls simulates a result.
export type AdapterResult = 'pending' | 'passed' | 'failed' | 'returned';

// Shared in-memory results on globalThis so Next.js route bundles see one store; Reset demo clears it.
const g = globalThis as typeof globalThis & { __adapterResults?: Map<string, Map<string, AdapterResult>> };
const stores = (g.__adapterResults ??= new Map());
export const adapterStore = (name: string): Map<string, AdapterResult> => {
  if (!stores.has(name)) stores.set(name, new Map());
  return stores.get(name)!;
};
export const resetAdapters = (): void => stores.forEach((m) => m.clear());

export interface WorkdayAdapter {
  /** Fetched on demand from the system of record and never stored. */
  getDeliveryAddress(personId: string): Promise<string>;
}
export interface VettingAdapter {
  getResult(personId: string): Promise<AdapterResult>;
  simulate(personId: string, result: Exclude<AdapterResult, 'pending'>): void;
}
export interface ItProvisioningAdapter {
  getResult(personId: string): Promise<AdapterResult>;
  simulate(personId: string, result: Exclude<AdapterResult, 'pending'>): void;
}
export interface MerchAdapter {
  getResult(personId: string): Promise<AdapterResult>;
  simulate(personId: string, result: Exclude<AdapterResult, 'pending'>): void;
}
export interface ServiceNowAdapter {
  getResult(personId: string): Promise<AdapterResult>;
  simulate(personId: string, result: Exclude<AdapterResult, 'pending'>): void;
}
export interface OracleAdapter {
  /** Synthetic cost centre for a job family; a mock lookup, nothing is charged. */
  getCostCentre(jobFamily: string): Promise<string>;
}
