import plans from '@/lib/pricing.json';

/** Mirrors backend/lib/entitlements.js; both read the features listed in pricing.json. */
export type Feature = 'leads' | 'email' | 'invoices' | 'voice';

// Pre-monthly plans (atelier, maison, sovereign) keep what they had before plan families.
const LEGACY_FEATURES: Feature[] = ['leads', 'email', 'voice'];

export function planFeatures(planId: string | null | undefined): Feature[] {
  if (!planId) return [];
  const plan = plans.find(item => item.id === planId);
  return plan ? (plan.features as Feature[]) : LEGACY_FEATURES;
}

export function hasFeature(planId: string | null | undefined, feature: Feature) {
  return planFeatures(planId).includes(feature);
}

/** What to show on a locked screen, and which plan family unlocks it. */
export const FEATURE_UPSELL: Record<Feature, { title: string; copy: string; plan: string; planLabel: string }> = {
  leads: { title: 'Lead generation', copy: 'Find verified leads matched to your ideal customer.', plan: 'email', planLabel: 'Email' },
  email: { title: 'Email outreach', copy: 'Send personalised email sequences that stop when someone replies.', plan: 'email', planLabel: 'Email' },
  invoices: { title: 'Invoices and after-sales follow-up', copy: 'Send invoices, chase payment with automatic reminders, and check in with customers after they pay.', plan: 'email_invoice', planLabel: 'Email + Invoice' },
  voice: { title: 'AI voice agent', copy: 'An AI agent calls your leads, answers questions and books meetings.', plan: 'all_in_one', planLabel: 'All-in-one' },
};
