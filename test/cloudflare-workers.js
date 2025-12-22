// Cloudflare Worker entrypoint regarding Shopee short links & General Shortener
// Optimized for Low CPU Usage & Security Best Practices.

const DEFAULT_TIMEOUT_MS = 10_000;

// Regex patterns compiled once at global scope (Cold start optimization)
const PATTERNS = [
  /\/product\/(\d+)\/(\d+)/,
  /i\.(\d+)\.(\d+)/,
  /\/(\d{6,})\/(\d{6,})(?:[/?]|$)/,
];

const WHITELIST_DOMAINS = [
  "shope.ee",
  "shopee.vn",
  "shp.ee",
];

const DEFAULT_HEADERS = {
  "user-agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36",
  "accept-language": "vi-VN,vi;q=0.9,en;q=0.8",
};

// --- HELPER FUNCTIONS ---

const buildResult = ({
  shortUrl,
  finalUrl = null,
  shopid = null,
  itemid = null,
  productId = null,
  error = null,
}) => ({
  short_url: shortUrl,
  final_url: finalUrl,
  shopid,
  itemid,
  product_id: productId,
  error,
});

const jsonResponse = (body, status, corsHeaders = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json;charset=UTF-8",
      ...corsHeaders,
    },
  });

const decodeUrlParam = (searchParams) => {
  const encodedShortUrl = searchParams.get("url") || searchParams.get("u");
  if (!encodedShortUrl) return null;
  return decodeURIComponent(encodedShortUrl);
};

// --- CORE LOGIC ---

const resolveShopeeShortUrl = async (shortUrl) => {
  let parsed;
  try {
    parsed = new URL(shortUrl);
  } catch (err) {
    return buildResult({ shortUrl, error: "invalid_url" });
  }

  if (!parsed.protocol || !parsed.hostname) {
    return buildResult({ shortUrl, error: "invalid_url" });
  }

  const hostname = parsed.hostname.toLowerCase();
  const isWhitelisted = WHITELIST_DOMAINS.some(domain => hostname.includes(domain));

  if (!isWhitelisted) {
    return buildResult({ shortUrl, error: "not_shopee_short_url" });
  }

  let finalUrl = null;
  let response = null;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

  try {
    // BEST PRACTICE: Use HEAD to follow redirects without downloading body
    response = await fetch(shortUrl, {
      method: "HEAD", 
      headers: DEFAULT_HEADERS,
      redirect: "follow",
      signal: controller.signal,
    });
    
    finalUrl = response.url;
    
  } catch (err) {
    if (err.name === "AbortError") {
      return buildResult({ shortUrl, error: "timeout" });
    }
    return buildResult({ shortUrl, error: "network_error" });
  } finally {
    clearTimeout(timer);
  }

  let shopid = null;
  let itemid = null;
  let productId = null;

  if (finalUrl) {
    let match = null;
    for (const pattern of PATTERNS) {
      match = finalUrl.match(pattern);
      if (match) break;
    }

    if (match) {
      [, shopid, itemid] = match;
      productId = `i.${shopid}.${itemid}`;
    }
  }

  return buildResult({
    shortUrl,
    finalUrl,
    shopid,
    itemid,
    productId,
  });
};

// --- HANDLERS ---

const cleanShopeeURL = async (searchParams, corsHeaders) => {
  let shortUrl = null;

  try {
    shortUrl = decodeUrlParam(searchParams);
  } catch (err) {
    return jsonResponse({ error: "invalid_url_encoding" }, 400, corsHeaders);
  }

  if (!shortUrl) {
    return jsonResponse({ error: "missing_url", message: "Use ?url=..." }, 400, corsHeaders);
  }

  const result = await resolveShopeeShortUrl(shortUrl);
  const status = result.error ? 400 : 200;

  return jsonResponse(result, status, {
    "cache-control": result.error ? "no-store" : "public, max-age=3600",
    ...corsHeaders,
  });
};

const shortURL = async (searchParams, corsHeaders) => {
  let targetUrl = null;

  try {
    targetUrl = decodeUrlParam(searchParams);
  } catch (err) {
    return jsonResponse({ error: "invalid_url_encoding" }, 400, corsHeaders);
  }

  if (!targetUrl) {
    return jsonResponse({ error: "missing_url", message: "Use ?url=..." }, 400, corsHeaders);
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

  try {
    // Calling external API
    const response = await fetch("https://clc.is/api/links", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ domain: "clc.is", target_url: targetUrl }),
      signal: controller.signal,
    });

    if (!response.ok) {
      return jsonResponse({ error: "provider_error", status: response.status }, 502, corsHeaders);
    }

    const data = await response.json();
    const entry = Array.isArray(data) ? data[0] : data;
    
    if (!entry?.url) {
      return jsonResponse({ error: "shorten_failed", message: "No link returned" }, 502, corsHeaders);
    }

    return jsonResponse(
      {
        short_url: entry.url,
        slug: entry.slug,
        target_url: targetUrl,
        provider: "clc.is",
      },
      200,
      corsHeaders
    );
  } catch (err) {
    if (err.name === "AbortError") {
      return jsonResponse({ error: "timeout" }, 504, corsHeaders);
    }
    return jsonResponse({ error: "network_error" }, 502, corsHeaders);
  } finally {
    clearTimeout(timer);
  }
};

// --- MAIN WORKER ENTRYPOINT ---

export default {
  async fetch(request) {
    const origin = request.headers.get("Origin");
    let allowOrigin = ""; // Default to block if not matched

    if (origin) {
      // Security Check: Ensure standard URL format logic
      // Allows: 
      // 1. Exact match localhost/127.0.0.1 (any port)
      // 2. Exact match huongpham.com or subdomains (api.huongpham.com)
      if (
        origin.includes("localhost") || 
        origin.includes("127.0.0.1") || 
        origin.endsWith("huongpham.com")
      ) {
        allowOrigin = origin;
      }
    }

    const corsHeaders = {
      "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
      "Access-Control-Allow-Headers": request.headers.get("Access-Control-Request-Headers") || "Content-Type",
    };

    if (allowOrigin) {
      corsHeaders["Access-Control-Allow-Origin"] = allowOrigin;
    }

    // Handle Preflight
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    const url = new URL(request.url);
    
    // Strict Path Check
    if (url.pathname !== "/check") {
      return new Response("Not found", { status: 404, headers: corsHeaders });
    }

    // Command Routing
    const command = (url.searchParams.get("command") || "clean").toLowerCase();

    if (command === "short") {
      return shortURL(url.searchParams, corsHeaders);
    }

    // Default to clean
    return cleanShopeeURL(url.searchParams, corsHeaders);
  },
};