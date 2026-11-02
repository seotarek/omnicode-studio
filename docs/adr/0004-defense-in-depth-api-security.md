# ADR 0004: Defense-in-Depth REST API Security

## Status
Accepted

## Context
Public or self-hosted code generation APIs are vulnerable to SSRF (via user-supplied logo URLs), SVG injection/XSS (via malformed text/styles), and Denial of Service (via excessive dimensions or massive payloads).

## Decision
Implement multiple layers of security enforcement in `packages/api`:
1. **OWASP HTTP Headers**: `nosniff`, `DENY`, `strict-origin-when-cross-origin`, and `HSTS`.
2. **SSRF Guard**: Strict rejection of non-HTTP(S) protocols, private IPv4/IPv6 ranges (RFC 1918, 127.0.0.0/8), cloud metadata endpoints (169.254.169.254), and localhost hostnames.
3. **Input Bounds Enforcement**: 4096-character payload ceilings, strict bounds on width, height, and margins.
4. **Rate Limiting & Authentication**: Sliding-window rate limit store and optional API key enforcement via `x-api-key` or `Authorization: Bearer`.
5. **No Stack Trace Disclosure**: Uniform error responses returning clean error messages without leaking stack traces.
