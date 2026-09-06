/**
 * The single definition of "has this actually been done".
 *
 * The Home checklist and the tour's gates both read these functions, so the
 * tour can never unlock a step the checklist still shows as outstanding, or
 * hold one the checklist has already ticked. Anything that gates a tour step
 * belongs here rather than in the tour, because the app has to agree with it.
 */

import type { Campaign, ConnectedAccount, Lead } from '@/lib/api';
import type { CompletionState } from './types';

export const TOUR_GATE_MAILBOX = 'connect-mailbox';
export const TOUR_GATE_LEADS = 'add-leads';
export const TOUR_GATE_CAMPAIGN = 'first-campaign';

/**
 * A lead only counts once it has a real address and is not suppressed or
 * blocked: those are the leads a campaign is allowed to send to, so they are
 * also the ones that mean "you have leads".
 */
export function isCampaignEligibleLead(lead: Lead | undefined) {
  return Boolean(
    lead?.email
    && ['ready', 'selected_for_campaign'].includes(lead.lifecycle_status || '')
    && lead.lifecycle_status !== 'suppressed'
    && lead.dnc_status !== 'blocked'
  );
}

/** The campaign the Home page features: a running one, else a ready one, else the first. */
export function primaryCampaign(campaigns: Campaign[]): Campaign | null {
  return campaigns.find(campaign => campaign.status === 'active')
    || campaigns.find(campaign => campaign.status === 'ready')
    || campaigns[0]
    || null;
}

export interface CompletionSources {
  smtpAccount: ConnectedAccount | null;
  leads: Lead[];
  campaigns: Campaign[];
}

export function deriveCompletion({ smtpAccount, leads, campaigns }: CompletionSources): CompletionState {
  return {
    [TOUR_GATE_MAILBOX]: smtpAccount?.status === 'connected',
    [TOUR_GATE_LEADS]: leads.some(isCampaignEligibleLead),
    [TOUR_GATE_CAMPAIGN]: Boolean(primaryCampaign(campaigns)),
  };
}
