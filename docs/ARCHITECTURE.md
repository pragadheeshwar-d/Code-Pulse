# CodePulse Architecture Overview

> **Tagline**: Track. Solve. Grow.  
> **Mission**: A high-performance, developer-first coding progress aggregator and analytics platform for LeetCode, CodeChef, GeeksforGeeks, and Codeforces.

---

## 1. System Topology

```text
                    ┌──────────────────────────────┐
                    │       GitHub Repository      │
                    │   Source Code & Workflows    │
                    └──────────────┬───────────────┘
                                   │
                                   ▼
                    ┌──────────────────────────────┐
                    │    GitHub Actions (CI/CD)    │
                    │ Build, Test, Security, Deploy│
                    └──────────────┬───────────────┘
                                   │
                    ┌──────────────▼───────────────┐
                    │       Cloudflare CDN         │
                    │ DNS • SSL/TLS • Edge Caching │
                    │ Security Headers • DDoS Prot │
                    └──────────────┬───────────────┘
                                   │
            ┌──────────────────────┴──────────────────────┐
            ▼                                             ▼
┌──────────────────────────────┐            ┌──────────────────────────────┐
│  Cloudflare Pages (Frontend) │            │   Production Backend API     │
│   • Vite + React 18 + TS     │            │   • Node.js 22+ / Express    │
│   • Tailwind CSS             │            │   • Helmet & Rate Limiting   │
│   • Recharts & Lucide        │            │   • JWT Auth & bcryptjs      │
│   • _headers & _redirects    │            │   • Periodic Cron Sync       │
└──────────────┬───────────────┘            └──────────────┬───────────────┘
               │                                           │
               │         /api/* Proxy (CORS-Safe)          │
               └───────────────────────────────────────────┤
                                                           ▼
                                            ┌──────────────────────────────┐
                                            │      Production Database     │
                                            │   • SQLite with WAL mode     │
                                            │   • Relational Foreign Keys  │
                                            │   • Performance Indexes      │
                                            └──────────────────────────────┘
```

---

## 2. Component Responsibilities

### Frontend (`/frontend`)
* **Framework**: React 18 + Vite + TypeScript.
* **Styling**: Tailwind CSS with sleek dark theme palette (`#090d16` background, `#101726` surface cards).
* **State Management**: Reactive state hooks with automatic JWT token attachment via `api.ts`.
* **Zero Mock Policy**: UI displays authentic live numbers computed directly from synced database records.

### Backend Engine (`/backend`)
* **Runtime**: Node.js 22+ utilizing native `node:sqlite` for zero-overhead SQLite operations.
* **Collectors**:
  * `LeetCodeCollector`: GraphQL queries to `leetcode.com/graphql` for user contest ranking and submission calendar.
  * `CodeChefCollector`: Profile scraping and API endpoints for division, rating, and 164+ daily submission activity.
  * `GeeksforGeeksCollector`: User profile API (`practiceapi.geeksforgeeks.org`) parsing verified solved counts.
  * `CodeforcesCollector`: Official REST API (`codeforces.com/api/user.info` and `user.rating`) for contest ratings and ranks.
  * `GitHub`: Public events API integration with OAuth capability.
* **Security & Auth**:
  * Password hashing via `bcryptjs` (salt rounds: 10).
  * JWT session tokens with standard 7-day expiration.
  * Helmet security headers and IP rate limiting (General API: 600 req/15 min; Auth: 30 req/15 min).
  * Structured error handler concealing stack traces in production.

### Database Layer (`/database`)
* **Engine**: SQLite in Write-Ahead Logging (`WAL`) mode with `foreign_keys = ON`.
* **Migrations**: Automated runner (`database/migrations/migrate.js`) applying versioned SQL scripts.
* **Backups**: Shell (`backup.sh`) and PowerShell (`backup.ps1`) scripts for continuous snapshots.
