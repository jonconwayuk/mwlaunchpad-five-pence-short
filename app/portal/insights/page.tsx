import { Suspense } from 'react';
import { Insights } from '@/src/ui/components/insights/Insights';

export default function Page() {
  return <Suspense fallback={<p className="p-6">Loading insights…</p>}><Insights /></Suspense>;
}
