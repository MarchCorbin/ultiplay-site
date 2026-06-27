// Central source of truth for the published legal surface.
//
// Lifts the substantive copy values from UltiplayOG/LEGAL.md so every legal
// page renders the same effective date, publisher identity, and email
// addresses without scattered string literals.
//
// IMPORTANT: do NOT change the substantive values here without a matching
// edit in UltiplayOG/LEGAL.md (the authoritative source). See
// UltiplayOG/Legal_Directions.md.

// ---------------------------------------------------------------------------
// Effective / Last-Updated date
// ---------------------------------------------------------------------------
//
// Replaces the [TBD] placeholder used throughout LEGAL.md. Every published
// legal page stamps this single value into its "Last updated:" header so the
// document set stays internally consistent.
export const LEGAL_EFFECTIVE_DATE = 'June 27, 2026';

// ---------------------------------------------------------------------------
// Publisher identity
// ---------------------------------------------------------------------------
//
// Use these exact values everywhere the legal entity is named on the site.
export const PUBLISHER = {
	legalName: 'Ultiplay LLC',
	formation: 'a Colorado limited liability company',
	addressLine1: '481 W. Prentice Ave #111',
	city: 'Littleton',
	region: 'CO',
	postal: '80120',
	country: 'United States',
	phone: '720-626-1125',
} as const;

// ---------------------------------------------------------------------------
// Email routing
// ---------------------------------------------------------------------------
//
// LEGAL.md § 10 establishes six specialized email addresses. Until aliases
// are configured at the mail provider (Zoho) so privacy@, abuse@, dmca@,
// legal@, and press@ actually deliver, every mailto: link routes to
// support@ with a subject prefix that identifies the topic. The displayed
// address text remains the canonical specialized address so the published
// copy matches LEGAL.md verbatim.
//
// To remove the aliasing once the inboxes are live, set
// ALIAS_ALL_TO_SUPPORT to false (or delete it) — every helper below will
// then resolve to the canonical address.

const SUPPORT_INBOX = 'support@ultiplay.net';
const ALIAS_ALL_TO_SUPPORT = true;

export type EmailKey = 'support' | 'privacy' | 'abuse' | 'dmca' | 'legal' | 'press';

export const EMAILS: Record<EmailKey, string> = {
	support: 'support@ultiplay.net',
	privacy: 'privacy@ultiplay.net',
	abuse: 'abuse@ultiplay.net',
	dmca: 'dmca@ultiplay.net',
	legal: 'legal@ultiplay.net',
	press: 'press@ultiplay.net',
};

const SUBJECT_PREFIX: Record<EmailKey, string> = {
	support: '[Ultiplay] Support',
	privacy: '[Ultiplay] Privacy / data-rights request',
	abuse: '[Ultiplay] Abuse / AUP report',
	dmca: '[Ultiplay] DMCA / copyright',
	legal: '[Ultiplay] Legal / OSS source request',
	press: '[Ultiplay] Press inquiry',
};

export function mailtoHref(key: EmailKey, subject?: string): string {
	const target = ALIAS_ALL_TO_SUPPORT ? SUPPORT_INBOX : EMAILS[key];
	const resolvedSubject = subject ?? SUBJECT_PREFIX[key];
	return `mailto:${target}?subject=${encodeURIComponent(resolvedSubject)}`;
}

// ---------------------------------------------------------------------------
// Legal document routes
// ---------------------------------------------------------------------------
//
// Every public legal page lives at one of these routes. Imported by the
// footer and the master /legal index so renaming or adding a page only
// requires one change here.
export const LEGAL_ROUTES = {
	index: '/legal',
	eula: '/eula',
	privacy: '/privacy',
	terms: '/terms',
	acceptableUse: '/acceptable-use',
	dmca: '/dmca',
	licenses: '/licenses',
	cookies: '/cookies',
	refunds: '/refunds',
	trademark: '/trademark',
} as const;
