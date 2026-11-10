import { cookies } from 'next/headers';

export type PersonaId = 'A' | 'B' | 'C';
export const PERSONAS: { id: PersonaId; name: string }[] = [
  { id: 'A', name: 'Alex Morgan' },
  { id: 'B', name: 'Sam Okafor' },
  { id: 'C', name: 'Dana Whitfield' },
];

export async function getPersona(): Promise<PersonaId> {
  const v = (await cookies()).get('persona')?.value;
  return PERSONAS.some((p) => p.id === v) ? (v as PersonaId) : 'A';
}
