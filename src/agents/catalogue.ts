import { listJourneys } from '@/src/db/queries';
import { loadAgents } from './index';

// The Agent library as shown: each agent with the titles of the Journeys it supports. Unknown Journey ids are dropped.
export function agentCatalogue() {
  const titles = new Map(listJourneys().map((j) => [j.id, j.title]));
  return loadAgents().map((a) => ({
    ...a,
    journeys: a.journeyIds.flatMap((id) => { const title = titles.get(id); return title ? [{ id, title }] : []; }),
  }));
}
export type CatalogueAgent = ReturnType<typeof agentCatalogue>[number];
