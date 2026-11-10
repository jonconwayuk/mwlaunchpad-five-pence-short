import { cookies } from 'next/headers';

export type PersonaId = 'A' | 'B' | 'C';
export const PERSONAS: { id: PersonaId; personId: string; name: string }[] = [
  { id: 'A', personId: 'person-a', name: 'Alex Morgan' },
  { id: 'B', personId: 'person-b', name: 'Sam Okafor' },
  { id: 'C', personId: 'person-c', name: 'Dana Whitfield' },
];

export async function getPersona(): Promise<PersonaId> {
  const v = (await cookies()).get('persona')?.value;
  return PERSONAS.some((p) => p.id === v) ? (v as PersonaId) : 'A';
}
