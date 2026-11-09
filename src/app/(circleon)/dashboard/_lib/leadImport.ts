import type { ApolloFilters, LeadImportRun } from '@/lib/api';

export const csvTargets = ['full_name', 'first_name', 'last_name', 'company_name', 'title', 'email', 'phone', 'location', 'linkedin_url', 'company_domain', 'company_industry', 'company_size', 'external_id', 'ignore'];

export const terminalImportStatuses = new Set(['completed', 'partial', 'failed']);

function normalized(value: unknown) {
  return String(value ?? '').trim().toLowerCase();
}

function titleKey(titles: unknown) {
  return (Array.isArray(titles) ? titles : []).map(normalized).sort().join('|');
}

// Whether a finished run's results describe what the search form currently asks
// for. A blank form field is not a mismatch: the server fills it from the
// workspace defaults, so the run records a value the form never held.
export function importRunMatchesFilters(run: Pick<LeadImportRun, 'raw_meta'>, filters: ApolloFilters) {
  const searched = run.raw_meta?.filters as Partial<ApolloFilters> | undefined;
  if (!searched) return true;
  const sameText = (form: unknown, recorded: unknown) => !normalized(form) || normalized(form) === normalized(recorded);
  return (!filters.titles.length || titleKey(filters.titles) === titleKey(searched.titles))
    && sameText(filters.region, searched.region)
    && sameText(filters.industry, searched.industry)
    && sameText(filters.companySize, searched.companySize)
    && Number(filters.limit) === Number(searched.limit);
}
