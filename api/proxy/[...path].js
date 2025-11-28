const BACKEND = process.env.BACKEND_BASE_URL || 'http://47.109.142.124:8080';

export default async function handler(req, res) {
  try {
    // Build backend URL
    const parts = req.query && req.query.path ? (Array.isArray(req.query.path) ? req.query.path : [req.query.path]) : [];
    const backendPath = parts.join('/');
    let url = BACKEND.replace(/\/$/, '') + '/' + backendPath;
    // preserve query string
    const idx = req.url.indexOf('?');
    if (idx !== -1) url += req.url.slice(idx);

    // Handle preflight
    if (req.method === 'OPTIONS') {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      res.status(204).end();
      return;
    }

    // Prepare headers: copy from original request but remove host
    const headers = { ...req.headers };
    delete headers.host;

    const fetchOptions = {
      method: req.method,
      headers,
      // keep redirect handling default
    };

    if (req.method !== 'GET' && req.method !== 'HEAD') {
      // If body already parsed (JSON), stringify; otherwise pass raw
      try {
        fetchOptions.body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body || {});
      } catch (e) {
        fetchOptions.body = req.body;
      }
    }

    // Debug log: which backend URL we call
    console.log('[proxy] ->', req.method, url);

    const backendRes = await fetch(url, fetchOptions);

    // Copy status
    res.status(backendRes.status);

    // Copy response headers (except hop-by-hop)
    backendRes.headers.forEach((value, key) => {
      if ([ 'connection', 'keep-alive', 'transfer-encoding', 'upgrade' ].includes(key.toLowerCase())) return;
      res.setHeader(key, value);
    });

    const arrayBuffer = await backendRes.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // If backend returned non-2xx, also log the body for debugging
    if (backendRes.status >= 400) {
      try {
        const text = buffer.toString('utf8');
        console.error('[proxy] backend error', backendRes.status, text);
        // Forward body as-is
        res.send(buffer);
        return;
      } catch (e) {
        console.error('[proxy] error reading backend body', e);
      }
    }

    res.send(buffer);
  } catch (err) {
    console.error('Proxy error:', err);
    res.status(502).json({ error: 'proxy_error', message: String(err) });
  }
}
