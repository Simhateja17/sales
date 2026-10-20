import plans from '@/lib/pricing.json';

// Workspaces from before monthly pricing still carry their old plan ids
// (atelier, maison, sovereign). Show those as legacy rather than a raw id.
const LEGACY: Record<string, string> = { atelier: 'Atelier', maison: 'Maison', sovereign: 'Sovereign' };

export function planLabel(planId: string | null | undefined, empty = 'No plan') {
  if (!planId) return empty;
  const plan = plans.find(item => item.id === planId);
  if (plan) return plan.name;
  return LEGACY[planId] ? `${LEGACY[planId]} (legacy plan)` : planId;
}
