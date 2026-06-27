/**
 * Same-origin proxy for the post-purchase thank-you page.
 *
 * Browsers fetch this route on ultiplay.net instead of calling the Lambda
 * Function URL directly, which avoids cross-origin fetch issues (ad blockers,
 * privacy extensions, CORP quirks) and keeps the license API URL server-side.
 */
const LICENSE_API_BASE =
	process.env.LICENSE_API_BASE ||
	'https://vgycuwyjcdkybaesvjrut65u440vxgim.lambda-url.us-east-1.on.aws/v1/licenses';

export default async function handler(req, res) {
	if (req.method === 'OPTIONS') {
		res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
		res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
		return res.status(204).end();
	}

	if (req.method !== 'GET') {
		res.setHeader('Allow', 'GET, OPTIONS');
		return res.status(405).json({ ready: false, error: 'Method not allowed.' });
	}

	const sessionId = String(req.query.session_id || '').trim();
	if (!sessionId) {
		return res.status(400).json({ ready: false, error: 'session_id is required.' });
	}

	const url =
		LICENSE_API_BASE.replace(/\/$/, '') +
		'/by-session?session_id=' +
		encodeURIComponent(sessionId);

	try {
		const upstream = await fetch(url, { cache: 'no-store' });
		const body = await upstream.text();
		res.setHeader('Cache-Control', 'no-store, max-age=0');
		res.setHeader('Content-Type', 'application/json; charset=utf-8');
		return res.status(upstream.status).send(body);
	} catch (err) {
		console.error('license-by-session proxy failed:', err);
		return res.status(502).json({
			ready: false,
			error: 'License lookup failed. Please try again.',
		});
	}
}
