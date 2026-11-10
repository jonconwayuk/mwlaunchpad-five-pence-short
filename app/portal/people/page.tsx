import Link from 'next/link';
import { buildEngineInput, getAppliedPathway, listPersons } from '@/src/db/queries';
import { computeState } from '@/src/engine';
import { STAGE_LABEL } from '@/src/ui/components/starter/format';

export const dynamic = 'force-dynamic';

export default function Page() {
  const starters = listPersons().filter((p) => p.startDate);
  return (
    <main className="p-6">
      <h1 className="mb-4 text-[26px] font-semibold">People</h1>
      <table className="w-full border-collapse text-left">
        <thead className="text-[13px] text-muted">
          <tr className="border-b border-hairline"><th className="py-2 font-normal">Name</th><th className="font-normal">Stage</th><th className="font-normal">Applied Pathway</th></tr>
        </thead>
        <tbody>
          {starters.map((p) => {
            const applied = getAppliedPathway(p.id);
            const state = applied ? computeState(buildEngineInput(p.id)) : undefined;
            return (
              <tr key={p.id} className="border-b border-hairline">
                <td className="py-2"><Link className="font-semibold text-heritage underline" href={`/portal/people/${p.id}`}>{p.name}</Link></td>
                <td>{state ? STAGE_LABEL[state.stage] : 'No Pathway applied'}</td>
                <td>{applied ? `${applied.snapshot.title} v${applied.snapshot.version}` : 'None'}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </main>
  );
}
