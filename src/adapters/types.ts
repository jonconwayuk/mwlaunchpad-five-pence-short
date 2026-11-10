// Mocked systems of record. Each mock returns pending until Demo controls simulates a result.
export type AdapterResult = 'pending' | 'passed' | 'failed' | 'returned';

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
