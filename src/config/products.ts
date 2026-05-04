// Lemon Squeezy product links for Ultiplay.
//
// Both URLs are checkout/share links from the Lemon Squeezy dashboard:
//   Store > Products > [product] > Share > Copy link
//
// Updating these in one place updates every CTA across the site.

export const LEMONSQUEEZY = {
	// Free download — user gets the installer via email after a $0 "purchase".
	freeDownload: 'https://ultiplay.lemonsqueezy.com/checkout/buy/ca436858-e7cb-495d-afca-c8e263add871',

	// Ultiplay Gold — paid one-time purchase.
	goldPurchase: 'https://ultiplay.lemonsqueezy.com/checkout/buy/12a70ce4-18f5-407e-af71-e28e217dbdad',
} as const;

// Display price (kept here so the value shown on the site, in the app, and in
// any analytics events stays in sync). If you change the price in Lemon
// Squeezy, update it here too.
export const PRICING = {
	goldPrice: '$14.99',
	goldOriginalPrice: '$39.99',
} as const;
