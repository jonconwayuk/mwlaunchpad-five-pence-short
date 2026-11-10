import type { Metadata } from 'next';
import { IBM_Plex_Sans, IBM_Plex_Serif } from 'next/font/google';
import { SimulatedDateStrip } from '@/src/ui/components/SimulatedDateStrip';
import './globals.css';

const sans = IBM_Plex_Sans({ subsets: ['latin'], weight: ['400', '500', '600'], variable: '--font-sans-plex' });
const serif = IBM_Plex_Serif({ subsets: ['latin'], weight: ['400', '600'], variable: '--font-serif-plex' });

export const metadata: Metadata = { title: 'MW Launchpad' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${serif.variable}`}>
      <body className="font-sans">
        <SimulatedDateStrip />
        {children}
      </body>
    </html>
  );
}
