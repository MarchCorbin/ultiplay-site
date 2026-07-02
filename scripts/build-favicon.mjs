// Generate brand-artwork favicons from public/ultiplay-hero.jpg (which is the
// Ultiplay app icon artwork — byte-identical to the desktop app's icon).
//
// Run manually after the source artwork changes:
//   node scripts/build-favicon.mjs
//
// Produces, in public/:
//   - favicon-512.png   (Apple touch, Android home, high-DPI tab)
//   - favicon-192.png   (Android home / PWA / apple-touch)
//   - favicon-144.png   (Google search result favicon, 48px multiple)
//   - favicon-96.png    (Google search result favicon, 48px multiple)
//   - favicon-48.png    (Google's recommended minimum square)
//   - favicon-32.png    (browser bookmarks)
//   - favicon-16.png    (browser tab @1x)
//   - favicon.ico       (multi-resolution 16/32/48 — what Google/Bing fetch
//                        by convention at /favicon.ico)
//
// Why 48/96/144 matter: Google requires the favicon shown in Search results to
// be a square whose side is a MULTIPLE OF 48px. When a site only ships 16/32px
// icons, Google ignores them and shows the generic globe — which is exactly the
// bug this fixes.
//
// We crop a square focused on the sunglasses + upper face, because that's the
// most recognizable Ultiplay brand element at tiny sizes — the colorful video
// reflections in the lenses survive even at 16 px.

import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import pngToIco from 'png-to-ico';

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
	{ name: 'favicon-144.png', px: 144 },
	{ name: 'favicon-96.png', px: 96 },
	{ name: 'favicon-48.png', px: 48 },
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

// Multi-resolution favicon.ico (16/32/48) — Google & Bing fetch /favicon.ico
// by convention, and a 48px layer satisfies Google's "multiple of 48px" rule.
const icoOut = path.join(outDir, 'favicon.ico');
const icoBuf = await pngToIco([
	path.join(outDir, 'favicon-16.png'),
	path.join(outDir, 'favicon-32.png'),
	path.join(outDir, 'favicon-48.png'),
]);
await writeFile(icoOut, icoBuf);
console.log(`wrote ${path.relative(root, icoOut)} (16/32/48 multi-res)`);

console.log('done');
