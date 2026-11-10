import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { cookies } from 'next/headers';
import { Frame, TopStrip } from '@/src/ui/components/shell/TopStrip';
import { getDemoClock, getPerson } from '@/src/db/queries';
import { PERSONAS, getPersona } from '@/src/lib/persona';
import './globals.css';

// Local files: a build must never need the network (decision 28). Sans is one variable font.
const sans = localFont({ src: '../src/ui/fonts/plex-sans-latin.woff2', weight: '400 600', variable: '--font-sans-plex' });
const serif = localFont({
  src: [
    { path: '../src/ui/fonts/plex-serif-400.woff2', weight: '400' },
    { path: '../src/ui/fonts/plex-serif-600.woff2', weight: '600' },
  ],
  variable: '--font-serif-plex',
});

export const metadata: Metadata = { title: 'MW Launchpad' };

// Reads the Demo clock per request so the strip's first paint has the real date.
export const dynamic = 'force-dynamic';

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const layout = (await cookies()).get('layout')?.value === 'phone' ? 'phone' : 'desktop';
  // A persona not seeded yet still appears; its Manager and Buddy views fall back to /team's default viewer.
  const people = PERSONAS.map((p) => {
    const row = getPerson(p.personId);
    return { id: p.id, name: row?.name ?? p.name, lineManagerId: row?.lineManagerId ?? undefined, buddyId: row?.buddyId ?? undefined };
  });
  return (
    <html lang="en" className={`${sans.variable} ${serif.variable}`}>
      <body className="w-fit min-w-full font-sans">
        <TopStrip initialDate={getDemoClock()} people={people} personaId={await getPersona()} layout={layout} />
        <Frame layout={layout}>{children}</Frame>
      </body>
    </html>
  );
}
