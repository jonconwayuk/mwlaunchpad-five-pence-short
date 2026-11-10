import type { Metadata } from 'next';
import { IBM_Plex_Sans, IBM_Plex_Serif } from 'next/font/google';
import { SimulatedDateStrip } from '@/src/ui/components/SimulatedDateStrip';
import { getDemoClock } from '@/src/db/queries';
import './globals.css';

const sans = IBM_Plex_Sans({ subsets: ['latin'], weight: ['400', '500', '600'], variable: '--font-sans-plex' });
const serif = IBM_Plex_Serif({ subsets: ['latin'], weight: ['400', '600'], variable: '--font-serif-plex' });

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
