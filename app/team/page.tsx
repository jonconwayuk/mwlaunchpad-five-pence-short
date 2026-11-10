import { TeamView } from '@/src/ui/components/team/TeamView';

// Viewing as: `?viewer=` picks a Line Manager or Buddy; the server checks the role. Default: Persona B's Line Manager.
export default async function Page({ searchParams }: { searchParams: Promise<{ viewer?: string }> }) {
  const { viewer = 'lm-chris' } = await searchParams;
  return <TeamView key={viewer} viewerId={viewer} as={viewer.startsWith('buddy-') ? 'buddy' : 'line-manager'} />;
}
