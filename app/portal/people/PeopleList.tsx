'use client';
import Link from 'next/link';
import { useState } from 'react';

export interface PersonRow { id: string; name: string; jobTitle: string; stage: string; pathway: string }

export function PeopleList({ people }: { people: PersonRow[] }) {
  const [q, setQ] = useState('');
  const shown = people.filter((p) => p.name.toLowerCase().includes(q.trim().toLowerCase()));
  return (
    <div>
      <label className="mb-1 block text-[13px] text-muted" htmlFor="find-person">Find a person</label>
      <input id="find-person" type="search" autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Type a name, for example Bob"
        className="mb-5 w-full max-w-[420px] rounded-[4px] border border-hairline px-3 py-2" />
      <ul className="max-w-[720px]">
        {shown.map((p) => (
          <li key={p.id}>
            <Link href={`/portal/people/${p.id}`} className="block rounded-[6px] border border-hairline px-4 py-3 mb-2 transition hover:-translate-y-[2px] hover:border-heritage">
              <span className="block font-semibold text-heritage">{p.name}</span>
              <span className="block text-[13px] text-muted">{p.jobTitle}</span>
              <span className="mt-1 block text-[13px]">{p.stage}. {p.pathway}.</span>
            </Link>
          </li>
        ))}
        {shown.length === 0 && <li className="text-muted">Nobody by that name.</li>}
      </ul>
    </div>
  );
}
