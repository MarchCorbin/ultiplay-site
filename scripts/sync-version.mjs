#!/usr/bin/env node
/**
 * Sync the installer version on the download page with the live release
 * manifest in S3.
 *
 * Why this exists
 * ---------------
 * The desktop app publishes its release manifest to
 *
 *   https://ultiplay-updates.s3.us-east-1.amazonaws.com/releases/version.json
 *
 * which already drives the in-app self-update flow. The download page
 * needs the SAME source of truth so that the very moment we publish a
 * new release to AWS the website's version badge and "this exact build"
 * link reflect it -- no manual edits to `products.ts` per release.
 *
 * What it does
 * ------------
 * 1. Fetches `version.json` from S3.
 * 2. Parses the latest_version + file_name fields.
 * 3. Rewrites `src/config/products.ts` so that
 *
 *      DOWNLOAD.currentVersion       = <latest_version>
 *      DOWNLOAD.installerVersioned   = .../installer/Ultiplay_Setup_<latest_version>.exe
 *
 *    while leaving the rest of the file (`installerLatest`, Stripe URLs,
 *    Launch toggles, etc.) untouched.
 *
 * When it runs
 * ------------
 * - Automatically before every `npm run build` (wired into `package.json`
 *   as `prebuild`) so static HTML always ships with the correct version.
 * - Manually via `node scripts/sync-version.mjs` for ad-hoc syncs.
 * - From `aws_upload_update.py` immediately after a successful S3 upload
 *   so the website's source of truth flips in lockstep with the desktop
 *   release.
 *
 * Failure behaviour
 * -----------------
 * If S3 is unreachable, the script logs a warning and leaves the file
 * UNCHANGED.  We never want a CI/CD build to fail because of a transient
 * S3 hiccup; the previously-baked-in version stays in place until the
 * next successful sync.
 */

import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const VERSION_URL =
  'https://ultiplay-updates.s3.us-east-1.amazonaws.com/releases/version.json';
const INSTALLER_BASE =
  'https://ultiplay-updates.s3.us-east-1.amazonaws.com/releases/installer';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PRODUCTS_TS = resolve(__dirname, '..', 'src', 'config', 'products.ts');

/**
 * Validates a "x.y.z" semver-ish string the desktop app produces.
 * We're strict here because this value is interpolated directly into a
 * URL and into TypeScript source, so accepting garbage from S3 would
 * either produce a 404 link or break the build.
 */
function isValidVersion(v) {
  return typeof v === 'string' && /^\d+\.\d+\.\d+$/.test(v);
}

async function fetchLatestVersion() {
  // Cache-bust so a fresh build never picks up a stale CDN cache layer.
  const url = `${VERSION_URL}?t=${Date.now()}`;
  const res = await fetch(url, {
    headers: { 'Cache-Control': 'no-cache' },
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} ${res.statusText} from ${VERSION_URL}`);
  }
  const data = await res.json();
  const version = data.latest_version || data.version;
  if (!isValidVersion(version)) {
    throw new Error(
      `Unexpected version shape in ${VERSION_URL}: ${JSON.stringify(data).slice(0, 200)}`,
    );
  }
  return version;
}

/**
 * Replace a single quoted string assignment without touching the rest
 * of the file (comments, formatting, other fields).  Using a focused
 * regex rather than re-emitting the whole file means a tweak to the
 * `DOWNLOAD` object's surrounding context (comments, ordering, added
 * fields) survives intact.
 */
function replaceField(source, key, newValue) {
  // Matches:  <key>: 'literal'   OR   <key>:\n\t'literal'
  // and replaces only the literal between the quotes.
  const pattern = new RegExp(
    String.raw`(\b${key}\s*:\s*)(['"])([^'"]*?)(\2)`,
    'm',
  );
  if (!pattern.test(source)) {
    throw new Error(
      `Could not locate field "${key}" in products.ts -- did the file's shape change?`,
    );
  }
  return source.replace(pattern, (_, prefix, quote, _old, closingQuote) => {
    return `${prefix}${quote}${newValue}${closingQuote}`;
  });
}

async function main() {
  let latestVersion;
  try {
    latestVersion = await fetchLatestVersion();
  } catch (err) {
    console.warn(
      `[sync-version] WARN: could not reach ${VERSION_URL} -- ${err.message}`,
    );
    console.warn(
      '[sync-version] WARN: leaving products.ts unchanged (build continues with previously-synced version).',
    );
    process.exitCode = 0;
    return;
  }

  const installerVersioned = `${INSTALLER_BASE}/Ultiplay_Setup_${latestVersion}.exe`;

  const original = await readFile(PRODUCTS_TS, 'utf8');
  let updated = original;
  updated = replaceField(updated, 'currentVersion', latestVersion);
  updated = replaceField(updated, 'installerVersioned', installerVersioned);

  if (updated === original) {
    console.log(`[sync-version] Already in sync at v${latestVersion}.`);
    return;
  }

  await writeFile(PRODUCTS_TS, updated, 'utf8');
  console.log(`[sync-version] Updated products.ts to v${latestVersion}.`);
  console.log(`[sync-version]   currentVersion     = ${latestVersion}`);
  console.log(`[sync-version]   installerVersioned = ${installerVersioned}`);
}

main().catch((err) => {
  console.error('[sync-version] FATAL:', err);
  process.exit(1);
});
