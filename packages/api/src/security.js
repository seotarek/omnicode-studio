import net from "net";

/**
 * Validates whether a given URL is prohibited to prevent SSRF vulnerabilities.
 * Blocks non-http/https protocols, localhost, private IP ranges, link-local IPs,
 * carrier-grade NAT, and cloud metadata services.
 */
export function isProhibitedUrl(urlString) {
  if (!urlString || typeof urlString !== "string") {
    return true;
  }
  let parsed;
  try {
    parsed = new URL(urlString);
  } catch {
    return true;
  }

  // Only allow http and https protocols
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return true;
  }

  let hostname = parsed.hostname.toLowerCase();

  // Strip brackets from IPv6 hostnames like [::1]
  if (hostname.startsWith("[") && hostname.endsWith("]")) {
    hostname = hostname.slice(1, -1);
  }

  // Block localhost, local domains, and known cloud metadata hosts
  if (
    hostname === "localhost" ||
    hostname.endsWith(".localhost") ||
    hostname.endsWith(".local") ||
    hostname.endsWith(".internal") ||
    hostname === "metadata.google.internal"
  ) {
    return true;
  }

  // Check if hostname is an IP address
  const ipVersion = net.isIP(hostname);
  if (ipVersion === 4) {
    const parts = hostname.split(".").map(Number);
    // 0.0.0.0/8
    if (parts[0] === 0) return true;
    // 127.0.0.0/8 (Loopback)
    if (parts[0] === 127) return true;
    // 10.0.0.0/8 (Private class A)
    if (parts[0] === 10) return true;
    // 172.16.0.0/12 (Private class B)
    if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;
    // 192.168.0.0/16 (Private class C)
    if (parts[0] === 192 && parts[1] === 168) return true;
    // 169.254.0.0/16 (Link-local / Cloud metadata: 169.254.169.254)
    if (parts[0] === 169 && parts[1] === 254) return true;
    // 100.64.0.0/10 (Shared address space / Carrier-grade NAT)
    if (parts[0] === 100 && parts[1] >= 64 && parts[1] <= 127) return true;
  } else if (ipVersion === 6) {
    // ::1 (IPv6 loopback)
    if (hostname === "::1" || hostname === "0:0:0:0:0:0:0:1") return true;
    // fe80::/10 (IPv6 link-local)
    if (hostname.startsWith("fe80:") || hostname.startsWith("fe8") || hostname.startsWith("fe9") || hostname.startsWith("fea") || hostname.startsWith("feb")) return true;
    // fc00::/7 (IPv6 Unique Local Address)
    if (hostname.startsWith("fc") || hostname.startsWith("fd")) return true;
  }

  // Check integer/hex encoded IPs (e.g. 2130706433 or 0x7f000001)
  if (/^\d+$/.test(hostname)) {
    return true;
  }
  if (/^0x[0-9a-fA-F]+$/.test(hostname)) {
    return true;
  }

  return false;
}

/**
 * Security headers middleware enforcing OWASP defense-in-depth headers.
 */
export function securityHeaders(req, res, next) {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  if (process.env.NODE_ENV === "production") {
    res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  }
  next();
}

/**
 * In-memory store for rate limiting with sliding reset windows.
 */
export class MemoryRateLimitStore {
  constructor(windowMs) {
    this.requests = new Map();
    this.interval = setInterval(() => {
      const now = Date.now();
      for (const [key, data] of this.requests.entries()) {
        if (now > data.resetTime) {
          this.requests.delete(key);
        }
      }
    }, Math.min(windowMs, 60000));
    if (this.interval.unref) this.interval.unref();
  }

  async increment(key, windowMs) {
    const now = Date.now();
    let record = this.requests.get(key);
    if (!record || now > record.resetTime) {
      record = { count: 1, resetTime: now + windowMs };
      this.requests.set(key, record);
    } else {
      record.count++;
    }
    return record;
  }
}

/**
 * Creates a rate limiter middleware with pluggable store support (memory or distributed).
 */
export function createRateLimiter({
  windowMs = 15 * 60 * 1000,
  max = 100,
  store = null,
  message = "Too many requests. Please try again later."
} = {}) {
  const activeStore = store || new MemoryRateLimitStore(windowMs);

  return async function rateLimitMiddleware(req, res, next) {
    // Bypass health, metrics, and spec endpoints
    if (req.path === "/health" || req.path === "/metrics" || req.path === "/api/v1/spec") {
      return next();
    }

    const ip = req.ip || req.headers["x-forwarded-for"] || req.socket.remoteAddress || "unknown";
    const now = Date.now();

    const record = await activeStore.increment(ip, windowMs);
    const remaining = Math.max(0, max - record.count);
    const resetSeconds = Math.ceil(record.resetTime / 1000);
    const retryAfter = Math.ceil((record.resetTime - now) / 1000);

    res.setHeader("X-RateLimit-Limit", max);
    res.setHeader("X-RateLimit-Remaining", remaining);
    res.setHeader("X-RateLimit-Reset", resetSeconds);

    if (record.count > max) {
      res.setHeader("Retry-After", retryAfter);
      return res.status(429).json({
        success: false,
        error: message
      });
    }

    next();
  };
}

/**
 * API key authentication middleware.
 * Enforces authentication if process.env.API_KEY is configured OR process.env.API_KEY_REQUIRED === "true".
 * Requests must provide matching 'x-api-key' or 'Authorization: Bearer <key>' headers.
 */
export function apiKeyAuth(req, res, next) {
  if (req.path === "/health" || req.path === "/metrics" || req.path === "/api/v1/spec") {
    return next();
  }

  const expectedKey = process.env.API_KEY;
  const isRequired = process.env.API_KEY_REQUIRED === "true" || (Boolean(expectedKey) && expectedKey.trim().length > 0);

  if (!isRequired) {
    return next();
  }

  const apiKeyHeader = req.headers["x-api-key"];
  const authHeader = req.headers["authorization"];
  let providedKey = apiKeyHeader;

  if (!providedKey && authHeader && authHeader.startsWith("Bearer ")) {
    providedKey = authHeader.slice(7).trim();
  }

  if (!providedKey || providedKey !== expectedKey) {
    return res.status(401).json({
      success: false,
      error: "Unauthorized: Invalid or missing API key"
    });
  }

  next();
}

