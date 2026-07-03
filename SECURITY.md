# Security Policy

## Supported Versions

| Version | Supported |
|---------|-----------|
| 1.x     | ✅         |
| < 1.0   | ❌         |

## Reporting a Vulnerability

**Do NOT open a public issue for security vulnerabilities.**

Instead, please email **security@pairprep.dev** (or the repository owner directly) with:

1. Description of the vulnerability
2. Steps to reproduce
3. Potential impact assessment
4. Suggested fix (if any)

You will receive an acknowledgment within **48 hours** and a detailed response within **5 business days**.

## Security Practices

PairPrep follows these security practices:

- **Authentication:** BCrypt password hashing (cost factor 12), JWT in HTTP-only secure cookies
- **Authorization:** Ownership-based access control on all mutation endpoints
- **Input Validation:** Jakarta Bean Validation on all API inputs; Zod validation on frontend
- **Transport:** HTTPS only, HSTS headers, secure cookie flags
- **Secrets:** No secrets in source code; all credentials via environment variables
- **Dependencies:** Automated dependency vulnerability scanning in CI
- **Data Privacy:** Emails never exposed publicly; feedback text visible only to reviewee

## Disclosure Policy

We follow responsible disclosure. Once a fix is deployed, we will:

1. Credit the reporter (unless they prefer anonymity)
2. Publish a security advisory
3. Tag a new release with the fix
