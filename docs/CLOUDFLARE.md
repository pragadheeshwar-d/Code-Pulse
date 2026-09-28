# Cloudflare Configuration Guide for CodePulse

---

## 1. Cloudflare DNS & Custom Domains

| Record Type | Name | Target / Content | Proxy Status |
| :--- | :--- | :--- | :--- |
| **CNAME** | `codepulse` | `<project>.pages.dev` | Proxied (Orange Cloud) |
| **CNAME** | `api.codepulse` | `<backend-host-url>` | Proxied (Orange Cloud) |

* Ensure **Proxied (Orange Cloud)** is active to enable Cloudflare CDN caching, DDoS protection, and SSL termination.

---

## 2. SSL/TLS Settings
1. Go to **SSL/TLS** in the Cloudflare Dashboard.
2. Select **Full (strict)** encryption mode.
3. Enable **Always Use HTTPS** to automatically redirect `http://` requests to `https://`.
4. Enable **Automatic HTTPS Rewrites**.
5. Enable **Minimum TLS Version**: `TLS 1.2` or `TLS 1.3`.

---

## 3. Caching Strategy
* **Static Assets** (`/assets/*`): Cloudflare caches fingerprinted `.js`, `.css`, and `.svg` files at the edge with 1-year cache headers (`Cache-Control: public, max-age=31536000, immutable`).
* **HTML & API**:
  * `index.html` has `Cache-Control: public, max-age=0, must-revalidate` to ensure updates roll out instantly.
  * `/api/*` requests bypass edge cache (`Cache-Control: no-store, no-cache`) to ensure real-time dynamic stats.

---

## 4. Optional: Cloudflare Zero Trust Access
To restrict dashboard access to authorized team members without code changes:
1. Go to **Cloudflare Zero Trust** -> **Access** -> **Applications**.
2. Click **Add an application** -> **Self-hosted**.
3. Set domain to `codepulse.yourdomain.com`.
4. Add policy: **Action: Allow**, **Include: Emails** (e.g. `your-email@gmail.com`).
