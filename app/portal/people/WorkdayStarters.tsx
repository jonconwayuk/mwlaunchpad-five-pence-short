'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Hire {
  id: string; name: string; role: string; jobFamily: string; grade: string; location: string;
  startDate: string; lineManagerName: string; added: boolean;
}

export function WorkdayStarters() {
  const router = useRouter();
  const [hires, setHires] = useState<Hire[] | null>(null);
  const [message, setMessage] = useState('');

  async function load() {
    const res = await (await fetch('/api/workday/new-starters')).json();
    setHires(res.ok ? res.data : []);
  }
  async function add(h: Hire) {
    const res = await (await fetch('/api/workday/new-starters', { method: 'POST', body: JSON.stringify({ hireId: h.id }) })).json();
    setMessage(res.ok ? `${h.name} added. Open them below to apply a Pathway.` : res.error);
    await load();
    router.refresh();
  }

  return (
    <section className="mb-5 max-w-[720px]">
      <button type="button" onClick={() => (hires ? setHires(null) : load())}
        className="rounded-[4px] border border-heritage px-3 py-2 text-[14px] font-semibold text-heritage">
        Add new starter from Workday
      </button>
      {hires && (
        <div className="mt-3 rounded-[6px] border border-hairline p-3">
          <p className="mb-2 text-[12px] text-muted">New hires waiting in Workday. Simulated: sample data, not a real Workday connection.</p>
          <ul>
            {hires.map((h) => (
              <li key={h.id} className="mb-2 flex items-center justify-between gap-3 border-b border-hairline pb-2 last:border-0">
                <span className="text-[13px]">
                  <span className="block font-semibold">{h.name}</span>
                  <span className="block text-muted">{h.role}, {h.jobFamily}, grade {h.grade}, {h.location}</span>
                  <span className="block text-muted">Starts {h.startDate}. Line Manager: {h.lineManagerName}</span>
                </span>
                <button type="button" disabled={h.added} onClick={() => add(h)}
                  className="rounded-[4px] border border-hairline px-3 py-1 text-[13px] disabled:opacity-50">
                  {h.added ? 'Added' : 'Add'}
                </button>
              </li>
            ))}
            {hires.length === 0 && <li className="text-muted">Nobody is waiting in Workday.</li>}
          </ul>
        </div>
      )}
      {message && <p role="status" className="mt-2 text-[13px]">{message}</p>}
    </section>
  );
}
