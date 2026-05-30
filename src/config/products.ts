// Central source of truth for Ultiplay product links and launch state.
//
// Update values here and every CTA, label, and route across the site picks up
// the change.

// ---------------------------------------------------------------------------
// Download (free installer, hosted on AWS S3)
// ---------------------------------------------------------------------------
//
// The site links to `/download` — a same-origin 302 redirect declared in
// `astro.config.mjs` — which keeps the public URL clean and lets us swap the
// backing object without touching components.
//
// `installerLatest` is the underlying S3 object (Content-Disposition forces a
// download with a clean `Ultiplay_Setup.exe` filename). `installerVersioned`
// is a specific build that never changes once published, useful for release
// notes or "download this exact version" links.
export const DOWNLOAD = {
	href: '/download',
	installerLatest:
		'https://ultiplay-updates.s3.us-east-1.amazonaws.com/releases/installer/Ultiplay_Setup_latest.exe',
	installerVersioned:
		'https://ultiplay-updates.s3.us-east-1.amazonaws.com/releases/installer/Ultiplay_Setup_2.0.137.exe',
	currentVersion: '2.0.137',
} as const;

// ---------------------------------------------------------------------------
// Stripe (paid Gold upgrade)
// ---------------------------------------------------------------------------
//
// Stripe Payment Link for Ultiplay Gold. Matches GOLD_PURCHASE_URL in the
// desktop app's licensing.py, so both the website and the in-app "Upgrade"
// button send users to the same checkout.
export const STRIPE = {
	goldPurchase: 'https://buy.stripe.com/eVqaEY6YidQw3XucqBeEo00',
} as const;

// ---------------------------------------------------------------------------
// Pricing (display values)
// ---------------------------------------------------------------------------
//
// Keep in sync with the Stripe product price.
export const PRICING = {
	goldPrice: '$14.99',
	goldOriginalPrice: '$39.99',
} as const;

// ---------------------------------------------------------------------------
// Launch state — two independent phases
// ---------------------------------------------------------------------------
//
//   downloadLive: false  → primary CTAs route to /#notify (waitlist)
//   downloadLive: true   → primary CTAs route to /download (free installer)
//
//   goldLive: false  → Gold CTAs route to /#notify (waitlist for paid tier)
//   goldLive: true   → Gold CTAs route to Stripe checkout
//
// Flip `downloadLive` first to ship the free app, then flip `goldLive` once the
// end-to-end Stripe → license email → in-app activation loop is verified.
export const SITE = {
	downloadLive: true,
	goldLive: false,
} as const;
