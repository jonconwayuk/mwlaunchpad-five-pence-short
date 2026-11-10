import { PathwayCanvas } from '@/src/ui/components/canvas/PathwayCanvas';

// shortcut: titles for the three seeded templates only, wave D2 reads the Pathway from the database
const TITLES: Record<string, string> = {
  'branch-colleague': 'Branch colleague',
  'software-engineer': 'Software engineer',
  executive: 'Executive',
};

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <PathwayCanvas pathwayId={id} title={TITLES[id] ?? id} />;
}
