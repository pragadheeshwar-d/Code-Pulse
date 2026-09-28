# CodePulse Security Architecture & Policies

---

## 1. Security Architecture Highlights

* **No Third-Party Passwords**: Platform integrations (LeetCode, Codeforces, CodeChef, GeeksforGeeks) operate exclusively via public handles and public GraphQL/REST APIs. Passwords to external platforms are never requested or stored.
* **Password Hashing**: User authentication passwords are encrypted using `bcryptjs` with salt rounds = 10 (or Argon2 equivalent).
* **JWT Session Tokens**: Standard JWT bearer tokens signed with strong secrets (`JWT_SECRET`) and standard expiration periods.
* **Rate Limiting**:
  * General API: 600 requests per 15-minute window per IP.
  * Authentication Endpoints: 30 attempts per 15-minute window per IP to eliminate credential stuffing and brute force attempts.
* **HTTP Security Headers (Helmet + Cloudflare)**:
  * `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`
  * `X-Content-Type-Options: nosniff`
  * `X-Frame-Options: DENY`
  * `Referrer-Policy: strict-origin-when-cross-origin`
  * `Permissions-Policy: camera=(), microphone=(), geolocation=()`
* **Structured Error Redaction**: In production (`NODE_ENV=production`), server stack traces and internal exceptions are suppressed.
* **CORS Restrictions**: API requests from unauthorized origins are rejected.
