import { cookies } from 'next/headers';

export type PersonaId = 'bob' | 'A' | 'B' | 'C';
export const PERSONAS: { id: PersonaId; personId: string; name: string }[] = [
  { id: 'bob', personId: 'person-bob', name: 'Bob Warwick' },
  { id: 'A', personId: 'person-a', name: 'Alex Morgan' },
  { id: 'B', personId: 'person-b', name: 'Sam Okafor' },
  { id: 'C', personId: 'person-c', name: 'Dana Whitfield' },
];

export async function getPersona(): Promise<PersonaId> {
  const v = (await cookies()).get('persona')?.value;
  return PERSONAS.some((p) => p.id === v) ? (v as PersonaId) : 'bob';
}
