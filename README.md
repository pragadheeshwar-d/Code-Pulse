# CodePulse — Personal Coding Analytics Dashboard

> **Track. Solve. Grow.**  
> A production-ready coding progress aggregator and analytics platform that tracks, normalizes, and visualizes activity across **LeetCode**, **CodeChef**, **GeeksforGeeks**, and **Codeforces**.

[![CodePulse CI Pipeline](https://github.com/your-username/codepulse/actions/workflows/ci.yml/badge.svg)](https://github.com/your-username/codepulse/actions/workflows/ci.yml)
[![Cloudflare Pages](https://img.shields.io/badge/Cloudflare-Pages-F38020?logo=cloudflare&logoColor=white)](https://pages.cloudflare.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## Table of Contents
1. [Project Overview](#1-project-overview)
2. [Features](#2-features)
3. [Architecture](#3-architecture)
4. [Tech Stack](#4-tech-stack)
5. [Local Development Setup](#5-local-development-setup)
6. [Environment Variables](#6-environment-variables)
7. [Database Setup & Migrations](#7-database-setup--migrations)
8. [GitHub Actions CI/CD Workflows](#8-github-actions-cicd-workflows)
9. [Cloudflare Deployment](#9-cloudflare-deployment)
10. [REST API Documentation](#10-rest-api-documentation)
11. [Security Information](#11-security-information)
12. [Verification Suite](#12-verification-suite)
13. [Rollback Strategy](#13-rollback-strategy)

---

## 1. Project Overview

**CodePulse** aggregates authentic developer metrics across four leading competitive programming platforms into a unified developer dashboard. Users connect their accounts via public usernames (no third-party passwords required), while background workers synchronize activity, record historical snapshots, and generate actionable insights into problem-solving growth, difficulty distribution, DSA topic mastery, and contest ratings.

### Guiding Principles
* **Zero Mock / Synthetic Data**: Every metric displayed in the dashboard is either retrieved from live public platform APIs or calculated from stored historical snapshots.
* **True Continuous Time-Scale**: Growth charts maintain true daily cumulative baselines across all timeframes (7D, 30D, 3M, 6M, 1Y, All).
* **Multi-User Ready**: Native password hashing (`bcryptjs`) and JWT session security with multi-user relational database isolation.

---

## 2. Features

* **Unified Problem Catalog**: Centralizes 2,120+ solved problems with normalized difficulty ratings (Easy, Medium, Hard).
* **Streak & Activity Heatmap**: Accurate submission streak calculation (119-day longest streak, active days, and GitHub-style submission matrix).
* **DSA Topic Distribution**: Topic breakdown mapping across 16 core DSA categories (Arrays, Strings, Math, Greedy, Sorting, DP, Trees, Graphs, etc.).
* **Contest Tracking & Rating Deltas**: Historical rating tracking for Codeforces, CodeChef divisions, and LeetCode contest rankings.
* **Goal Setting & Milestones**: Custom target tracking for solved problems, active days, or contest ratings.
* **Sleek Dark UI**: High-contrast, responsive dashboard built with Tailwind CSS and Recharts.

---

## 3. Architecture

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

## 4. Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, Recharts, Lucide Icons |
| **Backend API** | Node.js 22+, Express, TypeScript, Zod, Helmet, Express-Rate-Limit |
| **Authentication** | JSON Web Tokens (`jsonwebtoken`), Password Hashing (`bcryptjs`) |
| **Database** | SQLite via native `node:sqlite`, WAL mode, Foreign Keys, Performance Indexes |
| **Infrastructure** | Cloudflare Pages, Cloudflare DNS, Cloudflare SSL/TLS, GitHub Actions |

---

## 5. Local Development Setup

### Prerequisites
* Node.js v22 or higher
* npm v10 or higher

### Installation
```bash
# Clone the repository
git clone https://github.com/your-username/codepulse.git
cd codepulse

# Install dependencies across all workspaces
npm run install:all

# Run database migrations
npm run migrate

# Start backend & frontend concurrently in development mode
npm run dev
```

* **Frontend**: `http://localhost:5173`
* **Backend API**: `http://localhost:5000`
* **Health Check**: `http://localhost:5000/health`

---

## 6. Environment Variables

Create `.env` files in root and subdirectories based on `.env.example`:

```env
# Server Runtime
NODE_ENV=production
PORT=5000

# Database
DATABASE_PATH=./data/codetrack.sqlite

# Security & Authentication
JWT_SECRET=generate_a_secure_random_key_min_32_characters

# CORS & Domain Routing
FRONTEND_URL=https://codepulse.yourdomain.com
BACKEND_URL=https://api.yourdomain.com
CORS_ORIGIN=https://codepulse.yourdomain.com

# GitHub Integration (Optional)
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
GITHUB_USERNAME=
```

---

## 7. Database Setup & Migrations

Database files are stored in `data/` using SQLite Write-Ahead Logging (`WAL`).

```bash
# Execute migration runner
npm run migrate

# Run database backup snapshot (Windows PowerShell)
.\database\backup.ps1

# Run database backup snapshot (Linux/macOS)
./database/backup.sh
```

---

## 8. GitHub Actions CI/CD Workflows

The repository contains three GitHub Actions workflows in `.github/workflows/`:

1. **`ci.yml`**: Triggers on PR and push to `main`/`master`. Installs dependencies, runs migrations, executes Vitest unit/integration tests, compiles TypeScript, and builds frontend distribution bundles.
2. **`deploy.yml`**: Builds and deploys frontend distribution to Cloudflare Pages and dispatches deployment triggers to the backend host.
3. **`security.yml`**: Scheduled weekly audit for dependencies and secret leak detection.

---

## 9. Cloudflare Deployment

### Frontend (Cloudflare Pages)
1. In Cloudflare Dashboard, navigate to **Workers & Pages** -> **Create application** -> **Pages** -> **Connect to Git**.
2. Select repository `codepulse`.
3. Set build configuration:
   * **Framework preset**: `Vite`
   * **Root directory**: `frontend`
   * **Build command**: `npm run build`
   * **Build output directory**: `dist`
4. Set Environment Variable: `VITE_API_URL` to `https://api.yourdomain.com/api` (or rely on `_redirects` proxy).
5. Click **Save and Deploy**.

### Cloudflare DNS & SSL Settings
* **Frontend**: CNAME `codepulse` -> `<project>.pages.dev` (Proxied - Orange Cloud).
* **API**: CNAME `api.codepulse` -> `<backend-host>` (Proxied - Orange Cloud).
* **SSL Mode**: **Full (strict)** with **Always Use HTTPS** enabled.

---

## 10. REST API Documentation

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/health` | Server health, uptime, and version status |
| `POST` | `/api/auth/register` | Register new user account with hashed password |
| `POST` | `/api/auth/login` | Authenticate and obtain JWT token |
| `GET` | `/api/auth/me` | Fetch active authenticated user profile |
| `GET` | `/api/profile` | Retrieve user profile & settings |
| `PATCH` | `/api/profile` | Update profile information and UI preferences |
| `GET` | `/api/platforms` | List connected coding platforms with live stats |
| `POST` | `/api/platforms/connect` | Connect a platform by username |
| `DELETE` | `/api/platforms/:platform` | Disconnect platform account |
| `POST` | `/api/sync` | Trigger synchronization across all platforms |
| `GET` | `/api/stats` | High-level summary metrics |
| `GET` | `/api/stats/history` | Continuous time-series progression data |
| `GET` | `/api/problems` | List tracked problems across platforms |
| `GET` | `/api/activity` | Heatmap daily activity frequencies |
| `GET` | `/api/goals` | Active and completed goals |
| `POST` | `/api/goals` | Create new target goal |
| `GET` | `/api/contests` | Historical contest participations and rating changes |
| `GET` | `/api/analytics` | Difficulty breakdown and DSA topic distribution |
| `GET` | `/api/streaks` | Direct streak & consistency metrics |
| `GET` | `/api/progress` | Growth timeline & distribution |
| `GET` | `/api/leetcode` | Direct LeetCode platform statistics |
| `GET` | `/api/codechef` | Direct CodeChef platform statistics |
| `GET` | `/api/gfg` | Direct GeeksforGeeks platform statistics |
| `GET` | `/api/codeforces` | Direct Codeforces platform statistics |
| `GET` | `/api/github` | Public GitHub profile activity & OAuth status |

---

## 11. Security Information

* **Authentication**: Password encryption via `bcryptjs` (salt factor 10) + JWT Bearer token sessions.
* **Rate Limiting**: Protects against brute-force logins (30 req / 15 min on `/api/auth`) and API abuse (600 req / 15 min).
* **Security Headers**: Configured via `helmet` and Cloudflare `_headers` (HSTS, X-Frame-Options: DENY, X-Content-Type-Options: nosniff).
* **Safe Platform Connections**: Third-party passwords are never collected; all platform collectors use public profiles and public APIs.
* **CORS**: Restricted strictly to authorized frontend origins.

---

## 12. Verification Suite

Run the automated verification suite to validate all 18 production criteria:
```bash
npm run verify
```

Validates:
* Root `/health` and `/api/health` 200 OK responses
* Helmet security headers (`X-Content-Type-Options`, `X-Frame-Options`)
* User registration, password hashing, and login authentication
* JWT Bearer token validation on protected endpoints
* Live platform statistics and zero-mock problem totals (2,120 problems)
* Dedicated domain endpoints (`/streaks`, `/progress`, `/leetcode`, `/codechef`, `/gfg`, `/codeforces`, `/github`)

---

## 13. Rollback Strategy

1. **Frontend Rollback**:
   * In Cloudflare Dashboard -> **Workers & Pages** -> **codepulse** -> **Deployments**.
   * Locate the last known healthy deployment and click **Rollback to this deployment**.
2. **Database Rollback**:
   * Restore previous backup snapshot from `database/backups/`:
     ```powershell
     Copy-Item database\backups\codepulse_backup_<timestamp>.sqlite data\codetrack.sqlite -Force
     ```
3. **Backend Rollback**:
   * In your hosting dashboard (e.g. Render / Railway), click **Rollback to previous commit**.

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
