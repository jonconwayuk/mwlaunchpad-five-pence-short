import { buildEngineInput, getAppliedPathway, listPersons } from '@/src/db/queries';
import { computeState } from '@/src/engine';
import { STAGE_LABEL } from '@/src/ui/components/starter/format';
import { PeopleList } from './PeopleList';

export const dynamic = 'force-dynamic';

export default function Page() {
  const people = listPersons().filter((p) => p.startDate).map((p) => {
    const applied = getAppliedPathway(p.id);
    const state = applied ? computeState(buildEngineInput(p.id)) : undefined;
    return {
      id: p.id, name: p.name, jobTitle: [p.tags.role, p.tags.grade && `grade ${p.tags.grade}`].filter(Boolean).join(', '),
      stage: state ? `Stage: ${STAGE_LABEL[state.stage]}` : 'Not started yet',
      pathway: applied ? `Pathway: ${applied.snapshot.title}` : 'No Pathway yet',
    };
  });
  return (
    <main className="p-6">
      <h1 className="mb-4 text-[26px] font-semibold">People</h1>
      <PeopleList people={people} />
    </main>
  );
}
