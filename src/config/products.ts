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
// `installerVersioned` is the PRIMARY download link used by `/download`. Its
// filename embeds the version (Ultiplay_Setup_<x.y.z>.exe) and changes every
// release, so browsers/CDNs can never serve a stale cached copy — each visitor
// always gets the current build. `scripts/sync-version.mjs` rewrites it (and
// `currentVersion`) from the live S3 `version.json` on every build and right
// after each desktop release upload.
//
// `installerLatest` is the fixed-filename alias (`Ultiplay_Setup_latest.exe`).
// It's kept only as a stable fallback/reference; it is NOT used for the public
// download button because the constant filename is cache-stale-prone.
export const DOWNLOAD = {
	href: '/download',
	installerLatest:
		'https://ultiplay-updates.s3.us-east-1.amazonaws.com/releases/installer/Ultiplay_Setup_latest.exe',
	installerVersioned:
		'https://ultiplay-updates.s3.us-east-1.amazonaws.com/releases/installer/Ultiplay_Setup_2.0.185.exe',
	currentVersion: '2.0.185',
} as const;

// ---------------------------------------------------------------------------
// Stripe (paid Gold upgrade)
// ---------------------------------------------------------------------------
//
// Stripe Payment Link for Ultiplay Gold. Matches GOLD_PURCHASE_URL in the
// desktop app's licensing.py, so both the website and the in-app "Upgrade"
// button send users to the same checkout.
export const STRIPE = {
	goldPurchase: 'https://buy.stripe.com/14A6oIbeycMsdy48aleEo02',
} as const;

// ---------------------------------------------------------------------------
// License API (AWS Lambda Function URL)
// ---------------------------------------------------------------------------
//
// Same backend the desktop app talks to (LICENSE_API_BASE in licensing.py).
// The post-purchase `/thank-you` page calls
// `${apiBase}/by-session?session_id=...` to show the buyer their license key
// on screen the instant the Stripe webhook issues it — so they never depend on
// an email landing in their inbox. The session_id arrives via Stripe's
// `{CHECKOUT_SESSION_ID}` redirect template (configured on the Payment Link).
export const LICENSE = {
	apiBase:
		'https://vgycuwyjcdkybaesvjrut65u440vxgim.lambda-url.us-east-1.on.aws/v1/licenses',
	// Same-origin Vercel serverless proxy (`api/license-by-session.js`).
	// The thank-you page uses this instead of calling the Lambda URL from
	// the browser, which avoids cross-origin fetch failures.
	thankYouLookupBase: '/api/license-by-session',
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
	goldLive: true,
} as const;
