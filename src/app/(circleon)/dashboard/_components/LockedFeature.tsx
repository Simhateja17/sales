'use client';

import { FEATURE_UPSELL, type Feature } from '@/lib/entitlements';
import { planLabel } from '@/lib/planLabel';
import NavIcon from '../_lib/NavIcon';

/** Shown in place of a screen the workspace's plan does not include. */
export default function LockedFeature({ feature, planId, isOwner, onOpenBilling }: {
  feature: Feature;
  planId: string | null | undefined;
  isOwner: boolean;
  onOpenBilling: () => void;
}) {
  const upsell = FEATURE_UPSELL[feature];
  return (
    <section className="locked-feature" aria-labelledby="locked-feature-title">
      <span className="locked-feature-icon" aria-hidden="true"><NavIcon name="lock" /></span>
      <div className="page-kicker">Not in your plan</div>
      <h2 id="locked-feature-title" className="page-title">{upsell.title}</h2>
      <p className="page-sub">{upsell.copy}</p>
      <p className="locked-feature-plan">
        You are on <b>{planLabel(planId)}</b>. This is included in <b>{upsell.planLabel}</b>{feature === 'invoices' ? ' and All-in-one' : ''}.
      </p>
      <div className="locked-feature-actions">
        {isOwner ? (
          <button type="button" className="btn-primary" onClick={onOpenBilling}>See upgrade options</button>
        ) : (
          <p className="sf-hint">Ask your workspace owner to upgrade the plan.</p>
        )}
        <a className="btn-outline" href="/pricing#compare" target="_blank" rel="noopener noreferrer">Compare plans</a>
      </div>
    </section>
  );
}
