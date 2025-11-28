const BACKEND = process.env.BACKEND_BASE_URL || "http://47.109.142.124:8080";

export default async function handler(req, res) {
  try {
    // Determine backend path and preserve query string.
    // req.url includes the path + query after the function mount point, e.g.
    // when calling /api/proxy/user/sendSms?x=1, req.url === '/api/proxy/user/sendSms?x=1'
    const mountPoint = "/api/proxy";
    let reqUrl = req.url || "";

    // Remove mountPoint prefix if present
    if (reqUrl.startsWith(mountPoint)) {
      reqUrl = reqUrl.slice(mountPoint.length);
    }

    // Strip leading slash
    if (reqUrl.startsWith("/")) reqUrl = reqUrl.slice(1);

    // Split path and query
    const qIdx = reqUrl.indexOf("?");
    const backendPath = qIdx === -1 ? reqUrl : reqUrl.slice(0, qIdx);
    const queryString = qIdx === -1 ? "" : reqUrl.slice(qIdx);

    // Build backend URL
    let url = BACKEND.replace(/\/$/, "");
    if (backendPath) url += "/" + backendPath;
    url += queryString;

    // Handle preflight
    if (req.method === "OPTIONS") {
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader(
        "Access-Control-Allow-Methods",
        "GET,POST,PUT,PATCH,DELETE,OPTIONS"
      );
      res.setHeader(
        "Access-Control-Allow-Headers",
        "Content-Type, Authorization"
      );
      res.status(204).end();
      return;
    }

    // Prepare headers: copy from original request but remove host
    const headers = { ...req.headers };
    delete headers.host;

    const fetchOptions = {
      method: req.method,
      headers,
    };

    if (req.method !== "GET" && req.method !== "HEAD") {
      try {
        fetchOptions.body =
          typeof req.body === "string"
            ? req.body
            : JSON.stringify(req.body || {});
      } catch (e) {
        fetchOptions.body = req.body;
      }
    }

    console.log("[proxy] ->", req.method, url);

    const backendRes = await fetch(url, fetchOptions);

    // Copy status
    res.status(backendRes.status);

    // Copy response headers (except hop-by-hop)
    backendRes.headers.forEach((value, key) => {
      if (
        ["connection", "keep-alive", "transfer-encoding", "upgrade"].includes(
          key.toLowerCase()
        )
      )
        return;
      res.setHeader(key, value);
    });

    const arrayBuffer = await backendRes.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    if (backendRes.status >= 400) {
      try {
        const text = buffer.toString("utf8");
        console.error("[proxy] backend error", backendRes.status, text);
        res.send(buffer);
        return;
      } catch (e) {
        console.error("[proxy] error reading backend body", e);
      }
    }

    res.send(buffer);
  } catch (err) {
    console.error("Proxy error:", err);
    res.status(502).json({ error: "proxy_error", message: String(err) });
  }
}
