import { notFound } from 'next/navigation';
import { buildEngineInput, getAppliedPathway, getPathwayVersionSemver, getPerson, listManualReminders, listPathways, listPersons } from '@/src/db/queries';
import { computeState } from '@/src/engine';
import type { ItemState, StageId } from '@/src/engine';
import { STAGES, STAGE_LABEL, shortDate } from '@/src/ui/components/starter/format';
import { ApplyPathway } from '../ApplyPathway';
import { DelegatePanel } from '../DelegatePanel';
import { NeedsDecisionPanel } from '../NeedsDecisionPanel';
import { ReminderPanel } from '../ReminderPanel';
import { suggestPathway } from '../suggest';

export const dynamic = 'force-dynamic';

const STATUS_WORD: Record<ItemState['status'], string> = {
  'not-started': 'Not started', 'in-progress': 'In progress', 'action-required': 'Action required',
  done: 'Done', skipped: 'Not for me', cancelled: 'Stopped',
};
// Section 5.3: severity by weight and bar, never hue.
const BAR: Record<ItemState['status'], string> = {
  'not-started': 'border-l-transparent text-muted', 'in-progress': 'border-l-heritage',
  'action-required': 'border-l-vibrant font-semibold', done: 'border-l-racing text-muted',
  skipped: 'border-l-transparent text-muted', cancelled: 'border-l-charcoal bg-charcoal text-paper',
};

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const person = getPerson(id);
  if (!person?.startDate) notFound();
  const applied = getAppliedPathway(id);
  const state = applied ? computeState(buildEngineInput(id)) : undefined;
  const hrTasks = state?.tasks.filter((t) => t.owner === 'hr') ?? [];
  const pathways = listPathways().filter((p) => p.liveVersion != null).map((p) => ({ id: p.id, title: p.title, tags: p.tags }));
  const suggested = suggestPathway(person.tags, pathways);
  const others = listPersons().filter((p) => p.id !== id);
  const delegate = others.find((p) => p.id === person.delegateId);
  const reminders = listManualReminders(id).map((r) => ({ id: r.id, message: r.message, at: shortDate(r.at) }));
  const h2 = 'mb-2 mt-6 text-[18px] font-semibold';
  return (
    <main className="max-w-[1000px] p-6">
      <h1 className="text-[26px] font-semibold">{person.name}</h1>
      <p className="mb-4 text-muted">
        {[person.tags.role, person.tags.grade && `grade ${person.tags.grade}`].filter(Boolean).join(", ")}, offer accepted {shortDate(person.offerAcceptedDate ?? person.startDate)}, starts {shortDate(person.startDate)}
        {state && `, ${STAGE_LABEL[state.stage]}`}
      </p>

      {state && state.needsDecisions.length > 0 && <NeedsDecisionPanel personId={id} decisions={state.needsDecisions} />}

      <h2 className={h2}>{applied ? 'Change the Pathway' : 'Apply a Pathway'}</h2>
      <ApplyPathway personId={id} firstName={person.name.split(' ')[0]} suggestedId={suggested?.id}
        pathways={[...(suggested ? [suggested] : []), ...pathways.filter((p) => p !== suggested)]} />

      <h2 className={h2}>Applied Pathway{applied && `: ${applied.snapshot.title} version ${getPathwayVersionSemver(applied.snapshot.pathwayId, applied.snapshot.version) ?? applied.snapshot.version}`}</h2>
      {state ? STAGES.map((stage: StageId) => {
        const items = state.items.filter((i) => i.stage === stage);
        return items.length === 0 ? null : (
          <section key={stage} className="mb-3">
            <h3 className="text-[13px] text-muted">{STAGE_LABEL[stage]}</h3>
            <ul>
              {items.map((i) => (
                <li key={i.itemId} className={`flex justify-between border-b border-hairline border-l-[3px] py-1 pl-2 ${BAR[i.status]} ${i.blockedFlag ? 'border-l-everyday border-dashed' : ''}`}>
                  <span>{i.title}{i.addedBy && ` (added by ${i.addedBy.name})`}</span>
                  <span className="text-[13px]">{STATUS_WORD[i.status]}{i.blockedFlag && ', waiting on a Hidden automation'}</span>
                </li>
              ))}
            </ul>
          </section>
        );
      }) : <p className="text-muted">No Pathway applied yet.</p>}

      <h2 className={h2}>Delegate</h2>
      <DelegatePanel personId={id} current={delegate && { id: delegate.id, name: delegate.name }}
        options={others.map((p) => ({ id: p.id, name: p.name, isDelegate: p.role === 'delegate' }))} />

      <h2 className={h2}>Send a Reminder now</h2>
      <ReminderPanel personId={id} sent={reminders} />

      <h2 className={h2}>HR To-do list</h2>
      {hrTasks.length === 0 ? <p className="text-muted">Nothing for HR to do.</p> : (
        <ul>{hrTasks.map((t) => <li key={t.itemId + t.actionId} className="border-b border-hairline py-1">{t.label} <span className="text-[13px] text-muted">raised {shortDate(t.raisedOn)}</span></li>)}</ul>
      )}
    </main>
  );
}
