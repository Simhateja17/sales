/**
 * The tour, as data. No logic lives here — this file is the script, and every
 * decision about what to do with it is in logic.ts.
 *
 * Order: an action arc first (the shortest path a new workspace can take to a
 * campaign that is actually sending), then a shorter orientation pass over the
 * rest of the app. Only the three arc steps that require real work are gated,
 * and all three are skippable: connecting a mailbox is a several-minute detour,
 * and a tour that traps someone behind it gets abandoned rather than finished.
 *
 * Targets are `data-tour` attributes added to the real components. Never anchor
 * by class name, tag structure or nth-child — the first restyle breaks those,
 * silently, and the step degrades to a centred card without anyone noticing.
 */

import type { TourStep } from './types';

export const TOUR_STEPS: TourStep[] = [
  {
    id: 'welcome',
    route: '/dashboard',
    target: null,
    placement: 'center',
    title: 'A quick tour of CircleOn',
    body: 'CircleOn runs outbound email for you: it finds buyers, writes to them in your voice, and holds every send behind your approval. This takes about two minutes and picks up where you leave it.',
    footnote: 'Escape closes the tour at any point. You can replay it from Settings › Profile.',
  },
  {
    id: 'connect-mailbox',
    route: '/dashboard?page=settings&section=mailbox',
    target: '[data-tour="smtp-form"]',
    placement: 'left',
    title: 'Connect the mailbox you send from',
    body: 'Everything CircleOn sends leaves from your own mailbox, so replies land in your inbox and your domain builds its own reputation. Add the SMTP and IMAP details for that account here.',
    footnote: 'Most providers need an app password rather than your normal one.',
    requiresId: 'connect-mailbox',
    skippable: true,
  },
  {
    id: 'add-leads',
    route: '/dashboard?page=leads',
    target: '[data-tour="find-leads"]',
    placement: 'bottom',
    title: 'Bring in people worth writing to',
    body: 'Search by title, region and company size and CircleOn finds matching people, then verifies a work email for each one. You can also import a CSV or add someone by hand.',
    requiresId: 'add-leads',
    skippable: true,
  },
  {
    id: 'leads-verified',
    route: '/dashboard?page=leads',
    target: '[data-tour="leads-table"]',
    placement: 'top',
    title: 'Only verified emails get used',
    body: 'Each lead carries the state of its email address. Anything unverified is held back from campaigns rather than guessed at — a bounced send costs you more than a missed one.',
  },
  {
    id: 'first-campaign',
    route: '/dashboard?page=campaigns',
    target: '[data-tour="create-campaign"]',
    placement: 'bottom',
    title: 'Build your first campaign',
    body: 'A campaign is a short sequence, a set of leads, and a daily sending cap. CircleOn writes each email against what it knows about that specific person.',
    footnote: 'Nothing sends while you are building it. Come back here when the campaign is created.',
    requiresId: 'first-campaign',
    skippable: true,
  },
  {
    id: 'campaign-review',
    route: '/dashboard?page=campaigns',
    dynamicRoute: 'firstCampaign',
    // Anchored to the tab strip rather than the review panel itself: this page
    // opens on the leads tab, so the panel is not mounted when the step opens.
    // The spotlight stays clickable, so the reader can open it from here.
    target: '[data-tour="campaign-tabs"]',
    placement: 'bottom',
    title: 'Read what it wrote before anyone else does',
    body: 'Leads first, then the emails CircleOn drafted for them. Open Review emails to approve the ones that sound right, rewrite the ones that do not, and regenerate anything that misses.',
  },
  {
    id: 'campaign-launch',
    route: '/dashboard?page=campaigns',
    dynamicRoute: 'firstCampaign',
    target: '[data-tour="campaign-launch"]',
    placement: 'bottom',
    title: 'Launch when you are satisfied',
    body: 'Launching starts the schedule: approved emails go out inside your sending window, spread across the day at the cap you set. You can pause it at any point.',
  },
  {
    id: 'inbox-approval',
    route: '/dashboard?page=inbox',
    target: '[data-tour="inbox-workspace"]',
    placement: 'top',
    title: 'Replies come back here',
    body: 'CircleOn reads each reply, works out the intent, and drafts an answer with the whole thread in view. You approve, edit, or write your own.',
  },
  {
    id: 'nav',
    route: '/dashboard',
    target: '[data-tour="nav"]',
    placement: 'right',
    title: 'Everything else lives here',
    body: 'Leads, campaigns, the inbox, meetings and analytics. The inbox carries a count whenever replies are waiting on you.',
  },
  {
    id: 'meetings',
    route: '/dashboard?page=meetings',
    target: '[data-tour="meetings"]',
    placement: 'top',
    title: 'Meetings, and what came of them',
    body: 'Anything that turns into a booked call shows up here, along with the outcome you record afterwards.',
  },
  {
    id: 'analytics',
    route: '/dashboard?page=analytics',
    target: '[data-tour="analytics-kpis"]',
    placement: 'bottom',
    title: 'See what earns a reply',
    body: 'Sends, replies and meetings across your campaigns, so the next sequence is written against what actually worked rather than a hunch.',
  },
  {
    id: 'autopilot',
    route: '/dashboard?page=settings&section=autopilot',
    target: '[data-tour="autopilot-panel"]',
    placement: 'left',
    title: 'Hand over the routine part',
    body: 'Autopilot keeps campaigns topped up and sending on your schedule, within the caps you set here. It will not touch a campaign that still needs your attention.',
  },
  {
    id: 'finish',
    route: '/dashboard',
    target: null,
    placement: 'center',
    title: 'That is the whole thing',
    body: 'Start with the checklist on this page — mailbox, leads, campaign — and the rest follows from there.',
    footnote: 'Settings › Profile has a Restart tour button whenever you want this again, or a new teammate does.',
  },
];
