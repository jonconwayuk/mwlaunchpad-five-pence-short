'use client';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { SimulatedDateStrip } from '@/src/ui/components/SimulatedDateStrip';
import { VIEWS, viewOf, viewUrl, type SwitchPerson, type View } from './views';

const FIELD =
  'min-h-[44px] rounded-[4px] border border-charcoal bg-ink px-2 text-[13px] text-paper focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-vibrant';

const setCookie = (k: string, v: string) => {
  document.cookie = `${k}=${encodeURIComponent(v)}; path=/; samesite=lax`;
};

/** One switcher for the whole demo: view, person and layout, beside the Simulated date. */
export function TopStrip({ initialDate, people, personaId, layout }: {
  initialDate: string; people: SwitchPerson[]; personaId: string; layout: 'phone' | 'desktop';
}) {
  const router = useRouter();
  const pathname = usePathname();
  const viewer = useSearchParams().get('viewer');
  const view = viewOf(pathname, viewer);
  const person = people.find((p) => p.id === personaId) ?? people[0];

  const go = (v: View, p: SwitchPerson) => {
    setCookie('persona', p.id);
    router.push(viewUrl(v, p));
    router.refresh();
  };

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 bg-ink px-4 py-1 text-paper">
      <SimulatedDateStrip initial={initialDate} />
      <div role="group" aria-label="Switch view" className="ml-auto flex flex-wrap items-center gap-2 text-[13px]">
        <label className="flex items-center gap-1">View
          <select className={FIELD} value={view} onChange={(e) => go(e.target.value as View, person)}>
            {VIEWS.map((v) => <option key={v.id} value={v.id}>{v.label}</option>)}
          </select>
        </label>
        <label className="flex items-center gap-1">Person
          <select className={FIELD} value={person.id} onChange={(e) => go(view, people.find((p) => p.id === e.target.value) ?? person)}>
            {people.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </label>
        <label className="flex items-center gap-1">Layout
          <select className={FIELD} value={layout} onChange={(e) => { setCookie('layout', e.target.value); router.refresh(); }}>
            <option value="phone">Phone</option>
            <option value="desktop">Desktop</option>
          </select>
        </label>
      </div>
    </div>
  );
}

/** Phone layout: the joiner, manager and buddy faces sit in a 390px frame. The Studio is a laptop screen, so it stays full width. */
export function Frame({ layout, children }: { layout: 'phone' | 'desktop'; children: React.ReactNode }) {
  const studio = viewOf(usePathname(), null) === 'studio';
  if (layout !== 'phone' || studio) return <div className="@container">{children}</div>;
  return (
    <div className="bg-paper-2 py-6 max-[430px]:py-0">
      <div className="@container mx-auto w-[390px] overflow-x-hidden rounded-[24px] border-[10px] max-[430px]:w-full max-[430px]:rounded-none max-[430px]:border-0 border-charcoal bg-paper">{children}</div>
    </div>
  );
}
