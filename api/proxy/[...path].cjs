const BACKEND = process.env.BACKEND_BASE_URL || "http://47.109.142.124:8080";

module.exports = async function (req, res) {
  try {
    const mountPoint = "/api/proxy";
    let reqUrl = req.url || "";

    if (reqUrl.startsWith(mountPoint)) reqUrl = reqUrl.slice(mountPoint.length);
    if (reqUrl.startsWith("/")) reqUrl = reqUrl.slice(1);

    const qIdx = reqUrl.indexOf("?");
    const backendPath = qIdx === -1 ? reqUrl : reqUrl.slice(0, qIdx);
    const queryString = qIdx === -1 ? "" : reqUrl.slice(qIdx);

    let url = BACKEND.replace(/\/$/, "");
    if (backendPath) url += "/" + backendPath;
    url += queryString;

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
      res.statusCode = 204;
      res.end();
      return;
    }

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

    res.statusCode = backendRes.status;

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
        res.end(buffer);
        return;
      } catch (e) {
        console.error("[proxy] error reading backend body", e);
      }
    }

    res.end(buffer);
  } catch (err) {
    console.error("Proxy error:", err);
    res.statusCode = 502;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: "proxy_error", message: String(err) }));
  }
};
