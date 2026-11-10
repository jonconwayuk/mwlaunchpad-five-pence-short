'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { SECONDARY, post } from './post';

type Option = { id: string; name: string; isDelegate: boolean };

export function DelegatePanel({ personId, current, options }: { personId: string; current?: { id: string; name: string }; options: Option[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [choice, setChoice] = useState(options.find((o) => o.isDelegate)?.id ?? options[0]?.id ?? '');
  const [msg, setMsg] = useState('');

  async function save(delegateId: string | null) {
    const err = await post('/api/delegates', { personId, delegateId });
    setMsg(err || (delegateId ? 'Delegate saved.' : 'Delegate removed.'));
    if (!err) { setOpen(false); router.refresh(); }
  }
  return (
    <div>
      <p className="mb-2">{current ? <>{current.name} can act for this person.</> : 'Nobody can act for this person yet.'}</p>
      {open ? (
        <div className="flex flex-wrap items-end gap-2">
          <label className="flex flex-col text-[13px] text-muted">
            Delegate
            <select value={choice} onChange={(e) => setChoice(e.target.value)} className="mt-1 min-w-[240px] rounded-[4px] border border-hairline px-2 py-1 text-[15px] text-ink">
              <optgroup label="Delegates">{options.filter((o) => o.isDelegate).map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}</optgroup>
              <optgroup label="Everyone else">{options.filter((o) => !o.isDelegate).map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}</optgroup>
            </select>
          </label>
          <button className={SECONDARY} onClick={() => save(choice)}>Save delegate</button>
          <button className="px-2 py-1 text-[13px] text-muted underline" onClick={() => setOpen(false)}>Cancel</button>
        </div>
      ) : (
        <div className="flex gap-2">
          <button className={SECONDARY} onClick={() => setOpen(true)}>{current ? 'Change delegate' : 'Add a delegate'}</button>
          {current && <button className={SECONDARY} onClick={() => save(null)}>Remove</button>}
        </div>
      )}
      {msg && <p role="status" className="mt-2 text-[13px]">{msg}</p>}
    </div>
  );
}
