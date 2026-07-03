# ADR-002: JWT Authentication with HTTP-Only Cookies

**Date:** 2026-05-21
**Status:** Accepted

## Context

PairPrep needs stateless authentication that works across Vercel (frontend) and Oracle VM (backend) without shared session storage. V1 has no Redis.

## Decision

Use JWT access tokens (15 min TTL, HS256) stored in HTTP-only secure cookies. Refresh tokens (7 days, opaque random string) stored as SHA-256 hashes in PostgreSQL. Token rotation on every refresh.

## Consequences

**Positive:**
- Stateless — any backend instance can validate tokens
- No Redis dependency — refresh tokens in PostgreSQL
- XSS-resistant — HTTP-only cookies inaccessible to JavaScript
- Short access token TTL limits exposure window

**Negative:**
- Access tokens valid up to 15 min after logout (acceptable for this product)
- Refresh token validation hits DB (acceptable at MVP scale)
- HS256 requires shared secret (RS256 if we add token-verifying services later)

**Upgrade path:** RS256 + Redis-backed blacklist when adding multiple services or Redis becomes available.
