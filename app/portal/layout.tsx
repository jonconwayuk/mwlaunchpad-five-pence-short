import Link from 'next/link';
import { getToday } from '@/src/lib/clock';
import { DemoControls } from '@/src/ui/components/demo-controls/DemoControls';
import { loadControlsData } from '@/src/ui/components/demo-controls/data';

export const dynamic = 'force-dynamic';

const NAV = [
  { href: '/portal/journeys', label: 'Journeys' },
  { href: '/portal/pathways', label: 'Pathways' },
  { href: '/portal/people', label: 'People' },
];

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen min-w-[1280px] text-[15px] leading-[1.45]">
      <nav className="w-[180px] shrink-0 bg-racing p-4 text-paper" aria-label="Admin Portal">
        <p className="mb-4 text-[18px] font-semibold">Admin Portal</p>
        <ul className="flex flex-col gap-1">
          {NAV.map((n) => (
            <li key={n.href}><Link href={n.href} className="block rounded-[4px] px-2 py-1 hover:bg-heritage">{n.label}</Link></li>
          ))}
        </ul>
      </nav>
      <div className="min-w-0 flex-1">
        <DemoControls data={loadControlsData()} today={getToday()} />
        {children}
      </div>
    </div>
  );
}
