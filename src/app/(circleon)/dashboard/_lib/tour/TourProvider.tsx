'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

import {
  getCampaigns,
  getLeads,
  getSmtpStatus,
  getTourState,
  patchTourState,
  type TourStateRecord,
} from '@/lib/api';
import {
  TOUR_GATE_CAMPAIGN,
  TOUR_GATE_LEADS,
  TOUR_GATE_MAILBOX,
  deriveCompletion,
  isCampaignEligibleLead,
  primaryCampaign,
} from './completion';
import { clampIndex, resumeIndex } from './logic';
import { TOUR_STEPS } from './steps';
import type { CompletionState, RouteContext, TourStatus } from './types';

interface TourContextValue {
  tourOpen: boolean;
  tourIndex: number;
  record: TourStateRecord;
  loading: boolean;
  /** True when progress could not be read, so first-run must not fire. */
  loadFailed: boolean;
  completion: CompletionState;
  routeContext: RouteContext;
  startTour: (options?: { restart?: boolean }) => void;
  goToTourStep: (index: number) => void;
  finishTour: (status: Extract<TourStatus, 'completed' | 'skipped'>) => void;
  refreshGate: (gateId: string) => Promise<void>;
}

const EMPTY_RECORD: TourStateRecord = {
  status: 'not_started',
  lastStepId: null,
  lastStepIndex: 0,
  seenStepIds: [],
  updatedAt: null,
};

const TourContext = createContext<TourContextValue | null>(null);

/**
 * Each gate names the single request that proves it. Polling one endpoint every
 * few seconds while a step is locked is cheap; refetching the whole dashboard
 * would not be, and only one gate can be blocking at a time.
 */
const GATE_SOURCES: Record<string, () => Promise<CompletionState>> = {
  [TOUR_GATE_MAILBOX]: async () => {
    const data = await getSmtpStatus();
    return { [TOUR_GATE_MAILBOX]: data.account?.status === 'connected' };
  },
  [TOUR_GATE_LEADS]: async () => {
    const data = await getLeads();
    return { [TOUR_GATE_LEADS]: data.leads.some(isCampaignEligibleLead) };
  },
  [TOUR_GATE_CAMPAIGN]: async () => {
    const data = await getCampaigns();
    return { [TOUR_GATE_CAMPAIGN]: Boolean(primaryCampaign(data.campaigns)) };
  },
};

export function TourProvider({ children }: { children: React.ReactNode }) {
  const [record, setRecord] = useState<TourStateRecord>(EMPTY_RECORD);
  const [loading, setLoading] = useState(true);
  const [tourOpen, setTourOpen] = useState(false);
  const [tourIndex, setTourIndex] = useState(0);
  const [completion, setCompletion] = useState<CompletionState>({});
  const [firstCampaignId, setFirstCampaignId] = useState<string | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);

  const recordRef = useRef(record);
  recordRef.current = record;

  useEffect(() => {
    let cancelled = false;
    getTourState()
      .then(data => { if (!cancelled) setRecord(data.tour); })
      // A tour that cannot read its own progress is not worth a banner over the
      // user's work: it simply stays closed rather than auto-starting for
      // somebody who has already seen it.
      .catch(() => { if (!cancelled) setLoadFailed(true); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  /**
   * Persistence is best-effort. Local state is updated first and kept whatever
   * the request does, so a dropped write costs the resume point, never the step
   * the user is looking at.
   */
  const persist = useCallback((patch: Partial<TourStateRecord> & { restart?: boolean }) => {
    setRecord(current => ({ ...current, ...patch, seenStepIds: patch.seenStepIds ?? current.seenStepIds }));
    patchTourState(patch)
      .then(data => setRecord(data.tour))
      .catch(() => undefined);
  }, []);

  const recordPosition = useCallback((index: number) => {
    const step = TOUR_STEPS[index];
    if (!step) return;
    setRecord(current => ({
      ...current,
      status: 'in_progress',
      lastStepId: step.id,
      lastStepIndex: index,
      seenStepIds: current.seenStepIds.includes(step.id) ? current.seenStepIds : [...current.seenStepIds, step.id],
    }));
    patchTourState({ status: 'in_progress', lastStepId: step.id, lastStepIndex: index, seenStepIds: [step.id] })
      .catch(() => undefined);
  }, []);

  const goToTourStep = useCallback((index: number) => {
    const next = clampIndex(index, TOUR_STEPS.length);
    setTourIndex(next);
    recordPosition(next);
  }, [recordPosition]);

  const startTour = useCallback((options?: { restart?: boolean }) => {
    const index = options?.restart ? 0 : resumeIndex(TOUR_STEPS, recordRef.current);
    setTourIndex(index);
    setTourOpen(true);
    if (options?.restart) {
      const first = TOUR_STEPS[0];
      persist({
        status: 'in_progress',
        lastStepId: first ? first.id : null,
        lastStepIndex: 0,
        seenStepIds: first ? [first.id] : [],
        restart: true,
      });
    } else {
      recordPosition(index);
    }
  }, [persist, recordPosition]);

  const finishTour = useCallback((status: Extract<TourStatus, 'completed' | 'skipped'>) => {
    setTourOpen(false);
    setFirstCampaignId(null);
    persist({ status });
  }, [persist]);

  const refreshGate = useCallback(async (gateId: string) => {
    const source = GATE_SOURCES[gateId];
    if (!source) return;
    try {
      const result = await source();
      setCompletion(current => ({ ...current, ...result }));
    } catch {
      // Leave the gate as it was: a failed poll must not flip a step to unlocked.
    }
  }, []);

  // Gate data is fetched only once the tour is actually open, so a returning
  // user who never sees the tour pays nothing for it.
  useEffect(() => {
    if (!tourOpen) return;
    let cancelled = false;
    Promise.all([getSmtpStatus(), getLeads(), getCampaigns()])
      .then(([smtp, leadData, campaignData]) => {
        if (cancelled) return;
        setCompletion(deriveCompletion({
          smtpAccount: smtp.account,
          leads: leadData.leads,
          campaigns: campaignData.campaigns,
        }));
        setFirstCampaignId(primaryCampaign(campaignData.campaigns)?.id ?? null);
      })
      .catch(() => undefined);
    return () => { cancelled = true; };
  }, [tourOpen]);

  const routeContext = useMemo<RouteContext>(() => ({
    firstCampaign: firstCampaignId ? `/dashboard/campaigns/${firstCampaignId}` : null,
  }), [firstCampaignId]);

  const value = useMemo<TourContextValue>(() => ({
    tourOpen,
    tourIndex,
    record,
    loading,
    loadFailed,
    completion,
    routeContext,
    startTour,
    goToTourStep,
    finishTour,
    refreshGate,
  }), [tourOpen, tourIndex, record, loading, loadFailed, completion, routeContext, startTour, goToTourStep, finishTour, refreshGate]);

  return <TourContext.Provider value={value}>{children}</TourContext.Provider>;
}

/**
 * Returns null outside the provider rather than throwing, so a control that
 * offers the tour (the Restart button in Settings) can render on a page the
 * provider does not wrap without taking the page down with it.
 */
export function useTour() {
  return useContext(TourContext);
}
