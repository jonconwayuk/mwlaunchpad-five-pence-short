import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { SimulatedDateStrip } from '@/src/ui/components/SimulatedDateStrip';
import { getDemoClock } from '@/src/db/queries';
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${serif.variable}`}>
      <body className="w-fit min-w-full font-sans">
        <SimulatedDateStrip initial={getDemoClock()} />
        {children}
      </body>
    </html>
  );
}
