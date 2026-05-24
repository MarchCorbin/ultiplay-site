// Generate brand-artwork favicons from public/ultiplay-hero.jpg.
//
// Run manually after the source artwork changes:
//   node scripts/build-favicon.mjs
//
// Produces, in public/:
//   - favicon-512.png   (Apple touch, Android home, high-DPI tab)
//   - favicon-192.png   (Android home / PWA)
//   - favicon-32.png    (browser bookmarks)
//   - favicon-16.png    (browser tab @1x)
//
// We crop a square focused on the sunglasses + upper face, because that's the
// most recognizable Ultiplay brand element at tiny sizes — the colorful video
// reflections in the lenses survive even at 16 px.

import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const src = path.join(root, 'public', 'ultiplay-hero.jpg');
const outDir = path.join(root, 'public');

await mkdir(outDir, { recursive: true });

const meta = await sharp(src).metadata();
const { width, height } = meta;
if (!width || !height) {
	throw new Error(`Could not read source dimensions for ${src}`);
}

// Tight square crop focused on the sunglasses. The face is centered
// horizontally and the iconic sunglasses sit in the upper third of the frame,
// so we bias the crop upward so the lenses dominate the tile.
const size = Math.min(width, height);
const left = Math.round((width - size) / 2);
const top = Math.max(0, Math.round(height * 0.05));
const cropSize = Math.min(size, height - top);

const baseCrop = sharp(src).extract({
	left,
	top,
	width: cropSize,
	height: cropSize,
});

const sizes = [
	{ name: 'favicon-512.png', px: 512 },
	{ name: 'favicon-192.png', px: 192 },
	{ name: 'favicon-32.png', px: 32 },
	{ name: 'favicon-16.png', px: 16 },
];

for (const { name, px } of sizes) {
	const out = path.join(outDir, name);
	await baseCrop
		.clone()
		.resize(px, px, { kernel: 'lanczos3' })
		.png({ compressionLevel: 9 })
		.toFile(out);
	console.log(`wrote ${path.relative(root, out)} (${px}x${px})`);
}

console.log('done');
