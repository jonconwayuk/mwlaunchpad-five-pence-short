export type View = 'studio' | 'joiner' | 'manager' | 'buddy';
export interface SwitchPerson { id: string; name: string; lineManagerId?: string; buddyId?: string }

export const VIEWS: { id: View; label: string }[] = [
  { id: 'studio', label: 'Onboarding Studio' },
  { id: 'joiner', label: 'Joiner' },
  { id: 'manager', label: 'Manager' },
  { id: 'buddy', label: 'Buddy' },
];

/** Where a view lives for the chosen person. Without a Line Manager or Buddy, /team shows its default viewer. */
export function viewUrl(view: View, p: SwitchPerson): string {
  if (view === 'studio') return '/portal';
  if (view === 'joiner') return '/me';
  const viewer = view === 'manager' ? p.lineManagerId : p.buddyId;
  return viewer ? `/team?viewer=${encodeURIComponent(viewer)}` : '/team';
}

export function viewOf(pathname: string, viewer: string | null): View {
  if (pathname.startsWith('/me')) return 'joiner';
  if (pathname.startsWith('/team')) return viewer?.startsWith('buddy-') ? 'buddy' : 'manager';
  return 'studio';
}
