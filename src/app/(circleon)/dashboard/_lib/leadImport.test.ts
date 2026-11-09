import { describe, expect, it } from 'vitest';
import { importRunMatchesFilters } from './leadImport';

const searched = { titles: ['HR / People'], region: 'Singapore', industry: 'automotive', companySize: '1000+', limit: 25 };
const run = { raw_meta: { filters: searched } };

describe('importRunMatchesFilters', () => {
  it('matches the filters the run searched, ignoring case and role order', () => {
    expect(importRunMatchesFilters(run, { ...searched, region: ' singapore ' })).toBe(true);
    const twoRoles = { raw_meta: { filters: { ...searched, titles: ['HR / People', 'Founder / CEO'] } } };
    expect(importRunMatchesFilters(twoRoles, { ...searched, titles: ['Founder / CEO', 'HR / People'] })).toBe(true);
  });

  it('stops matching once a filter changes', () => {
    expect(importRunMatchesFilters(run, { ...searched, titles: ['HR / People', 'Founder / CEO'] })).toBe(false);
    expect(importRunMatchesFilters(run, { ...searched, industry: 'legal services' })).toBe(false);
    expect(importRunMatchesFilters(run, { ...searched, companySize: '11-50' })).toBe(false);
    expect(importRunMatchesFilters(run, { ...searched, limit: 10 })).toBe(false);
  });

  it('treats blank form fields as matching, since the server fills them with defaults', () => {
    expect(importRunMatchesFilters(run, { ...searched, industry: '', companySize: '' })).toBe(true);
  });

  it('keeps showing runs that recorded no filters', () => {
    expect(importRunMatchesFilters({ raw_meta: {} }, searched)).toBe(true);
  });
});
